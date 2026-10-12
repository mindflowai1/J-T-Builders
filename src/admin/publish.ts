import { supabase } from './supabase'

/**
 * Asks the server to rebuild the static site (api/blog/publish.ts), which is
 * how a saved change reaches the public blog. The server checks that the
 * caller is an admin before triggering anything.
 */
export async function triggerRebuild(): Promise<{ ok: boolean; message: string }> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) return { ok: false, message: 'Your session expired; sign in again to update the site.' }

  try {
    const res = await fetch('/api/blog/publish', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      return { ok: true, message: 'The site is rebuilding: the change goes live in about 2 minutes.' }
    }
    if (res.status === 404) {
      // `npm run dev` / `vite preview` don't run the Vercel functions
      return {
        ok: false,
        message: 'Saved. This local server can’t rebuild the live site; it updates on the next deploy.',
      }
    }
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    return {
      ok: false,
      message: `Saved, but the site rebuild didn’t start (${body.error ?? `HTTP ${res.status}`}). It will update on the next deploy.`,
    }
  } catch {
    return { ok: false, message: 'Saved, but the site rebuild couldn’t be reached. It will update on the next deploy.' }
  }
}
