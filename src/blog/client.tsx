/**
 * Browser entry for the static blog pages: brings the server-rendered header
 * to life and mounts the islands the static HTML can't provide.
 */
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '../index.css'
import Header from '../components/Header'
import MobileActionBar from '../components/MobileActionBar'
import { trackEvent, trackPhoneClicks } from '../lib/tracking'

trackPhoneClicks()

// The static quote links (/#quote-form) count like the home page's CTAs
document.addEventListener('click', (e) => {
  if ((e.target as Element | null)?.closest?.('a[href="/#quote-form"]')) {
    trackEvent('ViewContent')
  }
})

const headerRoot = document.getElementById('header-root')
if (headerRoot) {
  hydrateRoot(
    headerRoot,
    <StrictMode>
      <Header />
    </StrictMode>,
  )
}

const islandsRoot = document.getElementById('islands-root')
if (islandsRoot) {
  createRoot(islandsRoot).render(
    <StrictMode>
      <MobileActionBar />
    </StrictMode>,
  )
}
