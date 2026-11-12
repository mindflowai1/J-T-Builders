import { trackEvent } from './tracking'

/** The hero's quote form; every "Get Your Free Quote" CTA leads here. */
export const QUOTE_FORM_ID = 'quote-form'

/**
 * Takes the visitor to the quote form: a smooth scroll on the home page, a
 * jump to /#quote-form from blog pages, which have no form of their own.
 */
export function openQuote() {
  trackEvent('ViewContent')
  const form = document.getElementById(QUOTE_FORM_ID)
  if (form) {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    window.location.href = `/#${QUOTE_FORM_ID}`
  }
}
