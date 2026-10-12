import { formatDate, readingMinutes } from './posts'

type ArticlePost = {
  title: string
  body: string
  cover_url: string | null
  cover_alt: string
  author_name: string
  tags: string[]
  published_at: string | null
}

/**
 * The article itself: dark title band, cover, body. The static post page and
 * the admin preview both render THIS component, so the preview is exact.
 *
 * `body` must already be sanitized HTML: the build sanitizes it before render,
 * and in the admin it comes straight from the editor's constrained schema.
 */
export default function PostArticle({
  post,
  preview = false,
}: {
  post: ArticlePost
  /** Admin preview: no fixed site header to clear, no breadcrumbs */
  preview?: boolean
}) {
  return (
    <article>
      <header
        className={`bg-ink-950 px-4 pb-14 sm:px-6 lg:pb-20 ${
          preview ? 'pt-14' : 'pt-36 lg:pt-44'
        }`}
      >
        <div className="mx-auto max-w-3xl">
          {!preview && (
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-cream-50/60">
              <a href="/" className="transition-colors hover:text-brand-400">
                Home
              </a>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <a href="/blog/" className="transition-colors hover:text-brand-400">
                Blog
              </a>
            </nav>
          )}
          {post.tags.length > 0 && (
            <p className="eyebrow mb-3">{post.tags.join(' · ')}</p>
          )}
          <h1 className="text-section font-bold text-cream-50 uppercase">
            {post.title || 'Untitled post'}
          </h1>
          <div className="accent-rule mt-5" />
          <p className="mt-5 text-sm font-semibold text-cream-50/70">
            By <span className="text-cream-50">{post.author_name || 'Unknown author'}</span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            {post.published_at ? (
              <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            ) : (
              formatDate(null)
            )}
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            {readingMinutes(post.body)} min read
          </p>
        </div>
      </header>

      <div className="bg-cream-50 px-4 pb-16 sm:px-6 lg:pb-24">
        {post.cover_url && (
          <div className="mx-auto max-w-5xl pt-10 lg:pt-14">
            <img
              src={post.cover_url}
              alt={post.cover_alt}
              className="aspect-[16/9] w-full rounded-2xl object-cover shadow-2xl"
            />
          </div>
        )}
        <div
          className="prose-blog mx-auto max-w-3xl pt-10 lg:pt-14"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      </div>
    </article>
  )
}
