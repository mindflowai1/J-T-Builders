import logo from '../assets/logo.webp'
import { ArrowRightIcon } from '../components/icons'
import { formatDate, postPath, type PostSummary } from './posts'

/** Blog card — blog index, related posts and the home page "From the Blog". */
export default function PostCard({
  post,
  tone = 'white',
}: {
  post: PostSummary
  /** Card surface; pick the one that contrasts with the section behind it */
  tone?: 'white' | 'cream'
}) {
  return (
    <a
      href={postPath(post.slug)}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl shadow-lg ring-1 ring-ink-500/10 transition-shadow duration-300 hover:shadow-2xl ${
        tone === 'white' ? 'bg-white' : 'bg-cream-50'
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-950">
        {post.cover_url ? (
          <img
            src={post.cover_url}
            alt={post.cover_alt}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-ink-900 to-ink-950">
            <img src={logo} alt="" className="h-20 w-auto opacity-80" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-bold tracking-widest text-ink-500 uppercase">
          {formatDate(post.published_at)} · {post.reading_minutes} min read
        </p>
        <h3 className="mt-3 font-display text-xl leading-snug font-bold text-ink-950 uppercase transition-colors group-hover:text-brand-600">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-3 line-clamp-3 leading-relaxed text-ink-700">{post.excerpt}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-brand-600">
          Read article
          <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
        </span>
      </div>
    </a>
  )
}
