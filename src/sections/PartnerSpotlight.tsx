import craftsman from '../assets/craftsman.webp'
import { CheckIcon } from '../components/icons'
import Reveal from '../components/Reveal'

/** Authority-borrow section — J&T's equivalent of the reference site's manufacturer spotlight. */
export default function PartnerSpotlight() {
  return (
    <section className="overflow-x-clip bg-white px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Photo with offset amber frame + floating warranty badge */}
        <Reveal direction="left" className="relative">
          <div
            className="absolute -top-3 -left-3 hidden h-full w-full rounded-2xl border-2 border-brand-500 sm:block"
            aria-hidden="true"
          />
          <img
            src={craftsman}
            alt="J&T Builders craftsman at work on a custom deck"
            loading="lazy"
            className="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-lg"
          />
          <div className="absolute right-3 -bottom-5 rounded-xl bg-ink-950 px-5 py-3 shadow-xl sm:right-6">
            <p className="font-display text-lg font-bold text-brand-500 uppercase">
              5-Year Warranty
            </p>
            <p className="text-xs font-semibold text-cream-50/70">
              On all workmanship
            </p>
          </div>
        </Reveal>

        {/* Copy + partner wordmarks */}
        <Reveal direction="right" delay={120} className="mt-6 lg:mt-0">
          <p className="eyebrow">Official Partners</p>
          <div className="accent-rule mt-2 mb-4" />
          <h2 className="text-section font-bold text-ink-950 uppercase">
            Trex & TimberTech{' '}
            <span className="text-brand-500">Composite Experts</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed">
            As official Trex & TimberTech partners, we build with the industry's
            leading composite decking — premium materials matched with
            second-generation craftsmanship, so your deck looks beautiful and
            stays that way for decades.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Premium composite decks built to last',
              'Expert installation by OSHA-certified crews',
              'Backed by our 5-year workmanship warranty',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckIcon className="mt-1 size-4 shrink-0 text-brand-500" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-4">
            {['Trex', 'TimberTech'].map((partner) => (
              <div
                key={partner}
                className="rounded-xl border border-ink-500/20 px-6 py-3.5 text-center"
              >
                <p className="font-display text-2xl font-bold tracking-tight text-ink-950">
                  {partner}
                </p>
                <p className="text-xs font-bold tracking-widest text-ink-500 uppercase">
                  Official Partner
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
