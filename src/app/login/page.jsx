'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { setAuth, isLoggedIn } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (isLoggedIn()) router.replace('/dashboard');
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    try {
      const { ok, data } = await api.login({ email, password });
      if (!ok) {
        setError(data.message || 'Login failed. Check your credentials.');
        return;
      }
      setAuth(data.details.token, {
        id:    data.details.id,
        name:  data.details.name,
        email: data.details.email,
        role:  data.details.role,
      });
      router.push('/dashboard');
    } catch {
      setError('Could not reach the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[480px] mx-auto mt-16 px-4">
      <div className="bg-white rounded-xl shadow-md p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🍽️</div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to manage your restaurant</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@restaurant.com"
              autoComplete="email"
              required
              className="w-full border-1.5 border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#e85d04] transition-colors"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#e85d04] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e85d04] hover:bg-[#c44d00] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#e85d04] font-medium hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
