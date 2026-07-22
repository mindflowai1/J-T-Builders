/**
 * Creates a Jobber work request from the site's own quote form.
 *
 * Flow (Jobber requires a client before a request):
 *   1. clientCreate  — name, email, phone, property address
 *   2. requestCreate — clientId + title (the requested service)
 *
 * Runs on Vercel. Credentials live only in the environment:
 *   JOBBER_CLIENT_ID, JOBBER_CLIENT_SECRET  (from the Developer Center app)
 *   JOBBER_REFRESH_TOKEN                     (from the one-time OAuth connect)
 * Refresh token rotation must be OFF on the app, so this token stays valid.
 */

const TOKEN_URL = 'https://api.getjobber.com/api/oauth/token'
const GRAPHQL_URL = 'https://api.getjobber.com/api/graphql'
const GRAPHQL_VERSION = process.env.JOBBER_GRAPHQL_VERSION || '2025-04-16'

const SERVICES = [
  'Decks, Pergolas & Sun Rooms',
  'Railings, Stairs & Exteriors',
  'Remodeling & Home Additions',
  'Other',
]

type Lead = {
  name: string
  email: string
  phone: string
  address: string
  service: string
  message: string
}

async function getAccessToken(): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: process.env.JOBBER_REFRESH_TOKEN,
      client_id: process.env.JOBBER_CLIENT_ID,
      client_secret: process.env.JOBBER_CLIENT_SECRET,
    }),
  })
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`)
  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) throw new Error('No access token returned')
  return data.access_token
}

async function jobberGraphQL(
  token: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<{ data?: Record<string, unknown>; errors?: unknown }> {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-JOBBER-GRAPHQL-VERSION': GRAPHQL_VERSION,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`)
  return res.json()
}

const CLIENT_CREATE = `
  mutation CreateClient($input: ClientCreateInput!) {
    clientCreate(input: $input) {
      client { id }
      userErrors { message }
    }
  }
`

const REQUEST_CREATE = `
  mutation CreateRequest($input: RequestCreateInput!) {
    requestCreate(input: $input) {
      request { id }
      userErrors { message }
    }
  }
`

// Fallback when the client already exists: find them by email or phone.
// searchTerm alone searches names/emails/phones, so no enum arg is needed.
const CLIENT_SEARCH = `
  query FindClient($term: String!) {
    clients(searchTerm: $term, first: 1) {
      nodes { id }
    }
  }
`

async function findExistingClientId(
  token: string,
  email: string,
  phone: string,
): Promise<string | undefined> {
  // Prefer email (more unique); fall back to phone
  const terms = [email, phone].filter(Boolean)
  for (const term of terms) {
    try {
      const res = await jobberGraphQL(token, CLIENT_SEARCH, { term })
      if (res.errors) {
        console.error('client search errors:', JSON.stringify(res.errors))
        continue
      }
      const nodes = (
        res.data?.clients as { nodes?: { id?: string }[] } | undefined
      )?.nodes
      if (nodes?.[0]?.id) return nodes[0].id
    } catch (err) {
      console.error('client search threw:', err)
    }
  }
  return undefined
}

export async function POST(request: Request): Promise<Response> {
  if (
    !process.env.JOBBER_CLIENT_ID ||
    !process.env.JOBBER_CLIENT_SECRET ||
    !process.env.JOBBER_REFRESH_TOKEN
  ) {
    return Response.json({ error: 'Jobber is not configured' }, { status: 500 })
  }

  let body: Partial<Lead> & { company?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Honeypot: real visitors never fill this hidden field
  if (body.company) return Response.json({ ok: true })

  const name = (body.name || '').trim()
  const phone = (body.phone || '').trim()
  const email = (body.email || '').trim()
  const address = (body.address || '').trim()
  const service = SERVICES.includes(body.service || '')
    ? (body.service as string)
    : 'Other'
  const message = (body.message || '').trim()

  if (!name || !phone) {
    return Response.json({ error: 'Name and phone are required' }, { status: 400 })
  }

  const [firstName, ...rest] = name.split(/\s+/)
  const lastName = rest.join(' ')

  try {
    const token = await getAccessToken()

    // 1. Create the client
    const clientInput: Record<string, unknown> = {
      firstName,
      lastName: lastName || firstName,
      phones: [{ number: phone, primary: true, smsAllowed: true }],
    }
    if (email) clientInput.emails = [{ address: email, primary: true }]
    if (address) clientInput.properties = [{ address: { street1: address } }]

    const clientRes = await jobberGraphQL(token, CLIENT_CREATE, {
      input: clientInput,
    })
    const clientData = clientRes.data?.clientCreate as
      | { client?: { id?: string }; userErrors?: { message: string }[] }
      | undefined

    // If creation failed (most commonly because the client already exists),
    // look up the existing client by email/phone and reuse it.
    let clientId = clientData?.client?.id
    if (!clientId) {
      clientId = await findExistingClientId(token, email, phone)
    }
    if (!clientId) {
      console.error('clientCreate failed:', JSON.stringify(clientRes))
      return Response.json({ error: 'Could not create client' }, { status: 502 })
    }

    // 2. Create the request tied to that client
    const title = message ? `${service} — ${message}` : service
    const requestRes = await jobberGraphQL(token, REQUEST_CREATE, {
      input: { clientId, title },
    })
    const requestData = requestRes.data?.requestCreate as
      | { request?: { id?: string }; userErrors?: { message: string }[] }
      | undefined
    if (!requestData?.request?.id) {
      console.error('requestCreate failed:', JSON.stringify(requestRes))
      return Response.json(
        { error: 'Could not create request' },
        { status: 502 },
      )
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('create-request error:', err)
    return Response.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
