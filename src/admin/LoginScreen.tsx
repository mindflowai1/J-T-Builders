import { useState, type FormEvent } from 'react'
import logo from '../assets/logo.webp'
import { supabase } from './supabase'

export default function LoginScreen({ notice }: { notice?: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    // On success AdminApp's auth listener takes over
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message)
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <img src={logo} alt="J&T Builders" className="mx-auto h-28 w-auto" />
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl bg-cream-50 p-7 shadow-2xl">
          <div>
            <p className="font-display text-2xl font-bold text-ink-950 uppercase">
              Blog <span className="text-brand-500">Admin</span>
            </p>
            <div className="accent-rule mt-2" />
          </div>
          {notice && <p className="text-sm font-semibold text-red-600">{notice}</p>}
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-ink-950">Email</span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-ink-500/25 bg-white px-4 py-3 text-ink-950 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-ink-950">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-ink-500/25 bg-white px-4 py-3 text-ink-950 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </label>
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-brand-500 px-6 py-3 font-bold text-ink-950 transition-colors hover:bg-brand-400 active:bg-brand-600 disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-cream-50/50">
          <a href="/" className="hover:text-brand-400">
            ← Back to the website
          </a>
        </p>
      </div>
    </div>
  )
}
