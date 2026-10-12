/**
 * Browser entry for the static blog pages: brings the server-rendered header
 * to life and mounts the islands the static HTML can't provide.
 */
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '../index.css'
import Header from '../components/Header'
import MobileActionBar from '../components/MobileActionBar'
import { QuoteModalProvider } from '../components/QuoteModal'

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
      <QuoteModalProvider>
        <MobileActionBar />
      </QuoteModalProvider>
    </StrictMode>,
  )
}
