import logo from '../assets/logo.webp'
import { NAV_LINKS, SITE } from '../lib/site'
import { PhoneIcon } from './icons'

export default function Footer() {
  return (
    <footer className="bg-ink-950 text-cream-50/70">
      {/* Extra bottom padding on mobile clears the floating action bar */}
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-32 sm:px-6 md:pb-14">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <img src={logo} alt="J&T Builders" className="h-24 w-auto" />
            <p className="text-sm leading-relaxed">
              2nd-generation deck specialists & full-service home builders.
              <br />
              {SITE.serviceArea}
            </p>
          </div>

          {/* Quick links */}
          <nav className="space-y-3" aria-label="Footer">
            <p className="font-display font-bold tracking-wide text-cream-50 uppercase">
              Quick Links
            </p>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-brand-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#contact" className="transition-colors hover:text-brand-400">
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div className="space-y-3">
            <p className="font-display font-bold tracking-wide text-cream-50 uppercase">
              Contact
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={SITE.phoneHref}
                  className="inline-flex items-center gap-2 font-bold text-cream-50 transition-colors hover:text-brand-400"
                >
                  <PhoneIcon className="size-4" />
                  {SITE.phone}
                </a>
              </li>
              <li>
                <a
                  href={SITE.emailHref}
                  className="transition-colors hover:text-brand-400"
                >
                  {SITE.email}
                </a>
              </li>
              <li>{SITE.address}</li>
              <li>{SITE.hours}</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-cream-50/10 pt-6 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE.legalName}. All rights reserved.
          </p>
          {/* TODO: point to real Privacy / Terms pages once they exist */}
          <div className="flex gap-6">
            <a href="/privacy.html" className="transition-colors hover:text-brand-400">
              Privacy Policy
            </a>
            <a href="/terms.html" className="transition-colors hover:text-brand-400">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
