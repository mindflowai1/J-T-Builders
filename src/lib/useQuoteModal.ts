/**
 * Opening the Jobber quote modal is a window event rather than React context.
 *
 * Jobber's snippet allows a single embed per page, so exactly one
 * <QuoteModalProvider> may exist. On the home page it wraps the whole app, but
 * blog pages are static HTML with small React islands (header, modal), and a
 * button in one island can't reach another island's context. An event reaches
 * the one provider wherever the button lives, and plain HTML can opt in with a
 * `data-open-quote` attribute (handled by the provider).
 */
export const OPEN_QUOTE_EVENT = 'jt:open-quote'

export function openQuoteModal() {
  window.dispatchEvent(new Event(OPEN_QUOTE_EVENT))
}

export function useQuoteModal() {
  return openQuoteModal
}
