/**
 * Meta Conversions API (server-side event forwarding).
 *
 * Runs on Vercel, never in the browser: the access token lives only in the
 * environment (META_CAPI_TOKEN) and is never sent to the client. The browser
 * calls this endpoint, and this endpoint calls Meta.
 *
 * Required env vars (Vercel > Settings > Environment Variables):
 *   META_PIXEL_ID   e.g. 871472179206738
 *   META_CAPI_TOKEN the EAA... access token (Events Manager > Settings)
 * Optional:
 *   META_TEST_EVENT_CODE  set while testing in Events Manager, remove after
 */

const GRAPH_VERSION = 'v21.0'

/** SHA-256 hex, required by Meta for all personally identifiable fields. */
async function hash(value: string): Promise<string> {
  const normalized = value.trim().toLowerCase()
  const bytes = new TextEncoder().encode(normalized)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(request: Request): Promise<Response> {
  const pixelId = process.env.META_PIXEL_ID
  const token = process.env.META_CAPI_TOKEN

  if (!pixelId || !token) {
    return Response.json(
      { error: 'Meta CAPI is not configured' },
      { status: 500 },
    )
  }

  let payload: {
    eventName?: string
    eventId?: string
    eventSourceUrl?: string
    email?: string
    phone?: string
  }
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Only allow the events this site actually sends
  const ALLOWED = [
    'ViewContent',
    'InitiateCheckout',
    'Lead',
    'Contact',
    'PageView',
  ]
  const eventName = payload.eventName ?? 'Lead'
  if (!ALLOWED.includes(eventName)) {
    return Response.json({ error: 'Unsupported event' }, { status: 400 })
  }

  // Meta matches users better with these signals; all PII must be hashed
  const userData: Record<string, string[] | string> = {}
  if (payload.email) userData.em = [await hash(payload.email)]
  if (payload.phone) {
    userData.ph = [await hash(payload.phone.replace(/\D/g, ''))]
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const userAgent = request.headers.get('user-agent')
  if (ip) userData.client_ip_address = ip
  if (userAgent) userData.client_user_agent = userAgent

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        // Lets Meta de-duplicate against the browser Pixel event
        event_id: payload.eventId,
        event_source_url: payload.eventSourceUrl,
        user_data: userData,
      },
    ],
  }
  if (process.env.META_TEST_EVENT_CODE) {
    body.test_event_code = process.env.META_TEST_EVENT_CODE
  }

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )

  if (!res.ok) {
    // Log server-side for debugging; never leak Meta's response to the client
    console.error('Meta CAPI error:', res.status, await res.text())
    return Response.json({ error: 'Upstream rejected event' }, { status: 502 })
  }

  return Response.json({ ok: true })
}
