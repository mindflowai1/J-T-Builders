import { useEffect, useState } from 'react'
import heroDeck from '../assets/hero-deck.webp'
import heroRemodel from '../assets/hero-remodel.webp'
import galleryConstruction from '../assets/gallery-construction.webp'
import pergola from '../assets/pergola.webp'
import craftsman from '../assets/craftsman.webp'
import galleryStairs from '../assets/gallery-stairs.webp'
import exteriorSiding from '../assets/exterior-siding.webp'
import serviceRemodel from '../assets/service-remodel.webp'
import galleryBasement from '../assets/gallery-basement.webp'
import bathroom from '../assets/bathroom.webp'
import Reveal from '../components/Reveal'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from '../components/icons'
import { useInView } from '../lib/useInView'

const CATEGORIES = [
  'All',
  'Decks',
  'Pergolas',
  'Railings & Stairs',
  'Remodeling',
] as const

type Category = (typeof CATEGORIES)[number]

const PROJECTS: { img: string; title: string; category: Exclude<Category, 'All'> }[] = [
  { img: heroDeck, title: 'Composite Deck with Pool Lighting', category: 'Decks' },
  { img: galleryConstruction, title: 'Deck & Hot Tub', category: 'Decks' },
  { img: heroRemodel, title: 'Deck & Hot Tub by Night', category: 'Decks' },
  { img: pergola, title: 'Cedar Pergola', category: 'Pergolas' },
  { img: craftsman, title: 'Deck Stairs & Railings', category: 'Railings & Stairs' },
  { img: galleryStairs, title: 'Deck Stairs with Lighting', category: 'Railings & Stairs' },
  { img: exteriorSiding, title: 'Deck with Railings & Landscaping', category: 'Railings & Stairs' },
  { img: serviceRemodel, title: 'Open-Concept Kitchen Remodel', category: 'Remodeling' },
  { img: galleryBasement, title: 'Finished Basement', category: 'Remodeling' },
  { img: bathroom, title: 'Bathroom Remodel', category: 'Remodeling' },
]

export default function Gallery() {
  const [filter, setFilter] = useState<Category>('All')
  const [lightbox, setLightbox] = useState<number | null>(null)
  const { ref, inView } = useInView<HTMLDivElement>(0.05, '0px 0px -10% 0px')

  const projects =
    filter === 'All' ? PROJECTS : PROJECTS.filter((p) => p.category === filter)

  // Lightbox: keyboard nav + body scroll lock
  useEffect(() => {
    if (lightbox === null) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight')
        setLightbox((i) => (i === null ? i : (i + 1) % projects.length))
      if (e.key === 'ArrowLeft')
        setLightbox((i) =>
          i === null ? i : (i - 1 + projects.length) % projects.length,
        )
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox, projects.length])

  return (
    <section id="projects" className="bg-ink-950 px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">Our Work</p>
          <div className="accent-rule mt-2 mb-4" />
          <h2 className="text-section font-bold text-cream-50 uppercase">
            Recent <span className="text-brand-500">Projects</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-cream-50/80">
            Real projects, real homes, from Bethel to all of Fairfield County.
          </p>
        </Reveal>

        {/* Filter pills — horizontal scroll on mobile */}
        <div className="scrollbar-none -mx-4 mt-10 flex gap-2.5 overflow-x-auto px-4 sm:-mx-6 sm:px-6 md:mx-0 md:flex-wrap md:px-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              aria-pressed={filter === cat}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold whitespace-nowrap transition-colors ${
                filter === cat
                  ? 'bg-brand-500 text-ink-950'
                  : 'bg-ink-900 text-cream-50/70 hover:bg-ink-900/60 hover:text-cream-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid — items stagger in on section entrance and on every filter change */}
        <div
          ref={ref}
          key={`${filter}-${inView}`}
          className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
        >
          {projects.map((project, i) => (
            <button
              key={project.title}
              type="button"
              onClick={() => setLightbox(i)}
              style={{ animationDelay: `${i * 70}ms` }}
              className={`group relative aspect-[4/3] overflow-hidden rounded-xl text-left ${
                inView ? 'animate-fade-in' : 'opacity-0'
              }`}
            >
              <img
                src={project.img}
                alt={`${project.title}, a J&T Builders project`}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <p className="font-display text-sm font-bold text-cream-50 uppercase sm:text-base">
                  {project.title}
                </p>
                <p className="text-xs font-semibold text-brand-400">
                  {project.category}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={projects[lightbox].title}
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-ink-900 text-cream-50 transition-colors hover:bg-brand-500 hover:text-ink-950"
          >
            <CloseIcon className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation()
              setLightbox((lightbox - 1 + projects.length) % projects.length)
            }}
            className="absolute left-2 flex size-11 items-center justify-center rounded-full bg-ink-900 text-cream-50 transition-colors hover:bg-brand-500 hover:text-ink-950 sm:left-6"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
          <figure
            className="max-h-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={projects[lightbox].img}
              alt={`${projects[lightbox].title}, a J&T Builders project`}
              className="max-h-[80vh] w-auto rounded-xl object-contain"
            />
            <figcaption className="mt-3 text-center">
              <span className="font-display font-bold text-cream-50 uppercase">
                {projects[lightbox].title}
              </span>{' '}
              <span className="text-sm text-cream-50/60">
                · {projects[lightbox].category}
              </span>
            </figcaption>
          </figure>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation()
              setLightbox((lightbox + 1) % projects.length)
            }}
            className="absolute right-2 flex size-11 items-center justify-center rounded-full bg-ink-900 text-cream-50 transition-colors hover:bg-brand-500 hover:text-ink-950 sm:right-6"
          >
            <ChevronRightIcon className="size-6" />
          </button>
        </div>
      )}
    </section>
  )
}
