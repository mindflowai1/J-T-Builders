import { useEffect, useRef, useState } from 'react'

/**
 * Scroll-driven "scrollytelling" scene between Projects and Reviews:
 * a deck builds itself as the user scrolls — Plan It (blueprint draws) →
 * Build It (posts + planks + railing assemble) → Nail It (hammer drives a nail).
 * Pure SVG + scroll scrubbing, no animation library.
 */

/** Maps progress p to 0→1 within the [a, b] window. */
const seg = (p: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (p - a) / (b - a)))

function hammerAngle(p: number) {
  if (p < 0.66) return -50 // raised, waiting
  if (p < 0.76) return -50 * (1 - seg(p, 0.66, 0.76)) // strike 1
  if (p < 0.81) return -50 * seg(p, 0.76, 0.81) * 0.7 // wind back up
  if (p < 0.91) return -35 * (1 - seg(p, 0.81, 0.91)) // strike 2
  return 0
}

const PLANKS = [0, 1, 2, 3, 4, 5]
const BALUSTERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const PHASES = [
  { label: 'Plan It.', at: 0.05 },
  { label: 'Build It.', at: 0.3 },
  { label: 'Nail It.', at: 0.7 },
]

export default function BuildStory() {
  const ref = useRef<HTMLElement>(null)
  const [p, setP] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setP(1) // show the finished scene, no scrubbing
      return
    }
    const el = ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      // Pinned scrub: the sticky scene locks on screen while the section's
      // extra height (section - viewport) is scrolled through.
      const total = rect.height - window.innerHeight
      setP(total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Blueprint draw + fade
  const blueprint = seg(p, 0.02, 0.26)
  const blueprintFade = 1 - seg(p, 0.3, 0.38)
  // Build phases
  const posts = seg(p, 0.2, 0.3)
  const rails = seg(p, 0.5, 0.6)
  const topRail = seg(p, 0.56, 0.66)
  // Nail It
  const toolsIn = seg(p, 0.6, 0.66)
  const nailDepth = (p >= 0.76 ? 9 : 0) + (p >= 0.91 ? 9 : 0)
  const flash1 = p >= 0.76 ? 1 - seg(p, 0.76, 0.82) : 0
  const flash2 = p >= 0.91 ? 1 - seg(p, 0.91, 0.97) : 0
  const flash = Math.max(flash1, flash2)

  return (
    <section ref={ref} className="relative h-[160vh] bg-ink-900">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-4">
        {/* Scene */}
        <svg
          viewBox="0 0 420 320"
          aria-hidden="true"
          className="w-full max-w-lg"
        >
          {/* Blueprint outline (dashed, draws itself, then fades) */}
          <path
            d="M50 114 H380 M50 170 H380 M88 190 V280 M328 190 V280 M56 170 V114 M364 170 V114"
            fill="none"
            stroke="#FBF6ED"
            strokeOpacity={0.35 * blueprintFade}
            strokeWidth="2"
            strokeDasharray="6 6"
            pathLength={1}
            style={{
              strokeDashoffset: 0,
              opacity: blueprint > 0 ? 1 : 0,
              clipPath: `inset(0 ${(1 - blueprint) * 100}% 0 0)`,
            }}
          />

          {/* Support posts (rise from the ground) */}
          {[80, 324].map((x) => (
            <rect
              key={x}
              x={x}
              y={190}
              width={16}
              height={90}
              rx={2}
              fill="#3F3A30"
              style={{
                transform: `scaleY(${posts})`,
                transformOrigin: '0 280px',
                transformBox: 'view-box',
              }}
            />
          ))}
          {/* Ground line */}
          <rect x={40} y={280} width={340} height={3} rx={1.5} fill="#3F3A30" />

          {/* Deck planks (drop in one by one) */}
          {PLANKS.map((i) => {
            const pi = seg(p, 0.3 + i * 0.04, 0.38 + i * 0.04)
            return (
              <rect
                key={i}
                x={50 + i * 55}
                y={170}
                width={53}
                height={18}
                rx={2}
                fill={i % 2 ? '#B37207' : '#D4880A'}
                style={{
                  opacity: pi,
                  transform: `translateY(${(1 - pi) * -26}px)`,
                }}
              />
            )
          })}
          {/* Fascia board */}
          <rect
            x={50}
            y={190}
            width={330}
            height={11}
            rx={2}
            fill="#1C1913"
            stroke="#3F3A30"
            strokeWidth={1}
            style={{ opacity: seg(p, 0.46, 0.52) }}
          />

          {/* Railing posts */}
          {[56, 205, 354].map((x) => (
            <rect
              key={x}
              x={x}
              y={110}
              width={10}
              height={60}
              rx={2}
              fill="#6E675A"
              style={{
                transform: `scaleY(${rails})`,
                transformOrigin: '0 170px',
                transformBox: 'view-box',
              }}
            />
          ))}
          {/* Balusters */}
          {BALUSTERS.map((i) => {
            const bi = seg(p, 0.58 + i * 0.008, 0.64 + i * 0.008)
            return (
              <rect
                key={i}
                x={74 + i * 23}
                y={122}
                width={4}
                height={48}
                fill="#6E675A"
                style={{ opacity: bi }}
              />
            )
          })}
          {/* Top rail (draws across) */}
          <rect
            x={50}
            y={102}
            width={330}
            height={10}
            rx={3}
            fill="#B37207"
            style={{
              transform: `scaleX(${topRail})`,
              transformOrigin: '50px 0',
              transformBox: 'view-box',
            }}
          />

          {/* Nail */}
          <g style={{ opacity: toolsIn }}>
            <rect
              x={248}
              y={148 + nailDepth}
              width={4}
              height={22 - nailDepth}
              fill="#FBF6ED"
            />
            <rect
              x={244}
              y={145 + nailDepth}
              width={12}
              height={3.5}
              rx={1.5}
              fill="#FBF6ED"
            />
          </g>

          {/* Impact flash */}
          <g
            stroke="#E89B1C"
            strokeWidth={3}
            strokeLinecap="round"
            style={{ opacity: flash }}
          >
            <line x1={232} y1={132} x2={224} y2={122} />
            <line x1={250} y1={128} x2={250} y2={116} />
            <line x1={268} y1={132} x2={276} y2={122} />
          </g>

          {/* Hammer (swings about the grip) */}
          <g
            style={{
              opacity: toolsIn,
              transform: `rotate(${hammerAngle(p)}deg)`,
              transformOrigin: '345px 128px',
              transformBox: 'view-box',
            }}
          >
            {/* handle */}
            <rect
              x={275}
              y={122}
              width={70}
              height={12}
              rx={5}
              fill="#B37207"
            />
            {/* head */}
            <rect
              x={250}
              y={110}
              width={28}
              height={36}
              rx={4}
              fill="#1C1913"
              stroke="#6E675A"
              strokeWidth={1.5}
            />
          </g>
        </svg>

        {/* Tagline phases — light up as the build progresses */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-10">
          {PHASES.map((phase) => {
            const reached = p >= phase.at
            return (
              <span
                key={phase.label}
                className={`font-display text-2xl font-bold uppercase transition-all duration-500 sm:text-4xl ${
                  reached ? 'scale-100 text-brand-500' : 'scale-95 text-cream-50/20'
                }`}
              >
                {phase.label}
              </span>
            )
          })}
        </div>
      </div>
    </section>
  )
}
