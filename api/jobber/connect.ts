/**
 * One-time OAuth start. Visit https://jtbuildersct.com/api/jobber/connect once
 * to authorize the app on the J&T Jobber account; Jobber redirects back to
 * /api/jobber/callback with a code.
 */
const AUTHORIZE_URL = 'https://api.getjobber.com/api/oauth/authorize'

export async function GET(request: Request): Promise<Response> {
  const clientId = process.env.JOBBER_CLIENT_ID
  if (!clientId) {
    return new Response('JOBBER_CLIENT_ID is not set', { status: 500 })
  }
  const redirectUri = new URL('/api/jobber/callback', request.url).toString()
  const url = new URL(AUTHORIZE_URL)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')

  return new Response(null, {
    status: 302,
    headers: { Location: url.toString() },
  })
}
