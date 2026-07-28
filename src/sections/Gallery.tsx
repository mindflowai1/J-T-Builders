import { useEffect, useState } from 'react'
import heroDeck from '../assets/hero-deck.webp'
import galleryConstruction from '../assets/gallery-construction.webp'
import litRailingsNight from '../assets/lit-railings-night.webp'
import craftsman from '../assets/craftsman.webp'
import galleryStairs from '../assets/gallery-stairs.webp'
import exteriorSiding from '../assets/exterior-siding.webp'
import litDeckSteps from '../assets/lit-deck-steps.webp'
import Reveal from '../components/Reveal'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from '../components/icons'

/** All curated portfolio photos, grouped by album folder (see scripts/build-portfolio.mjs) */
const portfolioFiles = import.meta.glob<{ default: string }>(
  '../assets/portfolio/*/*.webp',
  { eager: true },
)
const portfolioPhotos: Record<string, string[]> = {}
for (const [filePath, mod] of Object.entries(portfolioFiles)) {
  const match = filePath.match(/portfolio\/([^/]+)\/(\d+)\.webp$/)
  if (!match) continue
  const [, album, num] = match
  ;(portfolioPhotos[album] ??= [])[Number(num) - 1] = mod.default
}

type Album = { title: string; photos: string[]; span?: string }

/** Moves the given 1-based photo number to the front, so it becomes the cover. */
function withCover(photos: string[], coverNumber: number): string[] {
  const i = coverNumber - 1
  if (i <= 0 || i >= photos.length) return photos
  return [photos[i], ...photos.slice(0, i), ...photos.slice(i + 1)]
}

/** Mosaic order + slot sizes (lg+ only; mobile/tablet fall back to a simple grid) */
const ALBUMS: Album[] = [
  {
    title: 'Cable Railing Deck',
    photos: portfolioPhotos['cable-rail-deck'],
    span: 'lg:col-span-2 lg:row-span-2',
  },
  {
    title: 'Major Home Renovation',
    photos: portfolioPhotos['renovation'],
    span: 'lg:row-span-2',
  },
  {
    title: 'Custom Basement Build-Out',
    photos: withCover(portfolioPhotos['basement'], 3),
  },
  {
    title: 'Signature Deck Builds',
    photos: [
      heroDeck,
      galleryConstruction,
      litRailingsNight,
      craftsman,
      galleryStairs,
      exteriorSiding,
      litDeckSteps,
    ],
    span: 'lg:col-span-2',
  },
  {
    title: 'New Garage & Carriage House',
    photos: withCover(portfolioPhotos['garage'], 4),
  },
  { title: 'Home Addition', photos: portfolioPhotos['addition'] },
  {
    title: 'Porch Demo & Deck Steps',
    photos: withCover(portfolioPhotos['porch-demo'], 4),
    span: 'lg:row-span-2',
  },
  {
    title: 'Deck & Pergola',
    photos: withCover(portfolioPhotos['pergola-deck'], 4),
  },
  {
    title: 'Composite Deck, Black Railings',
    photos: portfolioPhotos['black-rail-deck'],
  },
  { title: 'Elevated Deck & Stairs', photos: portfolioPhotos['elevated-deck'] },
]

export default function Gallery() {
  const [openAlbum, setOpenAlbum] = useState<number | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)

  const album = openAlbum !== null ? ALBUMS[openAlbum] : null

  // Lightbox: keyboard nav + body scroll lock
  useEffect(() => {
    if (!album) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenAlbum(null)
      if (e.key === 'ArrowRight')
        setPhotoIndex((i) => (i + 1) % album.photos.length)
      if (e.key === 'ArrowLeft')
        setPhotoIndex((i) => (i - 1 + album.photos.length) % album.photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [album])

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

        {/* Mosaic: asymmetric slots on lg+, simple grid below */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:auto-rows-[240px] lg:grid-cols-4 lg:grid-flow-dense">
          {ALBUMS.map((a, i) => (
            <Reveal
              key={a.title}
              delay={Math.min(i, 6) * 70}
              className={`h-full ${a.span ?? ''}`}
            >
              <button
                type="button"
                onClick={() => {
                  setOpenAlbum(i)
                  setPhotoIndex(0)
                }}
                className="group relative block size-full overflow-hidden rounded-xl text-left"
              >
                <img
                  src={a.photos[0]}
                  alt={`${a.title}, a J&T Builders project`}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
                <span
                  aria-hidden="true"
                  className="text-stroke-brand absolute top-3 left-3 font-display text-3xl font-bold leading-none sm:text-4xl"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Album lightbox */}
      {album && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-ink-950/97 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={album.title}
          onClick={() => setOpenAlbum(null)}
        >
          <div className="flex shrink-0 items-center justify-between pb-3">
            <p className="text-xs text-cream-50/60">
              {photoIndex + 1} / {album.photos.length}
            </p>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpenAlbum(null)}
              className="flex size-11 items-center justify-center rounded-full bg-ink-900 text-cream-50 transition-colors hover:bg-brand-500 hover:text-ink-950"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>

          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() =>
                setPhotoIndex(
                  (photoIndex - 1 + album.photos.length) % album.photos.length,
                )
              }
              className="absolute left-0 flex size-11 items-center justify-center rounded-full bg-ink-900 text-cream-50 transition-colors hover:bg-brand-500 hover:text-ink-950 sm:left-2"
            >
              <ChevronLeftIcon className="size-6" />
            </button>
            <img
              src={album.photos[photoIndex]}
              alt={`${album.title}, photo ${photoIndex + 1}`}
              className="max-h-full max-w-full rounded-xl object-contain"
            />
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => setPhotoIndex((photoIndex + 1) % album.photos.length)}
              className="absolute right-0 flex size-11 items-center justify-center rounded-full bg-ink-900 text-cream-50 transition-colors hover:bg-brand-500 hover:text-ink-950 sm:right-2"
            >
              <ChevronRightIcon className="size-6" />
            </button>
          </div>

          {/* Thumbnail strip */}
          {album.photos.length > 1 && (
            <div
              className="scrollbar-none mt-3 flex shrink-0 gap-2 overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {album.photos.map((photo, i) => (
                <button
                  key={photo}
                  type="button"
                  onClick={() => setPhotoIndex(i)}
                  aria-label={`Go to photo ${i + 1}`}
                  aria-current={photoIndex === i}
                  className={`size-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:size-16 ${
                    photoIndex === i ? 'border-brand-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={photo}
                    alt=""
                    className="size-full object-cover opacity-70 hover:opacity-100"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
