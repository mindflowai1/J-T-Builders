import { useInView } from '../lib/useInView'
import Reveal from '../components/Reveal'

const STEPS = [
  { title: 'Plan It', desc: 'Detailed consultation & design' },
  { title: 'Build It', desc: 'Expert craftsmanship & execution' },
  { title: 'Nail It', desc: 'Quality checks & refinement' },
  { title: 'Perfect It', desc: 'Final walkthrough & warranty' },
]

/**
 * One step — animates in only once it reaches its position on screen
 * (clears the bottom 20% of the viewport). On desktop the 4 steps share a row,
 * so a pronounced stagger (450ms/step) unfolds the timeline gradually; on
 * mobile each step triggers on its own as you scroll, so no stagger is needed.
 */
function Step({
  index,
  title,
  desc,
  isLast,
}: {
  index: number
  title: string
  desc: string
  isLast: boolean
}) {
  const { ref, inView } = useInView<HTMLLIElement>(0.5, '0px 0px -20% 0px')
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches
  const delay = (extra: number) => ({
    transitionDelay: `${(isDesktop ? index * 450 : 0) + extra}ms`,
  })

  return (
    <li ref={ref} className="flex gap-5 lg:block">
      {/* Number + connector */}
      <div className="flex flex-col items-center lg:flex-row">
        <span
          style={delay(0)}
          className={`flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-500 font-display text-lg font-bold text-ink-950 transition-all duration-500 ease-out ${
            inView ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
        >
          {index + 1}
        </span>
        {!isLast && (
          <div
            style={delay(250)}
            aria-hidden="true"
            className={`w-px flex-1 origin-top bg-brand-500/30 transition-transform duration-700 ease-out lg:h-px lg:w-auto lg:origin-left ${
              inView
                ? 'scale-x-100 scale-y-100'
                : 'max-lg:scale-y-0 lg:scale-x-0'
            }`}
          />
        )}
      </div>
      {/* Content */}
      <div
        style={delay(100)}
        className={`transition-all duration-700 ease-out lg:mt-5 lg:pb-0 ${
          isLast ? '' : 'pb-10'
        } ${inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
      >
        <h3 className="font-display text-xl font-bold text-ink-950 uppercase">
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{desc}</p>
      </div>
    </li>
  )
}

export default function Process() {
  return (
    <section id="process" className="bg-cream-50 px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">Our Process</p>
          <div className="accent-rule mt-2 mb-4" />
          <h2 className="text-section font-bold text-ink-950 uppercase">
            Plan It. Build It. <span className="text-brand-500">Nail It.</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed">
            Four clear steps from first conversation to final walkthrough, so
            you always know exactly where your project stands.
          </p>
        </Reveal>

        {/* Vertical timeline on mobile, horizontal from lg up */}
        <ol className="mt-12 lg:grid lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step, i) => (
            <Step
              key={step.title}
              index={i}
              title={step.title}
              desc={step.desc}
              isLast={i === STEPS.length - 1}
            />
          ))}
        </ol>
      </div>
    </section>
  )
}
