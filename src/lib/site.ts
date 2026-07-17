/** Single source of truth for company contact info & navigation. Copy: docs/copy.md */

export const SITE = {
  name: 'J&T Builders',
  legalName: 'J&T Builders LLC',
  phone: '(203) 300-6384',
  phoneHref: 'tel:+12033006384',
  email: 'contact@j-tbuilders.com',
  emailHref: 'mailto:contact@j-tbuilders.com',
  address: 'Bethel, CT 06801',
  serviceArea: 'Bethel, CT · Fairfield County & beyond',
  hours: 'Mon–Fri: 8:00 AM – 6:30 PM',
  tagline: 'Plan It. Build It. Nail It.',
  /** Google Business Profile place id (extracted from the old site) */
  googlePlaceId: 'ChIJRYgpwfkv0YkRIq_dOgbfvG0',
  googleReviewUrl:
    'https://search.google.com/local/writereview?placeid=ChIJRYgpwfkv0YkRIq_dOgbfvG0',
} as const

export const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Process', href: '#process' },
  { label: 'Projects', href: '#projects' },
  { label: 'Reviews', href: '#reviews' },
] as const
