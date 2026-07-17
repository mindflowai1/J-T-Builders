import { GoogleIcon, StarIcon } from '../components/icons'
import Reveal from '../components/Reveal'
import { useCarousel } from '../lib/useCarousel'
import { useInView } from '../lib/useInView'
import { SITE } from '../lib/site'

const REVIEWS = [
  {
    name: 'Sarah K.',
    location: 'Fairfield, CT',
    quote:
      'J&T Builders transformed our backyard completely. The deck they built is absolutely stunning. Quality craftsmanship and they finished ahead of schedule. Highly recommend!',
  },
  {
    name: 'Michael T.',
    location: 'Greenwich, CT',
    quote:
      'The pergola they built is the centerpiece of our backyard. Beautiful craftsmanship, fair pricing, and the team was a pleasure to work with. Will definitely hire again.',
  },
  {
    name: 'Robert M.',
    location: 'Stamford, CT',
    quote:
      'We hired J&T for a full kitchen remodel and master suite addition. The attention to detail was incredible. They communicated every step of the way and the result exceeded our expectations.',
  },
  {
    name: 'Jennifer L.',
    location: 'Westport, CT',
    quote:
      'From demolition to the final nail, J&T was exceptional. Our new deck railings and stairs completely changed the backyard. Second generation of quality; you can feel it in the work.',
  },
]

export default function Testimonials() {
  const { scrollerRef, active, onScroll, scrollTo } = useCarousel(
    REVIEWS.length,
  )
  // Single trigger so off-screen carousel slides animate together with the section
  const { ref: cardsRef, inView: cardsInView } = useInView<HTMLDivElement>(
    0.15,
    '0px 0px -10% 0px',
  )

  return (
    <section id="reviews" className="bg-cream-50 px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-3xl">
          <p className="eyebrow flex items-center gap-2">
            <GoogleIcon className="size-4" />
            Live from Google Business Profile
          </p>
          <div className="accent-rule mt-2 mb-4" />
          <h2 className="text-section font-bold text-ink-950 uppercase">
            What Our Clients <span className="text-brand-500">Say</span>
          </h2>
        </Reveal>

        {/* Review cards — swipe carousel on mobile, 2×2 grid from md up */}
        <div ref={cardsRef}>
          <div
            ref={scrollerRef}
            onScroll={onScroll}
            aria-label="Client reviews"
            className="scrollbar-none -mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-6 md:overflow-visible md:scroll-px-0 md:px-0 md:pb-0"
          >
            {REVIEWS.map((review, i) => (
              <div
                key={review.name}
                style={{ transitionDelay: `${i * 130}ms` }}
                className={`w-[85%] shrink-0 snap-center transition-all duration-700 ease-out md:w-auto md:shrink ${
                  cardsInView
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-6 opacity-0'
                }`}
              >
                <figure className="relative h-full overflow-hidden rounded-2xl bg-white p-6 shadow-md sm:p-7">
                  <span
                    aria-hidden="true"
                    className="absolute -top-3 right-4 font-display text-8xl font-bold text-brand-500/10"
                  >
                    "
                  </span>
                  <div
                    className="flex gap-1 text-brand-500"
                    aria-label="5 out of 5 stars"
                  >
                    {Array.from({ length: 5 }).map((_, s) => (
                      <StarIcon key={s} className="size-4" />
                    ))}
                  </div>
                  <blockquote className="mt-4 leading-relaxed text-ink-700">
                    "{review.quote}"
                  </blockquote>
                  <figcaption className="mt-5">
                    <p className="font-display font-bold text-ink-950 uppercase">
                      {review.name}
                    </p>
                    <p className="text-sm text-ink-500">{review.location}</p>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>

          {/* Carousel dots — mobile only */}
          <div className="mt-5 flex justify-center gap-2 md:hidden">
            {REVIEWS.map((review, i) => (
              <button
                key={review.name}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Go to review by ${review.name}`}
                aria-current={active === i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  active === i ? 'w-6 bg-brand-500' : 'w-2 bg-ink-500/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Review CTA */}
        <Reveal className="mt-10 text-center">
          <a
            href={SITE.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-lg border-2 border-ink-950/15 bg-white px-6 py-3 font-bold text-ink-950 transition-colors hover:border-brand-500"
          >
            <GoogleIcon className="size-5" />
            Leave Us a Review on Google
          </a>
        </Reveal>
      </div>
    </section>
  )
}
