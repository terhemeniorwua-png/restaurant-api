'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';

function ConfirmModal({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-sm w-[90%] shadow-2xl text-center">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </button>
          <button
            onClick={onCancel}
            className="border border-[#e85d04] text-[#e85d04] hover:bg-orange-50 font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const router = useRouter();

  const [items, setItems]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [modal, setModal]         = useState({ open: false, id: null, name: '', busy: false });

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    loadCategories();
    loadItems('');
  }, [router]);

  async function loadCategories() {
    try {
      const { ok, data } = await api.getCategories();
      if (ok) setCategories(data.data);
    } catch { /* ignore */ }
  }

  const loadItems = useCallback(async (catId) => {
    setLoading(true);
    setError('');
    try {
      const { ok, data } = await api.getMenuItems(catId || undefined);
      if (!ok) { setError(data.message || 'Failed to load menu items.'); return; }
      setItems(data.data);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  function handleFilter(catId) {
    setActiveCat(catId);
    loadItems(catId);
  }

  async function confirmDelete() {
    setModal(m => ({ ...m, busy: true }));
    try {
      const { ok, data } = await api.deleteMenuItem(modal.id);
      if (!ok) {
        setError(data.message || 'Delete failed.');
      } else {
        setSuccess('Item deleted successfully.');
        setItems(prev => prev.filter(i => i.id !== modal.id));
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setModal({ open: false, id: null, name: '', busy: false });
    }
  }

  const fmtPrice = (p) => Number(p).toLocaleString('en-NG', { minimumFractionDigits: 2 });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* Page heading */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h2 className="text-2xl font-bold text-[#1a1a2e]">🍔 Menu Items</h2>
        <Link
          href="/menu/edit"
          className="bg-[#e85d04] hover:bg-[#c44d00] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors no-underline"
        >
          + Add Item
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-5">
          {success}
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[{ id: '', name: 'All' }, ...categories].map(cat => (
          <button
            key={cat.id}
            onClick={() => handleFilter(cat.id)}
            className={`px-4 py-1.5 rounded-full border text-sm transition-all cursor-pointer ${
              activeCat === cat.id
                ? 'bg-[#e85d04] border-[#e85d04] text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:border-[#e85d04] hover:text-[#e85d04]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <p className="text-gray-400 text-center py-16">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No menu items found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <div className="p-4 flex-1">
                <span className="inline-block bg-orange-50 text-[#e85d04] text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wide mb-2">
                  {item.category?.name ?? 'Uncategorised'}
                </span>
                <h3 className="font-bold text-[#1a1a2e] mb-1">{item.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                  {item.description || 'No description.'}
                </p>
                <p className="text-[#e85d04] font-bold text-lg mt-3">₦{fmtPrice(item.price)}</p>
              </div>

              <div className="flex gap-2 px-4 py-3 border-t border-gray-100 flex-wrap">
                <Link
                  href={`/menu/edit?id=${item.id}`}
                  className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors no-underline"
                >
                  ✏️ Edit
                </Link>
                <button
                  onClick={() => setModal({ open: true, id: item.id, name: item.name, busy: false })}
                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  🗑️ Delete
                </button>
                <Link
                  href={`/orders/new?item=${item.id}`}
                  className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors no-underline"
                >
                  🛒 Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={modal.open}
        title="Delete Menu Item?"
        message={`Delete "${modal.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setModal({ open: false, id: null, name: '', busy: false })}
        loading={modal.busy}
      />
    </div>
  );
}
