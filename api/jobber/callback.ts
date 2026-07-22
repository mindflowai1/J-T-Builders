/**
 * OAuth callback. Jobber redirects here with ?code=... after authorization.
 * Exchanges the code for tokens and shows the refresh token ONCE so it can be
 * pasted into the JOBBER_REFRESH_TOKEN environment variable on Vercel.
 *
 * This is an admin-only, one-time setup step. Delete/ignore afterwards.
 */
const TOKEN_URL = 'https://api.getjobber.com/api/oauth/token'

function page(title: string, bodyHtml: string): Response {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
     <meta name="viewport" content="width=device-width,initial-scale=1">
     <title>${title}</title>
     <style>body{font-family:system-ui,sans-serif;background:#12100c;color:#fbf6ed;
     max-width:640px;margin:0 auto;padding:48px 24px;line-height:1.6}
     code,textarea{font-family:ui-monospace,monospace}
     textarea{width:100%;height:120px;margin-top:12px;padding:12px;border-radius:8px;
     border:1px solid #6e675a;background:#1c1913;color:#d4880a;font-size:13px}
     h1{color:#d4880a}</style></head><body>${bodyHtml}</body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) return page('Error', `<h1>Authorization failed</h1><p>${error}</p>`)
  if (!code) return page('Error', `<h1>Missing code</h1><p>No authorization code.</p>`)

  const clientId = process.env.JOBBER_CLIENT_ID
  const clientSecret = process.env.JOBBER_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return page('Error', `<h1>Not configured</h1><p>Set JOBBER_CLIENT_ID and JOBBER_CLIENT_SECRET first.</p>`)
  }

  const redirectUri = new URL('/api/jobber/callback', request.url).toString()

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  })

  if (!res.ok) {
    return page('Error', `<h1>Token exchange failed</h1><p>HTTP ${res.status}</p>`)
  }

  const data = (await res.json()) as { refresh_token?: string }
  if (!data.refresh_token) {
    return page('Error', `<h1>No refresh token</h1><p>Jobber did not return one.</p>`)
  }

  return page(
    'Connected',
    `<h1>Connected to Jobber ✓</h1>
     <p>Copy this <strong>refresh token</strong> and paste it into the
     <code>JOBBER_REFRESH_TOKEN</code> environment variable on Vercel, then redeploy.
     It is shown only once.</p>
     <textarea readonly onclick="this.select()">${data.refresh_token}</textarea>
     <p style="color:#6e675a;font-size:13px">After saving it, you can ignore this page.</p>`,
  )
}
