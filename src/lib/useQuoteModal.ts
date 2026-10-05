import { createContext, useContext } from 'react'

/** Opens the Jobber quote modal. Provided by <QuoteModalProvider>. */
export const QuoteModalContext = createContext<() => void>(() => {})

export function useQuoteModal() {
  return useContext(QuoteModalContext)
}
