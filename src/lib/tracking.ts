/**
 * Fires a Meta event through both channels at once:
 *   - the browser Pixel (fast, but blocked for many users)
 *   - the Conversions API via /api/meta-event (server-side, unblockable)
 *
 * Both carry the same eventId so Meta de-duplicates them into one event.
 * No credentials here: the access token lives only on the server.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
  }
}

/** Google Ads conversion action for "Submit lead form" (tag lives in index.html) */
const GOOGLE_CONVERSION = 'AW-17629581967/QjapCJH86fUbEI-luNZB'
const GA4_ID = 'G-5MTV7T3EMC'

/**
 * Google lead signals, fired only once the server confirms the request reached
 * Jobber: the Ads conversion, plus GA4's generate_lead (same name Jobber's own
 * form tracking used, so the GA4 key event keeps working). No thank-you page to
 * land on directly, so no inflated conversions.
 */
export function trackGoogleConversion() {
  window.gtag?.('event', 'conversion', { send_to: GOOGLE_CONVERSION })
  window.gtag?.('event', 'generate_lead', { send_to: GA4_ID })
}

/**
 * Phone leads: one document-level listener covers every `tel:` link (header,
 * contact, footer, mobile bar, static blog HTML) without wiring each one.
 * Fires the Google Ads "phone call lead" event and Meta's Contact. No delayed
 * navigation: a tel: link opens the dialer without unloading the page, so the
 * events still go out.
 */
export function trackPhoneClicks() {
  document.addEventListener('click', (e) => {
    if (!(e.target as Element | null)?.closest?.('a[href^="tel:"]')) return
    window.gtag?.('event', 'ads_conversion_phone_call_lead')
    trackEvent('Contact')
  })
}

/**
 * Funnel, weakest to strongest intent:
 *   ViewContent      clicked a quote CTA (scrolled to the form)
 *   InitiateCheckout started filling the form
 *   Lead             submitted it (the conversion to optimize ads for)
 *   Contact          tapped call
 */
type MetaEvent = 'ViewContent' | 'InitiateCheckout' | 'Lead' | 'Contact'

/** Optional contact info to improve Meta's match quality (hashed server-side). */
type UserData = { email?: string; phone?: string }

export function trackEvent(eventName: MetaEvent, userData?: UserData) {
  const eventId = crypto.randomUUID()

  window.fbq?.('track', eventName, {}, { eventID: eventId })

  // Fire-and-forget: tracking must never break or slow down the UI
  void fetch('/api/meta-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: window.location.href,
      email: userData?.email,
      phone: userData?.phone,
    }),
    keepalive: true,
  }).catch(() => {})
}
