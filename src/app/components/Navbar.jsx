'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();

  // Hide navbar on auth pages
  const authPages = ['/login', '/signup'];
  if (authPages.includes(pathname)) return null;

  const active = (href) =>
    pathname === href || pathname.startsWith(href + '/')
      ? 'text-[#e85d04]'
      : 'text-gray-300 hover:text-[#e85d04]';

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  return (
    <nav className="bg-[#1a1a2e] h-[60px] flex items-center justify-between px-6 sticky top-0 z-50 shadow-lg">
      <Link href="/dashboard" className="text-[#e85d04] font-bold text-xl tracking-tight no-underline">
        🍽️ <span className="text-white">Restaurant</span> Manager
      </Link>

      <div className="flex items-center gap-5">
        <Link href="/dashboard" className={`text-sm font-medium transition-colors no-underline ${active('/dashboard')}`}>
          Dashboard
        </Link>
        <Link href="/menu" className={`text-sm font-medium transition-colors no-underline ${active('/menu')}`}>
          Menu
        </Link>
        <Link href="/orders/new" className={`text-sm font-medium transition-colors no-underline ${active('/orders/new')}`}>
          New Order
        </Link>
        <Link href="/orders" className={`text-sm font-medium transition-colors no-underline ${active('/orders')}`}>
          Orders
        </Link>
        <button
          onClick={logout}
          className="border border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg text-sm cursor-pointer bg-transparent transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
