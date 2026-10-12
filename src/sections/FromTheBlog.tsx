import latestPosts from '../generated/latest-posts.json'
import Reveal from '../components/Reveal'
import { ArrowRightIcon } from '../components/icons'
import PostCard from '../blog/PostCard'
import type { PostSummary } from '../blog/posts'

/**
 * The newest three articles. Written to src/generated/ by scripts/fetch-posts.mjs
 * before every build, so they ship in the bundle: no request, no layout shift.
 * Renders nothing until the first post is published.
 */
const POSTS = latestPosts as PostSummary[]

export default function FromTheBlog() {
  if (POSTS.length === 0) return null

  return (
    <section id="blog" className="bg-white px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">From the Blog</p>
            <div className="accent-rule mt-2 mb-4" />
            <h2 className="text-section font-bold text-ink-950 uppercase">
              Tips & <span className="text-brand-500">Insights</span>
            </h2>
          </div>
          <a
            href="/blog/"
            className="group inline-flex items-center gap-2 font-bold text-brand-600 transition-colors hover:text-brand-500"
          >
            View all articles
            <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </a>
        </Reveal>

        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((post, i) => (
            <li key={post.slug}>
              <Reveal delay={i * 120} className="h-full">
                <PostCard post={post} tone="cream" />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
