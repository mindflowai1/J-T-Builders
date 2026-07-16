import { useEffect, useState } from 'react'
import { useInView } from '../lib/useInView'

const STATS = [
  { value: 24, suffix: '+', label: 'Years of Excellence' },
  { value: 489, suffix: '+', label: 'Projects Completed' },
  { value: 2, suffix: 'nd', label: 'Generation Builders' },
]

function Counter({
  value,
  suffix,
  label,
  started,
}: {
  value: number
  suffix: string
  label: string
  started: boolean
}) {
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!started) return
    // Skip the count-up for users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(value)
      return
    }
    const duration = 1600
    const t0 = performance.now()
    let raf: number
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3) // ease-out cubic
      setN(Math.round(eased * value))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started, value])

  return (
    <div className="text-center">
      <p className="font-display text-5xl font-bold text-brand-500 sm:text-6xl">
        {n}
        <span className="text-4xl sm:text-5xl">{suffix}</span>
      </p>
      <p className="mt-2 text-sm font-bold tracking-wide text-cream-50/70 uppercase">
        {label}
      </p>
    </div>
  )
}

export default function StatsBand() {
  const { ref, inView } = useInView<HTMLDivElement>(0.4)

  return (
    <section className="bg-ink-950 px-4 py-14 sm:px-6">
      <div
        ref={ref}
        className={`mx-auto grid max-w-5xl gap-10 transition-all duration-700 ease-out sm:grid-cols-3 ${
          inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        {STATS.map((stat) => (
          <Counter key={stat.label} {...stat} started={inView} />
        ))}
      </div>
    </section>
  )
}
