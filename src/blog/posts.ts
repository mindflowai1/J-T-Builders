/** A row of public.posts (supabase/migrations/*_blog.sql). */
export type Post = {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  cover_url: string | null
  cover_alt: string
  seo_title: string | null
  seo_description: string | null
  author_name: string
  tags: string[]
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

/** What a post card needs: the home page bundles these, so no body. */
export type PostSummary = Pick<
  Post,
  'slug' | 'title' | 'excerpt' | 'cover_url' | 'cover_alt' | 'author_name' | 'published_at'
> & { reading_minutes: number }

export function postPath(slug: string) {
  return `/blog/${slug}/`
}

/** ~225 words per minute, never less than one */
export function readingMinutes(html: string) {
  const words = html
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 225))
}

export function toSummary(post: Post): PostSummary {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    cover_url: post.cover_url,
    cover_alt: post.cover_alt,
    author_name: post.author_name,
    published_at: post.published_at,
    reading_minutes: readingMinutes(post.body),
  }
}

// UTC so the static build and the browser always print the same date
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
})

export function formatDate(iso: string | null) {
  return iso ? DATE_FORMAT.format(new Date(iso)) : 'Not published yet'
}

/** "Building a Deck in CT!" -> "building-a-deck-in-ct" */
export function slugify(text: string) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
    .replace(/-+$/, '')
}
