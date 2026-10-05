'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '', role: 'user' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) router.replace('/dashboard');
  }, [router]);

  function update(field) {
    return (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
   

    const { name, email, phone, password, role } = form;
    if (!name || !email || !phone || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (phone.length !== 11) {
      setError('Phone number must be exactly 11 digits.');
      return;
    }

    setLoading(true);
    try {
      const { ok, data } = await api.register({ name, email, phone, password, role });
      if (!ok) {
        const detail = data.errors
          ? data.errors.map(err => err.message).join(', ')
          : (data.message || 'Registration failed.');
        setError(detail);
        return;
      }
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => router.push('/login'), 1800);
    } catch {
      setError('Could not reach the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }

      setError('');
      setSuccess('');
  }

  return (
    <div className="max-w-[480px] mx-auto mt-12 px-4">
      <div className="bg-white rounded-xl shadow-md p-8">

        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🍽️</div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join the restaurant management system</p>
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

        <form onSubmit={handleSubmit} noValidate>
          {[
            { id: 'name',     label: 'Full Name',       type: 'text',     placeholder: 'John Doe',          auto: 'name' },
            { id: 'email',    label: 'Email Address',   type: 'email',    placeholder: 'john@example.com',  auto: 'email' },
            { id: 'phone',    label: 'Phone Number',    type: 'tel',      placeholder: '08012345678',       auto: 'tel', maxLen: 11 },
            { id: 'password', label: 'Password',        type: 'password', placeholder: 'Min 6 chars with A-Z, 0-9 & symbol', auto: 'new-password' },
          ].map(({ id, label, type, placeholder, auto, maxLen }) => (
            <div className="mb-4" key={id}>
              <label htmlFor={id} className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">
                {label} <span className="text-red-500">*</span>
              </label>
              <input
                id={id}
                type={type}
                value={form[id]}
                onChange={update(id)}
                placeholder={placeholder}
                autoComplete={auto}
                maxLength={maxLen}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#e85d04] transition-colors"
              />
            </div>
          ))}

          <div className="mb-6">
            <label htmlFor="role" className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">
              Role
            </label>
            <select
              id="role"
              value={form.role}
              onChange={update('role')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#e85d04] transition-colors bg-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e85d04] hover:bg-[#c44d00] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-[#e85d04] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
