import { useEffect, useRef, useState } from 'react'
import heroDeck from '../assets/hero-deck.webp'
import QuoteForm from '../components/QuoteForm'
import { PhoneIcon, CheckIcon, PlayIcon } from '../components/icons'
import { SITE } from '../lib/site'

/** Rotating service tags — from the old site's hero */
const TAGS = ['Custom Deck Building', 'Decks & Pergolas', 'Railings & Exteriors']

const TRUST_ITEMS = [
  '24+ Years of Excellence',
  '489+ Projects Completed',
  'OSHA Certified',
  'Licensed & Insured',
  '5-Year Warranty',
]

export default function Hero() {
  const [tagIndex, setTagIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  // iOS blocks autoplay in Low Power Mode etc. — poster stays, tap starts playback
  const [needsTap, setNeedsTap] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTagIndex((i) => (i + 1) % TAGS.length), 4000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    video.play().catch(() => setNeedsTap(true))
    const onPlaying = () => setNeedsTap(false)
    video.addEventListener('playing', onPlaying)
    return () => video.removeEventListener('playing', onPlaying)
  }, [])

  const startVideo = () => {
    if (needsTap) videoRef.current?.play().catch(() => {})
  }

  return (
    <section
      onClick={startVideo}
      onTouchStart={startVideo}
      className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-ink-950"
    >
      {/* Background video + warm dark gradient (poster image covers load time & reduced-motion) */}
      <div className="absolute inset-0" aria-hidden="true">
        <video
          ref={videoRef}
          src="/hero-video.mp4"
          poster={heroDeck}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="size-full object-cover motion-reduce:hidden"
        />
        <img
          src={heroDeck}
          alt=""
          className="hidden size-full object-cover motion-reduce:block"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/75 to-ink-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-ink-950/30" />
      </div>

      {/* Play badge — only when autoplay was blocked (e.g. iOS Low Power Mode) */}
      {needsTap && (
        <button
          type="button"
          onClick={startVideo}
          aria-label="Play background video"
          className="absolute right-4 bottom-20 z-10 flex items-center gap-2 rounded-full bg-brand-500 py-2.5 pr-5 pl-4 font-bold text-ink-950 shadow-xl transition-colors active:bg-brand-600 sm:right-6"
        >
          <PlayIcon className="size-4" />
          Play
        </button>
      )}

      {/* Content */}
      <div className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-4 pt-28 pb-12 sm:px-6 lg:grid-cols-[1fr_400px] lg:pt-32">
        <div className="max-w-2xl">
          {/* Rotating tag — key remount replays the fade-in */}
          <p key={tagIndex} className="eyebrow animate-fade-in mb-4">
            ● {TAGS[tagIndex]}
          </p>
          <h1 className="text-hero font-bold text-cream-50 uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            From <span className="text-brand-500">Demolition</span>
            <br />
            to Perfection
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream-50/85">
            Serving Bethel and all of Fairfield County, we turn your vision into
            a space that adds{' '}
            <strong className="text-cream-50">comfort, value, and style</strong>{' '}
            to your home, built by second-generation craftsmen and delivered on
            time.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#contact"
              className="rounded-lg bg-brand-500 px-7 py-3.5 font-bold text-ink-950 transition-colors hover:bg-brand-400 active:bg-brand-600 lg:hidden"
            >
              Get Your Free Quote
            </a>
            <a
              href={SITE.phoneHref}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-cream-50/30 px-7 py-3.5 font-bold text-cream-50 transition-colors hover:border-brand-500 hover:text-brand-400"
            >
              <PhoneIcon className="size-4" />
              Call {SITE.phone}
            </a>
          </div>
        </div>

        {/* Quote form card — glass over the video; desktop only, mobile CTA scrolls to #contact */}
        <div className="hidden rounded-2xl border border-cream-50/15 bg-cream-50/10 p-6 shadow-2xl backdrop-blur-xl lg:block">
          <p className="font-display text-2xl font-bold text-cream-50 uppercase">
            Get Your <span className="text-brand-500">Free Quote</span>
          </p>
          <div className="accent-rule mt-2 mb-5" />
          <QuoteForm id="hero-quote" variant="glass" />
        </div>
      </div>

      {/* Trust strip — auto-scrolling marquee on mobile, static row on lg+ */}
      <div className="relative overflow-hidden border-t border-cream-50/15 bg-ink-950/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl lg:px-6">
          <div className="flex w-max animate-marquee motion-reduce:w-full lg:w-full lg:animate-none">
            {[false, true].map((isClone) => (
              <ul
                key={isClone ? 'clone' : 'original'}
                aria-hidden={isClone || undefined}
                className={`flex items-center gap-8 px-4 py-4 ${
                  isClone
                    ? 'motion-reduce:hidden lg:hidden'
                    : 'max-lg:motion-reduce:w-full max-lg:motion-reduce:flex-wrap max-lg:motion-reduce:justify-center lg:w-full lg:justify-between lg:px-0'
                }`}
              >
                {TRUST_ITEMS.map((item) => (
                  <li
                    key={item}
                    className="flex shrink-0 items-center gap-2 text-sm font-bold whitespace-nowrap text-cream-50/90"
                  >
                    <CheckIcon className="size-4 text-brand-500" />
                    {item}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
