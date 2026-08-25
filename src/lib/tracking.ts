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

/**
 * Google Ads conversion. Fired on confirmed form submit instead of from a
 * thank-you page: no page to land on directly, so no inflated conversions.
 */
export function trackGoogleConversion() {
  window.gtag?.('event', 'conversion', { send_to: GOOGLE_CONVERSION })
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
