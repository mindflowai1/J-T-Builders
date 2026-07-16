import {
  ClockIcon,
  HardHatIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '../components/icons'
import Reveal from '../components/Reveal'

const REASONS = [
  {
    icon: UsersIcon,
    title: '2nd Generation',
    desc: 'A family legacy of quality & reliability you can feel in the work.',
  },
  {
    icon: HardHatIcon,
    title: 'OSHA Certified',
    desc: 'A safety-first approach on every project.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Licensed & Insured',
    desc: 'Full protection for your investment.',
  },
  {
    icon: ClockIcon,
    title: 'On-Time Delivery',
    desc: 'Respect for your schedule & timeline.',
  },
]

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="bg-ink-950 px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">Why Choose Us</p>
          <div className="accent-rule mt-2 mb-4" />
          <h2 className="text-section font-bold text-cream-50 uppercase">
            <span className="text-brand-500">Premium Craftsmanship</span>
            <br />
            Built on Trust
          </h2>
        </Reveal>

        {/* Mobile/tablet: editorial 2×2 grid — oversized ghost numerals, hairline top rules */}
        <ol className="mt-10 grid grid-cols-2 gap-x-5 gap-y-9 lg:hidden">
          {REASONS.map((reason, i) => (
            <li key={reason.title} className="border-t border-cream-50/10 pt-5">
              <Reveal delay={(i % 2) * 130}>
                <span
                  aria-hidden="true"
                  className="text-stroke-brand block font-display text-5xl font-bold leading-none"
                >
                  0{i + 1}
                </span>
                <div className="mt-4 flex items-center gap-2">
                  <reason.icon className="size-5 shrink-0 text-brand-500" />
                  <h3 className="font-display text-base font-bold text-cream-50 uppercase">
                    {reason.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-cream-50/70">
                  {reason.desc}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>

        {/* Desktop: tile grid */}
        <div className="mt-12 hidden gap-5 lg:grid lg:grid-cols-4">
          {REASONS.map((reason, i) => (
            <Reveal key={reason.title} delay={i * 130}>
              <div className="h-full rounded-2xl bg-ink-900 p-6 transition-colors duration-300 hover:bg-ink-900/60">
                <span className="flex size-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                  <reason.icon className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold text-cream-50 uppercase">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cream-50/70">
                  {reason.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
