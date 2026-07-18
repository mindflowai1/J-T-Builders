import {
  ClockIcon,
  HardHatIcon,
  ShieldCheckIcon,
  UserIcon,
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

// TODO: swap placeholders for the real portraits, names, and titles from the client
const OWNERS = [
  { name: 'Owner Name', role: 'Co-Owner & Builder' },
  { name: 'Owner Name', role: 'Co-Owner & Builder' },
]

export default function WhyChooseUs() {
  return (
    <section
      id="why-us"
      className="overflow-x-clip bg-ink-950 px-4 py-20 sm:px-6 lg:py-28"
    >
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

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[5fr_6fr] lg:gap-16">
          {/* The owners: faces behind the work */}
          <Reveal direction="left">
            <div className="grid grid-cols-2 gap-5 sm:gap-6">
              {OWNERS.map((owner, i) => (
                <figure key={i}>
                  <div className="relative">
                    <div
                      className="absolute -top-2 -left-2 h-full w-full rounded-2xl border-2 border-brand-500"
                      aria-hidden="true"
                    />
                    {/* Placeholder portrait; replace with a real <img> when photos arrive */}
                    <div className="relative flex aspect-[4/5] items-center justify-center rounded-2xl bg-ink-900">
                      <UserIcon className="size-16 text-brand-500/25 sm:size-20" />
                    </div>
                  </div>
                  <figcaption className="mt-4">
                    <p className="font-display text-lg font-bold text-cream-50 uppercase">
                      {owner.name}
                    </p>
                    <p className="text-sm font-bold text-brand-500">
                      {owner.role}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-cream-50/70">
              A family business, now in its second generation. When you work
              with J&T, you work with the builders themselves, and it shows:
              quality you can feel in the work.
            </p>
          </Reveal>

          {/* Reasons: editorial numbered list */}
          <ol>
            {REASONS.map((reason, i) => (
              <li
                key={reason.title}
                className="border-t border-cream-50/10 py-5 first:border-0 first:pt-0 last:pb-0"
              >
                <Reveal delay={i * 110} className="flex items-start gap-5">
                  <span
                    aria-hidden="true"
                    className="text-stroke-brand w-14 shrink-0 font-display text-5xl font-bold leading-none"
                  >
                    0{i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <reason.icon className="size-5 shrink-0 text-brand-500" />
                      <h3 className="font-display text-lg font-bold text-cream-50 uppercase">
                        {reason.title}
                      </h3>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-cream-50/70">
                      {reason.desc}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
