'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getUser, isLoggedIn } from '@/lib/auth';

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center gap-1">
      <div className="text-3xl">{icon}</div>
      <div className="text-3xl font-bold text-[#e85d04]">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  );
}

function NavCard({ href, icon, title, description }) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center gap-2 hover:-translate-y-1 transition-transform no-underline text-gray-800"
    >
      <div className="text-4xl">{icon}</div>
      <h3 className="font-bold text-[#1a1a2e]">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </Link>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser]     = useState(null);
  const [stats, setStats]   = useState({ menuItems: '—', categories: '—', orders: '—', pending: '—' });

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    setUser(getUser());

    (async () => {
      try {
        const [menuRes, catRes, ordersRes] = await Promise.all([
          api.getMenuItems(),
          api.getCategories(),
          api.getOrders(),
        ]);
        setStats({
          menuItems:  menuRes.ok  ? menuRes.data.data.length  : '—',
          categories: catRes.ok   ? catRes.data.data.length   : '—',
          orders:     ordersRes.ok ? ordersRes.data.data.length : '—',
          pending:    ordersRes.ok
            ? ordersRes.data.data.filter(o => o.status === 'pending').length
            : '—',
        });
      } catch { /* stats stay as — */ }
    })();
  }, [router]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1a1a2e]">
          Welcome back, <span className="text-[#e85d04]">{user?.name ?? '…'}</span> 👋
        </h2>
        <p className="text-gray-500 mt-1 text-sm">Here&apos;s a quick overview of your restaurant system.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard icon="🍔" value={stats.menuItems}  label="Menu Items"     />
        <StatCard icon="🗂️" value={stats.categories} label="Categories"    />
        <StatCard icon="🧾" value={stats.orders}     label="Total Orders"  />
        <StatCard icon="⏳" value={stats.pending}    label="Pending Orders"/>
      </div>

      {/* Quick access */}
      <h3 className="text-lg font-bold text-[#1a1a2e] mb-4">Quick Access</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <NavCard href="/menu"        icon="🍔" title="View Menu"      description="Browse, edit and delete menu items." />
        <NavCard href="/orders/new"  icon="🛒" title="New Order"      description="Select items and quantities to place an order." />
        <NavCard href="/orders"      icon="🧾" title="View Orders"    description="See all existing orders and their details." />
        <NavCard href="/menu/edit"   icon="✏️" title="Add Menu Item"  description="Create a new item and assign it to a category." />
      </div>
    </div>
  );
}
