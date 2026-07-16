import { useEffect, useRef, useState } from 'react'

/**
 * True once the element first enters the viewport (fires once, then disconnects).
 * `rootMargin` lets you shrink the trigger area — e.g. '0px 0px -15% 0px' only
 * fires once the element clears the bottom 15% of the screen.
 */
export function useInView<T extends HTMLElement>(
  threshold = 0.3,
  rootMargin = '0px',
) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold, rootMargin },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold, rootMargin])

  return { ref, inView }
}
