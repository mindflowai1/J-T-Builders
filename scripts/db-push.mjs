/**
 * Applies supabase/migrations/* to the project in SUPABASE_DB_URL.
 *   npm run db:push
 * Uses the connection string only (no Supabase account token), so access stays
 * scoped to this one project.
 */
import { spawnSync } from 'node:child_process'

if (!process.env.SUPABASE_DB_URL) {
  console.error('SUPABASE_DB_URL is not set (see .env.example)')
  process.exit(1)
}
// Windows can only launch npx through a shell, which splits on spaces and
// special characters, so the URL is quoted there.
const windows = process.platform === 'win32'
const dbUrl = windows ? `"${process.env.SUPABASE_DB_URL}"` : process.env.SUPABASE_DB_URL
const { status } = spawnSync(
  'npx',
  ['-y', 'supabase@latest', 'db', 'push', '--db-url', dbUrl],
  { stdio: 'inherit', shell: windows },
)
process.exit(status ?? 1)
