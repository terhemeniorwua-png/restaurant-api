'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { getUser, isLoggedIn } from '@/lib/auth';

function NewOrderForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const preselectId  = searchParams.get('item');

  const [items, setItems]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat]   = useState('');
  const [cart, setCart]             = useState({});
  const [notes, setNotes]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    loadInit();
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadInit() {
    try {
      const [catRes, itemRes] = await Promise.all([api.getCategories(), api.getMenuItems()]);
      if (catRes.ok)  setCategories(catRes.data.data);
      if (itemRes.ok) {
        setItems(itemRes.data.data);
        if (preselectId) {
          const found = itemRes.data.data.find(i => String(i.id) === preselectId);
          if (found) {
            setCart({ [found.id]: { name: found.name, price: parseFloat(found.price), quantity: 1 } });
          }
        }
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function loadItems(catId) {
    setLoading(true);
    try {
      const { ok, data } = await api.getMenuItems(catId || undefined);
      if (ok) setItems(data.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  function handleFilter(catId) {
    setActiveCat(catId);
    loadItems(catId);
  }

  function setQty(item, qty) {
    const q = Math.max(0, qty);
    if (q === 0) {
      setCart(prev => { const next = { ...prev }; delete next[item.id]; return next; });
    } else {
      setCart(prev => ({ ...prev, [item.id]: { name: item.name, price: parseFloat(item.price), quantity: q } }));
    }
  }

  function removeFromCart(id) {
    setCart(prev => { const next = { ...prev }; delete next[id]; return next; });
  }

  const cartEntries  = Object.entries(cart);
  const cartTotal    = cartEntries.reduce((s, [, i]) => s + i.price * i.quantity, 0);
  const cartHasItems = cartEntries.length > 0;

  async function placeOrder() {
    setError('');
    if (!cartHasItems) { setError('Add at least one item to the order.'); return; }

    const user = getUser();
    setSubmitting(true);
    try {
      const { ok, data } = await api.createOrder({
        user_id: user?.id ?? null,
        notes:   notes.trim() || null,
        items:   cartEntries.map(([id, item]) => ({
          menu_item_id: Number(id),
          quantity:     item.quantity,
        })),
      });

      if (!ok) { setError(data.message || 'Failed to place order.'); return; }

      setSuccess(`Order #${data.data.id} placed successfully! Redirecting…`);
      setCart({});
      setNotes('');
      setTimeout(() => router.push('/orders'), 1800);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setSubmitting(false);
    }
  }

  const fmtPrice = (p) => Number(p).toLocaleString('en-NG', { minimumFractionDigits: 2 });

  const visibleItems = activeCat
    ? items.filter(i => String(i.category_id) === String(activeCat))
    : items;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h2 className="text-2xl font-bold text-[#1a1a2e]">🛒 Create New Order</h2>
        <Link href="/orders" className="border border-[#e85d04] text-[#e85d04] hover:bg-orange-50 font-semibold px-4 py-2 rounded-lg text-sm transition-colors no-underline">
          View All Orders
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-5">{success}</div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Menu picker ─── */}
        <div className="flex-1 min-w-0">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-5">
            {[{ id: '', name: 'All' }, ...categories].map(cat => (
              <button key={cat.id} onClick={() => handleFilter(cat.id)}
                className={`px-4 py-1.5 rounded-full border text-sm transition-all cursor-pointer ${
                  activeCat === cat.id
                    ? 'bg-[#e85d04] border-[#e85d04] text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-[#e85d04] hover:text-[#e85d04]'
                }`}
              >{cat.name}</button>
            ))}
          </div>

          {loading ? (
            <p className="text-gray-400 text-center py-16">Loading menu…</p>
          ) : visibleItems.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No items in this category.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {visibleItems.map(item => {
                const qty = cart[item.id]?.quantity ?? 0;
                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3">
                    <div>
                      <span className="inline-block bg-orange-50 text-[#e85d04] text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide mb-1">
                        {item.category?.name ?? 'Uncategorised'}
                      </span>
                      <h3 className="font-bold text-[#1a1a2e] text-sm">{item.name}</h3>
                      <p className="text-gray-400 text-xs line-clamp-1 mt-0.5">{item.description || ''}</p>
                      <p className="text-[#e85d04] font-bold mt-1">₦{fmtPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button onClick={() => setQty(item, qty - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer text-lg">−</button>
                        <input type="number" min="0" value={qty}
                          onChange={e => setQty(item, parseInt(e.target.value) || 0)}
                          className="w-10 text-center text-sm border-x border-gray-300 h-8 focus:outline-none" />
                        <button onClick={() => setQty(item, qty + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer text-lg">+</button>
                      </div>
                      <button onClick={() => setQty(item, qty > 0 ? qty : 1)}
                        className={`flex-1 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                          qty > 0 ? 'bg-gray-400 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >{qty > 0 ? '✓ Added' : '🛒 Add'}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Cart sidebar ─── */}
        <div className="lg:w-80 w-full bg-white rounded-xl shadow-sm p-5 lg:sticky lg:top-[76px]">
          <h3 className="font-bold text-[#1a1a2e] mb-4 pb-3 border-b border-gray-100">🧾 Order Summary</h3>

          {cartHasItems ? (
            <>
              <div className="space-y-2 mb-4">
                {cartEntries.map(([id, item]) => (
                  <div key={id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex-1 font-medium truncate">{item.name}</span>
                    <span className="text-gray-500 text-xs">×{item.quantity}</span>
                    <span className="font-bold text-[#e85d04] whitespace-nowrap">₦{fmtPrice(item.price * item.quantity)}</span>
                    <button onClick={() => removeFromCart(id)}
                      className="text-red-400 hover:text-red-600 text-sm cursor-pointer bg-transparent border-none p-0">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-base border-t-2 border-gray-100 pt-3 mb-4">
                <span>Total</span>
                <span className="text-[#e85d04]">₦{fmtPrice(cartTotal)}</span>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">
              No items added yet.<br />Click <strong>Add</strong> on any item.
            </p>
          )}

          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">Notes (optional)</label>
            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any special requests…" rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e85d04] resize-none transition-colors" />
          </div>

          <button onClick={placeOrder} disabled={!cartHasItems || submitting}
            className="w-full bg-[#e85d04] hover:bg-[#c44d00] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
            {submitting ? 'Placing order…' : 'Place Order'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400">Loading…</div>}>
      <NewOrderForm />
    </Suspense>
  );
}
