/**
 * Rebuilds the static site so blog changes go live. Called by the admin after
 * a published post is saved, unpublished or deleted.
 *
 * The Vercel Deploy Hook URL is a secret (anyone holding it can trigger
 * builds), so it stays here and the caller must prove they're an admin:
 *   1. their Supabase access token must resolve to a user, and
 *   2. RLS must let that user see their own row in public.admins.
 *
 * Env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (shared with the build) and
 * VERCEL_DEPLOY_HOOK_URL (Vercel > Settings > Git > Deploy Hooks).
 */

export async function POST(request: Request): Promise<Response> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
  if (!supabaseUrl || !anonKey || !hookUrl) {
    return Response.json({ error: 'Site rebuild is not configured' }, { status: 500 })
  }

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return Response.json({ error: 'Not signed in' }, { status: 401 })

  const auth = { apikey: anonKey, Authorization: `Bearer ${token}` }

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: auth })
  if (!userRes.ok) return Response.json({ error: 'Session expired' }, { status: 401 })
  const user = (await userRes.json()) as { id?: string }
  if (!user.id) return Response.json({ error: 'Session expired' }, { status: 401 })

  const adminRes = await fetch(
    `${supabaseUrl}/rest/v1/admins?select=user_id&user_id=eq.${encodeURIComponent(user.id)}`,
    { headers: auth },
  )
  const rows = adminRes.ok ? ((await adminRes.json()) as unknown[]) : []
  if (rows.length !== 1) return Response.json({ error: 'Not an admin' }, { status: 403 })

  const hookRes = await fetch(hookUrl, { method: 'POST' })
  if (!hookRes.ok) {
    console.error('Deploy hook failed:', hookRes.status, await hookRes.text())
    return Response.json({ error: 'Deploy hook failed' }, { status: 502 })
  }

  return Response.json({ ok: true })
}
