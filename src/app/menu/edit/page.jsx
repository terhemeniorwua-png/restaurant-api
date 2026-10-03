'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';

function EditMenuItemForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const editId       = searchParams.get('id');
  const isEdit       = !!editId;

  const [form, setForm]             = useState({ name: '', description: '', price: '', category_id: '', is_available: true });
  const [categories, setCategories] = useState([]);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [fetching, setFetching]     = useState(isEdit);

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    loadCategories();
    if (isEdit) loadItem();
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadCategories() {
    try {
      const { ok, data } = await api.getCategories();
      if (ok) setCategories(data.data);
    } catch { /* ignore */ }
  }

  async function loadItem() {
    setFetching(true);
    try {
      const { ok, data } = await api.getMenuItem(editId);
      if (!ok) { setError('Item not found.'); return; }
      const item = data.data;
      setForm({
        name:         item.name,
        description:  item.description || '',
        price:        item.price,
        category_id:  item.category_id,
        is_available: item.is_available,
      });
    } catch {
      setError('Could not load item data.');
    } finally {
      setFetching(false);
    }
  }

  function update(field) {
    return (e) => {
      const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm(prev => ({ ...prev, [field]: val }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim())      { setError('Item name is required.');    return; }
    if (!form.price)            { setError('Price is required.');        return; }
    if (!form.category_id)      { setError('Please select a category.'); return; }
    if (Number(form.price) < 0) { setError('Price cannot be negative.'); return; }

    setLoading(true);
    const body = {
      name:         form.name.trim(),
      description:  form.description.trim() || null,
      price:        Number(form.price),
      category_id:  Number(form.category_id),
      is_available: form.is_available,
    };

    try {
      const { ok, data } = isEdit
        ? await api.updateMenuItem(editId, body)
        : await api.createMenuItem(body);

      if (!ok) { setError(data.message || 'Failed to save item.'); return; }

      setSuccess(isEdit ? 'Item updated successfully!' : 'Item created successfully!');
      setTimeout(() => router.push('/menu'), 1400);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h2 className="text-2xl font-bold text-[#1a1a2e]">
          {isEdit ? '✏️ Edit Menu Item' : '✏️ Add Menu Item'}
        </h2>
        <Link href="/menu" className="border border-[#e85d04] text-[#e85d04] hover:bg-orange-50 font-semibold px-4 py-2 rounded-lg text-sm transition-colors no-underline">
          ← Back to Menu
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-5">{success}</div>
        )}

        {fetching ? (
          <p className="text-gray-400 text-center py-8">Loading item data…</p>
        ) : (
          <form onSubmit={handleSubmit} noValidate>

            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input id="name" type="text" value={form.name} onChange={update('name')}
                placeholder="e.g. Classic Beef Burger" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#e85d04] transition-colors" />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">Description</label>
              <textarea id="description" value={form.description} onChange={update('description')}
                placeholder="Short description…" rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#e85d04] transition-colors resize-y" />
            </div>

            <div className="mb-4">
              <label htmlFor="price" className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">
                Price (₦) <span className="text-red-500">*</span>
              </label>
              <input id="price" type="number" min="0" step="0.01" value={form.price} onChange={update('price')}
                placeholder="e.g. 2500" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#e85d04] transition-colors" />
            </div>

            <div className="mb-4">
              <label htmlFor="category_id" className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select id="category_id" value={form.category_id} onChange={update('category_id')} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#e85d04] transition-colors bg-white">
                <option value="">— Select a category —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-[#1a1a2e]">
                <input type="checkbox" checked={form.is_available} onChange={update('is_available')}
                  className="accent-[#e85d04] w-4 h-4" />
                Available for ordering
              </label>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="flex-1 bg-[#e85d04] hover:bg-[#c44d00] text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 cursor-pointer">
                {loading ? (isEdit ? 'Updating…' : 'Saving…') : (isEdit ? 'Update Item' : 'Save Item')}
              </button>
              <Link href="/menu"
                className="flex-1 text-center border border-[#e85d04] text-[#e85d04] hover:bg-orange-50 font-semibold py-2.5 rounded-lg transition-colors no-underline">
                Cancel
              </Link>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}

export default function EditMenuItemPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400">Loading…</div>}>
      <EditMenuItemForm />
    </Suspense>
  );
}
