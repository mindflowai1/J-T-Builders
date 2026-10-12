/**
 * Creates a blog admin who can sign in at /admin/.
 *
 *   npm run admin:create -- someone@example.com
 *
 * Writes straight to the database (SUPABASE_DB_URL in .env), so no confirmation
 * email goes out and public sign-ups can stay irrelevant: an account only gets
 * write access once its id is in public.admins, which only this script does.
 *
 * A new account gets a random password, printed once and saved to
 * .admin-credentials.local (gitignored). An existing account keeps its password
 * and is just granted admin.
 */
import { randomBytes } from 'node:crypto'
import { appendFile } from 'node:fs/promises'
import postgres from 'postgres'

const email = (process.argv[2] || '').trim().toLowerCase()
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('Usage: npm run admin:create -- someone@example.com')
  process.exit(1)
}
if (!process.env.SUPABASE_DB_URL) {
  console.error('SUPABASE_DB_URL is not set (see .env.example)')
  process.exit(1)
}

const sql = postgres(process.env.SUPABASE_DB_URL, { max: 1, prepare: false })

try {
  const [existing] = await sql`select id from auth.users where email = ${email}`
  let userId = existing?.id
  let password

  if (!userId) {
    password = randomBytes(18).toString('base64url')
    await sql.begin(async (tx) => {
      const [user] = await tx`
        insert into auth.users (
          instance_id, id, aud, role, email, encrypted_password,
          email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
          created_at, updated_at,
          confirmation_token, email_change, email_change_token_new, recovery_token
        ) values (
          '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
          'authenticated', 'authenticated', ${email},
          extensions.crypt(${password}, extensions.gen_salt('bf')),
          now(), '{"provider":"email","providers":["email"]}', '{}',
          now(), now(), '', '', '', ''
        )
        returning id
      `
      userId = user.id
      await tx`
        insert into auth.identities (
          id, user_id, provider_id, identity_data, provider,
          last_sign_in_at, created_at, updated_at
        ) values (
          gen_random_uuid(), ${userId}, ${userId}::text,
          ${sql.json({ sub: userId, email, email_verified: true })},
          'email', now(), now(), now()
        )
      `
    })
  }

  await sql`insert into public.admins (user_id) values (${userId}) on conflict do nothing`

  if (password) {
    await appendFile(
      '.admin-credentials.local',
      `${new Date().toISOString()}  ${email}  ${password}\n`,
    )
    console.log(`Admin created: ${email}`)
    console.log(`Password:      ${password}`)
    console.log('(also saved to .admin-credentials.local, which is gitignored)')
  } else {
    console.log(`${email} already had an account; it is now an admin.`)
  }
} finally {
  await sql.end()
}
