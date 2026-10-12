/**
 * Step 1 of the blog build: read the published posts from Supabase.
 *
 *   .blog-cache/posts.json          every published post, full body
 *                                   (read by scripts/build-blog.mjs)
 *   src/generated/latest-posts.json newest three, card fields only
 *                                   (bundled into the home page)
 *
 * Uses the anon key: RLS only lets it see published posts, which is exactly
 * what the public site should contain.
 *
 * In a build, a failure stops everything, so a bad deploy never replaces the
 * live site with an empty blog. `--optional` (used by `npm run dev`) writes
 * empty files instead, so the dev server starts even offline.
 */
import { mkdir, writeFile } from 'node:fs/promises'

const optional = process.argv.includes('--optional')
const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

const COLUMNS = [
  'id', 'slug', 'title', 'excerpt', 'body', 'cover_url', 'cover_alt',
  'seo_title', 'seo_description', 'author_name', 'tags', 'status',
  'published_at', 'created_at', 'updated_at',
].join(',')

function readingMinutes(html) {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 225))
}

async function write(posts) {
  await mkdir('.blog-cache', { recursive: true })
  await mkdir('src/generated', { recursive: true })
  await writeFile('.blog-cache/posts.json', JSON.stringify(posts, null, 2))
  const latest = posts.slice(0, 3).map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover_url: p.cover_url,
    cover_alt: p.cover_alt,
    author_name: p.author_name,
    published_at: p.published_at,
    reading_minutes: readingMinutes(p.body),
  }))
  await writeFile('src/generated/latest-posts.json', JSON.stringify(latest, null, 2))
}

try {
  if (!url || !key) {
    throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set')
  }
  const res = await fetch(
    `${url}/rest/v1/posts?select=${COLUMNS}&status=eq.published&order=published_at.desc`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  )
  if (!res.ok) throw new Error(`Supabase answered ${res.status}: ${await res.text()}`)
  const posts = await res.json()
  await write(posts)
  console.log(`[blog] ${posts.length} published post(s) fetched`)
} catch (err) {
  if (!optional) {
    console.error(`[blog] Could not fetch posts: ${err.message}`)
    process.exit(1)
  }
  await write([])
  console.warn(`[blog] Could not fetch posts (${err.message}); continuing with none`)
}
