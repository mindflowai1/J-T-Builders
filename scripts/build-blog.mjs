/**
 * Step 3 of the blog build, after `vite build` (client) and `vite build --ssr`
 * (src/blog/render.tsx): writes the static blog into dist/.
 *
 *   dist/blog/index.html          listing
 *   dist/blog/<slug>/index.html   one page per published post
 *   dist/blog/rss.xml             feed
 *   dist/sitemap.xml, dist/robots.txt
 *
 * Every page is complete HTML: title, description, canonical, Open Graph,
 * Twitter card and JSON-LD are all there without JavaScript, which is the
 * point: crawlers and link previews (WhatsApp, Facebook) read them as-is.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import sanitizeHtml from 'sanitize-html'

const SITE_URL = 'https://www.jtbuildersct.com'
const SITE_NAME = 'J&T Builders'
const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`
const LOGO_URL = `${SITE_URL}/logo-512.png`

const posts = JSON.parse(await readFile('.blog-cache/posts.json', 'utf8'))
const { renderIndex, renderPost } = await import(
  pathToFileURL(path.resolve('dist-ssr/render.js')).href
)

// --- Assets from the client build --------------------------------------------
const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'))
const entry = manifest['src/blog/client.tsx']
if (!entry) throw new Error('src/blog/client.tsx missing from the Vite manifest')
const css = new Set(entry.css ?? [])
for (const imported of entry.imports ?? []) {
  for (const file of manifest[imported]?.css ?? []) css.add(file)
}
const assetTags = [
  ...[...css].map((file) => `<link rel="stylesheet" href="/${file}" />`),
  `<script type="module" src="/${entry.file}"></script>`,
].join('\n    ')

// Analytics: copied from the home page between markers, one source of truth
const homeHtml = await readFile('dist/index.html', 'utf8')
const between = (start, end) => {
  const match = homeHtml.match(new RegExp(`<!-- ${start} -->([\\s\\S]*?)<!-- ${end} -->`))
  if (!match) throw new Error(`Markers "${start}" / "${end}" not found in index.html`)
  return match[1].trim()
}
const trackingHead = between('tracking:head:start', 'tracking:head:end')
const trackingBody = between('tracking:body:start', 'tracking:body:end')

// --- Helpers -----------------------------------------------------------------
const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// JSON inside <script>: escape "<" so no string can close the tag
const jsonLd = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`

const plainText = (html) =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

const truncate = (text, max) =>
  text.length <= max ? text : `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`

const readingMinutes = (html) =>
  Math.max(1, Math.round(plainText(html).split(' ').filter(Boolean).length / 225))

const postUrl = (slug) => `${SITE_URL}/blog/${slug}/`

// Rich text from the admin is trusted-ish (only admins write it) but it still
// becomes public HTML, so it goes through an allowlist. h1 is demoted: the
// title is the page's only h1.
const sanitize = (html) =>
  sanitizeHtml(html, {
    allowedTags: [
      'p', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul',
      'ol', 'li', 'blockquote', 'img', 'hr', 'br', 'code', 'pre',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'loading', 'decoding'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      h1: 'h2',
      a: (tagName, attribs) => {
        const external = /^https?:\/\//.test(attribs.href || '') &&
          !attribs.href.startsWith(SITE_URL)
        return {
          tagName,
          attribs: external
            ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
            : { href: attribs.href },
        }
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, alt: attribs.alt || '', loading: 'lazy', decoding: 'async' },
      }),
    },
  })

function page({ title, description, canonical, image, imageAlt, type, extraMeta = '', schema, body }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="alternate" type="application/rss+xml" title="${SITE_NAME} Blog" href="${SITE_URL}/blog/rss.xml" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    ${extraMeta}
    ${assetTags}
    ${schema.map(jsonLd).join('\n    ')}
    ${trackingHead}
  </head>
  <body>
    ${trackingBody}
${body}
  </body>
</html>
`
}

const publisher = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: LOGO_URL },
}

const summaries = posts.map((p) => ({
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  cover_url: p.cover_url,
  cover_alt: p.cover_alt,
  author_name: p.author_name,
  published_at: p.published_at,
  reading_minutes: readingMinutes(p.body),
}))

// --- Pages -------------------------------------------------------------------
await rm('dist/blog', { recursive: true, force: true })
await mkdir('dist/blog', { recursive: true })

const indexDescription =
  'Practical advice on decks, pergolas, railings and home remodeling from J&T Builders, a second-generation building family in Bethel, CT.'

await writeFile(
  'dist/blog/index.html',
  page({
    title: 'Blog | J&T Builders, Deck & Remodeling Tips in CT',
    description: indexDescription,
    canonical: `${SITE_URL}/blog/`,
    image: DEFAULT_IMAGE,
    imageAlt: 'A lit composite deck with black railings built by J&T Builders',
    type: 'website',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: `${SITE_NAME} Blog`,
        description: indexDescription,
        url: `${SITE_URL}/blog/`,
        publisher,
        blogPost: posts.map((p) => ({
          '@type': 'BlogPosting',
          headline: p.title,
          url: postUrl(p.slug),
          datePublished: p.published_at,
        })),
      },
    ],
    body: renderIndex(summaries),
  }),
)

for (const [i, post] of posts.entries()) {
  const clean = { ...post, body: sanitize(post.body) }
  const description = truncate(
    post.seo_description || post.excerpt || plainText(clean.body),
    160,
  )
  const title = `${post.seo_title || post.title} | ${SITE_NAME} Blog`
  const url = postUrl(post.slug)
  const image = post.cover_url || DEFAULT_IMAGE
  // Related: the posts around this one, newest first, never itself
  const related = summaries.filter((_, j) => j !== i).slice(0, 3)

  await mkdir(`dist/blog/${post.slug}`, { recursive: true })
  await writeFile(
    `dist/blog/${post.slug}/index.html`,
    page({
      title,
      description,
      canonical: url,
      image,
      imageAlt: post.cover_url ? post.cover_alt : 'A lit composite deck with black railings built by J&T Builders',
      type: 'article',
      extraMeta: [
        `<meta property="article:published_time" content="${post.published_at}" />`,
        `<meta property="article:modified_time" content="${post.updated_at}" />`,
        `<meta property="article:author" content="${escapeHtml(post.author_name)}" />`,
        ...post.tags.map((tag) => `<meta property="article:tag" content="${escapeHtml(tag)}" />`),
      ].join('\n    '),
      schema: [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description,
          image: [image],
          datePublished: post.published_at,
          dateModified: post.updated_at,
          author: { '@type': 'Person', name: post.author_name },
          publisher,
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          keywords: post.tags.join(', ') || undefined,
          wordCount: plainText(clean.body).split(' ').filter(Boolean).length,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog/` },
            { '@type': 'ListItem', position: 3, name: post.title, item: url },
          ],
        },
      ],
      body: renderPost(clean, related),
    }),
  )
}

// --- Feeds -------------------------------------------------------------------
const xml = (value = '') =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const newest = posts[0]?.updated_at
const sitemapEntries = [
  { loc: `${SITE_URL}/`, priority: '1.0' },
  { loc: `${SITE_URL}/blog/`, lastmod: newest, priority: '0.8' },
  ...posts.map((p) => ({ loc: postUrl(p.slug), lastmod: p.updated_at, priority: '0.7' })),
  { loc: `${SITE_URL}/privacy.html`, priority: '0.2' },
  { loc: `${SITE_URL}/terms.html`, priority: '0.2' },
]

await writeFile(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
  .map(
    (e) =>
      `  <url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod.slice(0, 10)}</lastmod>` : ''}<priority>${e.priority}</priority></url>`,
  )
  .join('\n')}
</urlset>
`,
)

await writeFile(
  'dist/robots.txt',
  `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${SITE_URL}/sitemap.xml
`,
)

await writeFile(
  'dist/blog/rss.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${SITE_NAME} Blog</title>
    <link>${SITE_URL}/blog/</link>
    <description>${xml(indexDescription)}</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${posts
  .map(
    (p) => `    <item>
      <title>${xml(p.title)}</title>
      <link>${postUrl(p.slug)}</link>
      <guid isPermaLink="true">${postUrl(p.slug)}</guid>
      <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
      <dc:creator>${xml(p.author_name)}</dc:creator>
      <description>${xml(p.excerpt || truncate(plainText(p.body), 300))}</description>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`,
)

// The manifest only exists for this script; don't publish it
await rm('dist/.vite', { recursive: true, force: true })

console.log(`[blog] wrote ${posts.length} post page(s), index, sitemap, robots and RSS`)
