import { useEffect, useState } from 'react'
import logo from '../assets/logo.webp'
import { NAV_LINKS, SITE } from '../lib/site'
import { CloseIcon, MenuIcon, PhoneIcon } from './icons'

/**
 * Badge treatment: at the top of the page the shield hangs large below the
 * transparent bar; once scrolled it shrinks to fit inside the solid bar.
 */
function Logo({ scrolled }: { scrolled: boolean }) {
  return (
    <a
      href="#top"
      aria-label="J&T Builders, back to top"
      className="shrink-0 self-start"
    >
      <img
        src={logo}
        alt="J&T Builders"
        className={`w-auto drop-shadow-[0_6px_16px_rgba(0,0,0,0.45)] transition-all duration-300 ${
          scrolled ? 'mt-2 h-12 lg:mt-3 lg:h-14' : 'mt-1 h-24 lg:h-32'
        }`}
      />
    </a>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll + close on Escape while the mobile menu is open
  useEffect(() => {
    if (!menuOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-ink-950/90 shadow-lg backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20">
        <Logo scrolled={scrolled} />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-bold tracking-wide text-cream-50/80 uppercase transition-colors hover:text-brand-400"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-5">
          <a
            href={SITE.phoneHref}
            className="hidden items-center gap-2 font-bold text-cream-50 transition-colors hover:text-brand-400 md:flex"
          >
            <PhoneIcon className="size-4" />
            {SITE.phone}
          </a>
          {/* Phone icon only on small screens */}
          <a
            href={SITE.phoneHref}
            aria-label={`Call ${SITE.phone}`}
            className="flex size-10 items-center justify-center rounded-lg text-cream-50 transition-colors hover:text-brand-400 md:hidden"
          >
            <PhoneIcon className="size-5" />
          </a>
          <a
            href="#quote-form"
            className="hidden rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-ink-950 transition-colors hover:bg-brand-400 sm:block"
          >
            Get Your Free Quote
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex size-10 items-center justify-center rounded-lg text-cream-50 lg:hidden"
          >
            <MenuIcon className="size-6" />
          </button>
        </div>
      </div>

      {/* Mobile slide-in menu */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 lg:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 z-50 flex h-dvh w-72 flex-col bg-ink-950 p-6 transition-transform duration-300 lg:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-cream-50 uppercase">
            Menu
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="flex size-10 items-center justify-center rounded-lg text-cream-50"
          >
            <CloseIcon className="size-6" />
          </button>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-lg font-bold text-cream-50/90 uppercase transition-colors hover:bg-ink-900 hover:text-brand-400"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto space-y-3">
          <a
            href={SITE.phoneHref}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-cream-50/20 px-5 py-3 font-bold text-cream-50 transition-colors hover:border-brand-500 hover:text-brand-400"
          >
            <PhoneIcon className="size-4" />
            {SITE.phone}
          </a>
          <a
            href="#quote-form"
            onClick={() => setMenuOpen(false)}
            className="block rounded-lg bg-brand-500 px-5 py-3 text-center font-bold text-ink-950 transition-colors hover:bg-brand-400"
          >
            Get Your Free Quote
          </a>
        </div>
      </div>
    </header>
  )
}
