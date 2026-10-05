import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { trackEvent, trackGoogleConversion } from '../lib/tracking'
import { QuoteModalContext } from '../lib/useQuoteModal'
import { CloseIcon } from './icons'

/**
 * Official Jobber work-request embed, shown in a modal.
 *
 * Leads land straight in the client's Jobber account — no API, no OAuth, no
 * credentials to keep alive on our side. Fields and colors are managed in
 * Jobber's form builder (form id 4882418) and Client Hub branding, not here.
 *
 * Two constraints from Jobber's snippet shape the design:
 *   1. Only ONE instance can exist per page — the snippet targets this exact
 *      div id. So the embed lives in a single modal that every CTA opens.
 *   2. The form only renders correctly through the official snippet, which
 *      injects the iframe and resizes it from postMessage'd heights.
 *
 * The embed therefore mounts on the FIRST open (so the iframe measures itself
 * while visible) and then stays mounted. Closing hides the modal with
 * `invisible`, not `display:none`, which keeps the iframe's measured height so
 * reopening is instant and correctly sized.
 */
const CLIENTHUB_ID = '904054a4-16aa-4594-a937-c7b3c349a75d-4882418'
const FORM_URL =
  'https://clienthub.getjobber.com/client_hubs/904054a4-16aa-4594-a937-c7b3c349a75d/public/work_request/embedded_work_request_form?form_id=4882418'
const CSS_URL =
  'https://d3ey4dbjkt2f6s.cloudfront.net/assets/external/work_request_embed.css'
const SCRIPT_URL =
  'https://d3ey4dbjkt2f6s.cloudfront.net/assets/static_link/work_request_embed_snippet.js'

/** A full form is tall; the post-submit confirmation screen is short. */
const FORM_MIN_HEIGHT = 500
const CONFIRMATION_MAX_HEIGHT = 400

/**
 * Tracking through a cross-origin iframe: we can't read inside it, but Jobber's
 * own snippet leaves two usable signals.
 *   1. Clicking into the iframe steals focus from the page, so window blur +
 *      document.activeElement tells us the visitor started filling the form.
 *   2. The iframe postMessages its content height to the parent. After a
 *      successful submit the form is replaced by a short confirmation screen,
 *      so the height collapses. That drop is our submit signal.
 *
 * (2) is a heuristic. The exact signal would be a Jobber webhook on request
 * creation calling api/meta-event.ts server-side; see README.
 */
function JobberEmbed() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Jobber's stylesheet, once
    if (!document.querySelector(`link[href="${CSS_URL}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = CSS_URL
      link.media = 'screen'
      document.head.appendChild(link)
    }
    // The snippet, once. It finds the div below (already committed to the DOM
    // by the time this effect runs) and injects the iframe into it.
    if (!document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
      const script = document.createElement('script')
      script.src = SCRIPT_URL
      script.setAttribute('clienthub_id', CLIENTHUB_ID)
      script.setAttribute('form_url', FORM_URL)
      document.body.appendChild(script)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let engaged = false
    let submitted = false
    let tallestHeight = 0

    const onBlur = () => {
      if (engaged) return
      const active = document.activeElement
      if (active?.tagName === 'IFRAME' && container.contains(active)) {
        engaged = true
        trackEvent('InitiateCheckout')
      }
    }

    const onMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith('getjobber.com')) return
      if (typeof event.data !== 'string') return

      const height = parseInt(event.data, 10)
      if (Number.isNaN(height) || height <= 0) return

      if (
        engaged &&
        !submitted &&
        tallestHeight >= FORM_MIN_HEIGHT &&
        height <= CONFIRMATION_MAX_HEIGHT
      ) {
        submitted = true
        trackEvent('Lead')
        trackGoogleConversion()
      }
      tallestHeight = Math.max(tallestHeight, height)
    }

    window.addEventListener('blur', onBlur)
    window.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('message', onMessage)
    }
  }, [])

  return <div ref={containerRef} id={CLIENTHUB_ID} />
}

export function QuoteModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  // Mount the embed on first open and keep it: the snippet runs only once.
  const [mounted, setMounted] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocused = useRef<HTMLElement | null>(null)

  const openModal = useCallback(() => {
    lastFocused.current = document.activeElement as HTMLElement | null
    setMounted(true)
    setOpen(true)
    trackEvent('ViewContent')
  }, [])

  const closeModal = useCallback(() => setOpen(false), [])

  // Lock page scroll, close on Escape, and move focus into the dialog
  useEffect(() => {
    if (!open) {
      lastFocused.current?.focus?.()
      return
    }
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, closeModal])

  return (
    <QuoteModalContext.Provider value={openModal}>
      {children}
      {createPortal(
        <div
          className={`fixed inset-0 z-[70] flex items-end justify-center transition-opacity duration-300 sm:items-center motion-reduce:transition-none ${
            open ? 'visible opacity-100' : 'invisible opacity-0'
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-modal-title"
          // Keeps the hidden dialog out of the tab order and the a11y tree
          // without display:none, which would reset the iframe's height.
          inert={!open}
        >
          {/* Backdrop */}
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close quote form"
            onClick={closeModal}
            className="absolute inset-0 size-full cursor-default bg-ink-950/80 backdrop-blur-sm"
          />

          {/* Panel — bottom sheet on phones, centered card from sm up */}
          <div
            className={`relative flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-t-2xl bg-cream-50 shadow-2xl transition-transform duration-300 sm:max-h-[90dvh] sm:rounded-2xl motion-reduce:transition-none ${
              open ? 'translate-y-0' : 'translate-y-4'
            }`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-ink-500/15 px-5 py-4 sm:px-7 sm:py-5">
              <div>
                <p
                  id="quote-modal-title"
                  className="font-display text-xl font-bold text-ink-950 uppercase sm:text-2xl"
                >
                  Get Your <span className="text-brand-500">Free Quote</span>
                </p>
                <div className="accent-rule mt-2" />
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="-mr-1 flex size-10 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-500/10 hover:text-ink-950"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            {/* The embed auto-sizes to the full form height; this scrolls it */}
            <div className="overflow-y-auto overscroll-contain px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-7">
              {mounted && <JobberEmbed />}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </QuoteModalContext.Provider>
  )
}
