import { useEffect, useRef } from 'react'
import { trackEvent } from '../lib/tracking'

/**
 * Official Jobber work-request embed. The form fields themselves are managed
 * in Jobber's form builder (form_id below), not here; leads land directly in
 * the client's Jobber account. Only ONE instance can exist per page: the
 * snippet targets this exact div id.
 *
 * Tracking through a cross-origin iframe: we can't read inside it, but Jobber's
 * own snippet reveals two usable signals (see their embed script):
 *   1. Clicking into the iframe steals focus from the page, so window blur +
 *      document.activeElement tells us the visitor started filling the form.
 *   2. The iframe postMessages its content height to the parent. After a
 *      successful submit the form is replaced by a short confirmation screen,
 *      so the height collapses. That drop is our submit signal.
 *
 * (2) is a heuristic. The exact, guaranteed signal is a Jobber webhook calling
 * a server endpoint on request creation; see README.
 */
const CLIENTHUB_ID = '904054a4-16aa-4594-a937-c7b3c349a75d-4882418'
export const JOBBER_FORM_URL =
  'https://clienthub.getjobber.com/client_hubs/904054a4-16aa-4594-a937-c7b3c349a75d/public/work_request/embedded_work_request_form?form_id=4882418'
const CSS_URL =
  'https://d3ey4dbjkt2f6s.cloudfront.net/assets/external/work_request_embed.css'
const SCRIPT_URL =
  'https://d3ey4dbjkt2f6s.cloudfront.net/assets/static_link/work_request_embed_snippet.js'

/** A full form is tall; the post-submit confirmation screen is short. */
const FORM_MIN_HEIGHT = 500
const CONFIRMATION_MAX_HEIGHT = 400

export default function JobberForm() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Jobber's stylesheet once
    if (!document.querySelector(`link[href="${CSS_URL}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = CSS_URL
      link.media = 'screen'
      document.head.appendChild(link)
    }
    // Load the embed script once; it finds the div below and injects the iframe
    if (!document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
      const script = document.createElement('script')
      script.src = SCRIPT_URL
      script.setAttribute('clienthub_id', CLIENTHUB_ID)
      script.setAttribute('form_url', JOBBER_FORM_URL)
      document.body.appendChild(script)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let engaged = false
    let submitted = false
    let tallestHeight = 0

    // Signal 1: the visitor clicked into the form
    const onBlur = () => {
      if (engaged) return
      const active = document.activeElement
      if (active?.tagName === 'IFRAME' && container.contains(active)) {
        engaged = true
        trackEvent('InitiateCheckout')
      }
    }

    // Signal 2: the form collapsed into a confirmation screen
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
