import type { ReactNode } from 'react'
import { useInView } from '../lib/useInView'

type Direction = 'up' | 'left' | 'right'

const HIDDEN: Record<Direction, string> = {
  up: 'translate-y-6 opacity-0',
  left: '-translate-x-10 opacity-0',
  right: 'translate-x-10 opacity-0',
}

/**
 * Scroll-entrance wrapper: fades/slides children in the first time they reach
 * their position on screen. `delay` staggers siblings that enter together.
 */
export default function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: {
  children: ReactNode
  delay?: number
  direction?: Direction
  className?: string
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2, '0px 0px -10% 0px')

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`transition-all duration-700 ease-out ${
        inView ? 'translate-x-0 translate-y-0 opacity-100' : HIDDEN[direction]
      } ${className}`}
    >
      {children}
    </div>
  )
}
