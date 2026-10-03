'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';

const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

const badgeClass = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-700',
  ready:     'bg-teal-100 text-teal-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function StatusModal({ open, orderId, currentStatus, onConfirm, onCancel }) {
  const [selected, setSelected] = useState(currentStatus);
  const [busy, setBusy]         = useState(false);

  useEffect(() => { setSelected(currentStatus); }, [currentStatus]);

  if (!open) return null;

  async function handleConfirm() {
    setBusy(true);
    await onConfirm(selected);
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-sm w-[90%] shadow-2xl">
        <h3 className="text-lg font-bold mb-1">Update Order Status</h3>
        <p className="text-gray-500 text-sm mb-4">Order <strong>#{orderId}</strong></p>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#e85d04] bg-white mb-5"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={busy}
            className="flex-1 bg-[#e85d04] hover:bg-[#c44d00] text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
          >
            {busy ? 'Updating…' : 'Update'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-[#e85d04] text-[#e85d04] hover:bg-orange-50 font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ open, orderId, onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  async function handleConfirm() {
    setBusy(true);
    await onConfirm();
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-sm w-[90%] shadow-2xl text-center">
        <h3 className="text-lg font-bold mb-2">Delete Order?</h3>
        <p className="text-gray-500 text-sm mb-6">
          Delete Order <strong>#{orderId}</strong>? This will permanently remove the order and all its items.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleConfirm}
            disabled={busy}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
          >
            {busy ? 'Deleting…' : 'Yes, Delete'}
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

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders]         = useState([]);
  const [activeStatus, setActive]   = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [statusModal, setStatusModal] = useState({ open: false, id: null, status: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    loadOrders();
  }, [router]);

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const { ok, data } = await api.getOrders();
      if (!ok) { setError(data.message || 'Failed to load orders.'); return; }
      setOrders(data.data);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(newStatus) {
    try {
      const { ok, data } = await api.updateOrder(statusModal.id, { status: newStatus });
      if (!ok) { setError(data.message || 'Update failed.'); }
      else {
        setSuccess(`Order #${statusModal.id} status updated to "${newStatus}".`);
        setOrders(prev => prev.map(o => o.id === statusModal.id ? { ...o, status: newStatus } : o));
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setStatusModal({ open: false, id: null, status: '' });
    }
  }

  async function handleDelete() {
    try {
      const { ok, data } = await api.deleteOrder(deleteModal.id);
      if (!ok) { setError(data.message || 'Delete failed.'); }
      else {
        setSuccess(`Order #${deleteModal.id} deleted.`);
        setOrders(prev => prev.filter(o => o.id !== deleteModal.id));
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setDeleteModal({ open: false, id: null });
    }
  }

  const fmtPrice = (p) => Number(p).toLocaleString('en-NG', { minimumFractionDigits: 2 });
  const fmtDate  = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const filtered = activeStatus ? orders.filter(o => o.status === activeStatus) : orders;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h2 className="text-2xl font-bold text-[#1a1a2e]">🧾 All Orders</h2>
        <Link
          href="/orders/new"
          className="bg-[#e85d04] hover:bg-[#c44d00] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors no-underline"
        >
          + New Order
        </Link>
      </div>

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

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[{ value: '', label: 'All' }, ...STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActive(value)}
            className={`px-4 py-1.5 rounded-full border text-sm transition-all cursor-pointer ${
              activeStatus === value
                ? 'bg-[#e85d04] border-[#e85d04] text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:border-[#e85d04] hover:text-[#e85d04]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-16">Loading orders…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-sm">
          <table className="w-full text-sm bg-white">
            <thead>
              <tr className="bg-gray-50 text-left">
                {['#', 'Customer', 'Items', 'Total', 'Status', 'Notes', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-[#1a1a2e]">#{order.id}</td>
                  <td className="px-4 py-3">{order.user?.name ?? <span className="text-gray-400">Guest</span>}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-500 leading-relaxed">
                      {order.orderItems?.length
                        ? order.orderItems.map(i => `${i.menuItem?.name ?? '?'} ×${i.quantity}`).join(', ')
                        : '—'
                      }
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#e85d04] whitespace-nowrap">₦{fmtPrice(order.total_price)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${badgeClass[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-[120px] truncate">{order.notes || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => setStatusModal({ open: true, id: order.id, status: order.status })}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        📋 Status
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, id: order.id })}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <StatusModal
        open={statusModal.open}
        orderId={statusModal.id}
        currentStatus={statusModal.status}
        onConfirm={handleStatusUpdate}
        onCancel={() => setStatusModal({ open: false, id: null, status: '' })}
      />
      <DeleteModal
        open={deleteModal.open}
        orderId={deleteModal.id}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null })}
      />
    </div>
  );
}
