import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import logo from '../assets/logo.webp'
import LoginScreen from './LoginScreen'
import PostEditor from './PostEditor'
import PostList from './PostList'
import { supabase } from './supabase'

/**
 * Admin shell: auth gate + hash routes (#/, #/new, #/edit/<id>). Hash routing
 * keeps the whole admin on one static file, /admin/index.html, with no server
 * rewrites.
 *
 * Signing in is not enough to get in: the account must also be listed in
 * public.admins. That's checked here for a clear message, but enforced by RLS.
 */
type Route = { view: 'list' } | { view: 'edit'; id: string | null }

function parseRoute(hash: string): Route {
  if (hash === '#/new') return { view: 'edit', id: null }
  const match = hash.match(/^#\/edit\/([0-9a-f-]{36})$/)
  if (match) return { view: 'edit', id: match[1] }
  return { view: 'list' }
}

export default function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash))
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const userId = session?.user.id
    if (!userId) {
      setIsAdmin(null)
      return
    }
    supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDenied(false)
          setIsAdmin(true)
        } else {
          // Signed in, but not an admin: don't keep a useless session around
          setDenied(true)
          setIsAdmin(false)
          void supabase.auth.signOut()
        }
      })
  }, [session?.user.id])

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (session === undefined || (session && isAdmin === null)) {
    return <div className="min-h-svh bg-ink-950" />
  }

  if (!session || !isAdmin) {
    return (
      <LoginScreen
        notice={denied ? 'This account doesn’t have access to the blog admin.' : undefined}
      />
    )
  }

  return (
    <div className="min-h-svh bg-cream-50">
      <header className="bg-ink-950">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#/" className="flex items-center gap-3">
            <img src={logo} alt="J&T Builders" className="h-11 w-auto" />
            <span className="font-display text-lg font-bold tracking-wide text-cream-50 uppercase">
              Blog <span className="text-brand-500">Admin</span>
            </span>
          </a>
          <div className="flex items-center gap-5 text-sm">
            <a href="/blog/" target="_blank" rel="noreferrer" className="hidden font-bold text-cream-50/70 hover:text-brand-400 sm:block">
              View blog ↗
            </a>
            <span className="hidden text-cream-50/50 md:block">{session.user.email}</span>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="rounded-lg border border-cream-50/25 px-3 py-1.5 font-bold text-cream-50 transition-colors hover:border-brand-500 hover:text-brand-400"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main>
        {route.view === 'list' ? (
          <PostList />
        ) : (
          // key: switching posts (or new → saved) starts a fresh editor
          <PostEditor key={route.id ?? 'new'} postId={route.id} />
        )}
      </main>
    </div>
  )
}
