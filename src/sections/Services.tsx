import pergola from '../assets/pergola.webp'
import deckRailingSteps from '../assets/deck-railing-steps.webp'
import serviceRemodel from '../assets/service-remodel.webp'
import { ArrowRightIcon, CheckIcon } from '../components/icons'
import Reveal from '../components/Reveal'
import { useCarousel } from '../lib/useCarousel'
import { useInView } from '../lib/useInView'

const SERVICES = [
  {
    title: 'Decks, Pergolas & Sun Rooms',
    img: deckRailingSteps,
    imgPosition: 'object-bottom',
    alt: 'Deck with cable railings and steps built by J&T Builders',
    items: [
      'Trex, TimberTech & Wolf composite decks',
      '4-season screen rooms & gazebos',
      'Pergola design & outdoor living',
      'Railings, stairs & custom builds',
    ],
  },
  {
    title: 'Railings, Stairs & Exteriors',
    img: pergola,
    alt: 'Custom cedar pergola built by J&T Builders',
    items: [
      'Custom aluminum & composite railings',
      'Deck stairs with LED lighting',
      'Post caps & decorative details',
      'Exterior trim & finishing',
    ],
  },
  {
    title: 'Remodeling & Home Additions',
    img: serviceRemodel,
    alt: 'Interior home remodeling by J&T Builders',
    items: [
      'Open-concept kitchen expansions',
      'Master suite additions',
      'In-law & ADU units',
      'Basement & attic finishing',
    ],
  },
]

export default function Services() {
  const { scrollerRef, active, onScroll, scrollTo } = useCarousel(
    SERVICES.length,
  )
  // Single trigger for all cards — off-screen carousel slides animate together
  // with the section instead of waiting to be swiped into view.
  const { ref: cardsRef, inView: cardsInView } = useInView<HTMLDivElement>(
    0.15,
    '0px 0px -10% 0px',
  )

  return (
    <section id="services" className="bg-cream-50 px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <Reveal className="max-w-3xl">
          <p className="eyebrow">What We Do</p>
          <div className="accent-rule mt-2 mb-4" />
          <h2 className="text-section font-bold text-ink-950 uppercase">
            Deck Specialists & Full-Service{' '}
            <span className="text-brand-500">Home Builders</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed">
            From custom Trex, TimberTech & Wolf decks to complete home remodeling, we
            deliver premium craftsmanship on every project, start to finish,
            as one accountable team.
          </p>
        </Reveal>

        {/* Cards — swipe carousel on mobile, grid from md up */}
        <div ref={cardsRef}>
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          aria-label="Our services"
          className="scrollbar-none -mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-8 md:overflow-visible md:scroll-px-0 md:px-0 md:pb-0 xl:grid-cols-3"
        >
          {SERVICES.map((service, i) => (
            <div
              key={service.title}
              style={{ transitionDelay: `${i * 130}ms` }}
              className={`w-[85%] shrink-0 snap-center transition-all duration-700 ease-out md:w-auto md:shrink ${
                cardsInView
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-6 opacity-0'
              }`}
            >
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={service.img}
                  alt={service.alt}
                  loading="lazy"
                  className={`size-full object-cover transition-transform duration-500 group-hover:scale-105 ${service.imgPosition ?? 'object-center'}`}
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-bold text-ink-950 uppercase">
                  {service.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {service.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-brand-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className="mt-6 inline-flex items-center gap-2 pt-2 font-bold text-brand-600 transition-colors hover:text-brand-500"
                >
                  Get a free quote
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
              </article>
            </div>
          ))}
        </div>

        {/* Carousel dots — mobile only */}
        <div className="mt-5 flex justify-center gap-2 md:hidden">
          {SERVICES.map((service, i) => (
            <button
              key={service.title}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Go to ${service.title}`}
              aria-current={active === i}
              className={`h-2 rounded-full transition-all duration-300 ${
                active === i ? 'w-6 bg-brand-500' : 'w-2 bg-ink-500/30'
              }`}
            />
          ))}
        </div>
        </div>
      </div>
    </section>
  )
}
