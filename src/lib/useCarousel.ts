import { useRef, useState } from 'react'

/** Scroll-snap carousel state: active slide tracking + programmatic navigation. */
export function useCarousel(count: number) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const onScroll = () => {
    const el = scrollerRef.current
    if (!el) return
    const slideWidth = el.scrollWidth / count
    setActive(Math.round(el.scrollLeft / slideWidth))
  }

  const scrollTo = (i: number) => {
    scrollerRef.current?.children[i]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }

  return { scrollerRef, active, onScroll, scrollTo }
}
