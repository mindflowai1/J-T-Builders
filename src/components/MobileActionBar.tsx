import { useEffect, useState } from 'react'
import { SITE } from '../lib/site'
import { PhoneIcon } from './icons'

/**
 * Mobile-only sticky bottom bar — thumb-reach Call / Quote actions.
 * Slides up once the user scrolls past the hero.
 */
export default function MobileActionBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () =>
      setVisible(window.scrollY > window.innerHeight * 0.8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 flex gap-2.5 border-t border-cream-50/10 bg-ink-950/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-300 md:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <a
        href={SITE.phoneHref}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-cream-50/25 px-4 py-3 font-bold text-cream-50 transition-colors active:border-brand-500"
      >
        <PhoneIcon className="size-4" />
        Call Us
      </a>
      <a
        href="#quote-form"
        className="flex-1 rounded-lg bg-brand-500 px-4 py-3 text-center font-bold text-ink-950 transition-colors active:bg-brand-600"
      >
        Get Free Quote
      </a>
    </div>
  )
}
