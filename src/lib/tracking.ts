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
  }
}

type MetaEvent = 'Lead' | 'Contact' | 'ViewContent'

export function trackEvent(eventName: MetaEvent) {
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
    }),
    keepalive: true,
  }).catch(() => {})
}
