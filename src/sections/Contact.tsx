import Reveal from '../components/Reveal'
import {
  CheckIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from '../components/icons'
import { SITE } from '../lib/site'
import { trackEvent } from '../lib/tracking'

const INFO = [
  {
    icon: PhoneIcon,
    label: 'Call or text',
    value: SITE.phone,
    href: SITE.phoneHref,
  },
  {
    icon: MailIcon,
    label: 'Email',
    value: SITE.email,
    href: SITE.emailHref,
  },
  {
    icon: MapPinIcon,
    label: 'Service area',
    value: SITE.serviceArea,
  },
  {
    icon: ClockIcon,
    label: 'Hours',
    value: SITE.hours,
  },
]

const REASSURANCE = [
  'Free, no-obligation estimates',
  'We reply within 24 hours',
  '5-year workmanship warranty',
]

export default function Contact() {
  return (
    <section id="contact" className="bg-ink-950 px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Copy + contact info */}
        <Reveal>
          <p className="eyebrow">Let's Talk About Your Project</p>
          <div className="accent-rule mt-2 mb-4" />
          <h2 className="text-section font-bold text-cream-50 uppercase">
            Start Your <span className="text-brand-500">Project Today</span>
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-cream-50/80">
            Fill out the form and we'll get back to you within 24 hours with a
            free, no-obligation estimate, backed by our 5-year workmanship
            warranty.
          </p>

          <ul className="mt-9 space-y-5">
            {INFO.map((item) => (
              <li key={item.label} className="flex items-center gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-bold tracking-widest text-cream-50/50 uppercase">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="font-bold text-cream-50 transition-colors hover:text-brand-400"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-bold text-cream-50">{item.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-cream-50/10 pt-6">
            {REASSURANCE.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm font-semibold text-cream-50/80"
              >
                <CheckIcon className="size-4 text-brand-500" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Quote card: the Jobber form lives in the hero (#quote-form);
            this card just points visitors back to it. */}
        <Reveal delay={120} className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
          <p className="font-display text-2xl font-bold text-ink-950 uppercase">
            Get Your <span className="text-brand-500">Free Quote</span>
          </p>
          <div className="accent-rule mt-2 mb-5" />
          <p className="leading-relaxed text-ink-700">
            Fill out the quote form at the top of the page. It only takes a
            minute, and we'll get back to you within 24 hours.
          </p>
          <a
            href="#quote-form"
            onClick={() => trackEvent('ViewContent')}
            className="mt-6 block rounded-lg bg-brand-500 px-6 py-3.5 text-center font-bold text-ink-950 transition-colors hover:bg-brand-400 active:bg-brand-600"
          >
            Go to the Quote Form
          </a>
        </Reveal>
      </div>
    </section>
  )
}
