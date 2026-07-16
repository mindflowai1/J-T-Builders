import { GoogleIcon, StarIcon } from '../components/icons'
import Reveal from '../components/Reveal'

/**
 * Slim trust bar right after the hero — Google stars + link to the reviews section.
 * TODO (open item): old site fetched the live rating/count from Google Business
 * Profile; decide static vs. live before launch.
 */
export default function SocialProofBar() {
  return (
    <section className="border-b border-ink-500/10 bg-white">
      <Reveal className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-4 py-6 sm:flex-row sm:gap-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <GoogleIcon className="size-6" />
          <div className="flex text-brand-500" aria-label="5 star rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className="size-5" />
            ))}
          </div>
        </div>
        <p className="text-center text-sm font-semibold text-ink-700 sm:text-base">
          Homeowners rate us 5 stars on Google —{' '}
          <a
            href="#reviews"
            className="font-bold text-brand-600 underline-offset-4 transition-colors hover:text-brand-500 hover:underline"
          >
            read their reviews
          </a>
        </p>
      </Reveal>
    </section>
  )
}
