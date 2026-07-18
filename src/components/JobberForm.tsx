import { useEffect } from 'react'

/**
 * Official Jobber work-request embed. The form fields themselves are managed
 * in Jobber's form builder (form_id below), not here; leads land directly in
 * the client's Jobber account. Only ONE instance can exist per page: the
 * snippet targets this exact div id.
 */
const CLIENTHUB_ID = '904054a4-16aa-4594-a937-c7b3c349a75d-4882418'
export const JOBBER_FORM_URL =
  'https://clienthub.getjobber.com/client_hubs/904054a4-16aa-4594-a937-c7b3c349a75d/public/work_request/embedded_work_request_form?form_id=4882418'
const CSS_URL =
  'https://d3ey4dbjkt2f6s.cloudfront.net/assets/external/work_request_embed.css'
const SCRIPT_URL =
  'https://d3ey4dbjkt2f6s.cloudfront.net/assets/static_link/work_request_embed_snippet.js'

export default function JobberForm() {
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

  return <div id={CLIENTHUB_ID} />
}
