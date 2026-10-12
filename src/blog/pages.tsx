import { CheckIcon, PhoneIcon } from '../components/icons'
import { SITE } from '../lib/site'
import PostArticle from './PostArticle'
import PostCard from './PostCard'
import type { Post, PostSummary } from './posts'

/**
 * Static blog pages. Rendered to HTML at build time (scripts/build-blog.mjs)
 * and never hydrated: only the header and the quote modal become interactive,
 * as separate islands (src/blog/client.tsx). So no state or effects here, and
 * no <Reveal> — its hidden starting state would stay hidden forever.
 *
 * Quote buttons are <a data-open-quote href="/#contact">: with JavaScript they
 * open the Jobber modal, without it they still lead to the contact section.
 */

function QuoteCta() {
  return (
    <section className="bg-ink-950 px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="eyebrow">Planning a Project?</p>
          <div className="accent-rule mt-2 mb-4" />
          <h2 className="text-section font-bold text-cream-50 uppercase">
            Let's Build It <span className="text-brand-500">Right</span>
          </h2>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2.5">
            {['Free, no-obligation estimates', 'We reply within 24 hours', '5-year workmanship warranty'].map(
              (item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm font-semibold text-cream-50/80"
                >
                  <CheckIcon className="size-4 text-brand-500" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <a
            href="/#contact"
            data-open-quote
            className="rounded-lg bg-brand-500 px-8 py-3.5 text-center font-bold text-ink-950 transition-colors hover:bg-brand-400 active:bg-brand-600"
          >
            Get Your Free Quote
          </a>
          <a
            href={SITE.phoneHref}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-cream-50/25 px-8 py-3 font-bold text-cream-50 transition-colors hover:border-brand-500 hover:text-brand-400"
          >
            <PhoneIcon className="size-4" />
            {SITE.phone}
          </a>
        </div>
      </div>
    </section>
  )
}

export function BlogIndexPage({ posts }: { posts: PostSummary[] }) {
  return (
    <>
      <section className="bg-ink-950 px-4 pt-36 pb-16 sm:px-6 lg:pt-44 lg:pb-20">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">The J&amp;T Blog</p>
          <div className="accent-rule mt-2 mb-4" />
          <h1 className="text-hero font-bold text-cream-50 uppercase">
            Build <span className="text-brand-500">Smarter</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream-50/80">
            Practical advice on decks, pergolas, railings and remodeling from a
            second-generation building family in {SITE.address.replace(/ \d+$/, '')}.
          </p>
        </div>
      </section>

      <section className="bg-cream-50 px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          {posts.length > 0 ? (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.slug}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-16 text-center text-lg text-ink-500">
              New articles are on the way. Check back soon.
            </p>
          )}
        </div>
      </section>

      <QuoteCta />
    </>
  )
}

export function BlogPostPage({
  post,
  related,
}: {
  post: Post
  related: PostSummary[]
}) {
  return (
    <>
      <PostArticle post={post} />

      <QuoteCta />

      {related.length > 0 && (
        <section className="bg-cream-50 px-4 py-16 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <p className="eyebrow">Keep Reading</p>
            <div className="accent-rule mt-2 mb-4" />
            <h2 className="text-section font-bold text-ink-950 uppercase">
              More From <span className="text-brand-500">the Blog</span>
            </h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <PostCard post={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
