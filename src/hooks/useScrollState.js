import { useEffect, useRef, useCallback } from 'react'
import { getLenis } from './useLenis.js'

/**
 * Tracks the active section using IntersectionObserver.
 * Calls onSectionChange(newIndex, scrollVelocity) when section changes.
 * Returns sectionRefs to assign to each section element.
 */
export function useScrollState(onSectionChange) {
  const sectionRefs    = useRef([])
  const currentSection = useRef(0)
  const lastScrollY    = useRef(0)
  const scrollVelocity = useRef(0)
  const velocityTimer  = useRef(null)

  // Assign a ref by index
  const assignRef = useCallback((index) => (el) => {
    sectionRefs.current[index] = el
  }, [])

  useEffect(() => {
    // Track scroll velocity via Lenis scroll events
    const trackVelocity = ({ scroll }) => {
      scrollVelocity.current = Math.abs(scroll - lastScrollY.current)
      lastScrollY.current    = scroll
    }

    const lenis = getLenis()
    if (lenis) lenis.on('scroll', trackVelocity)

    // Fallback: track velocity via scroll event
    const onScroll = () => {
      scrollVelocity.current = Math.abs(window.scrollY - lastScrollY.current)
      lastScrollY.current    = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // IntersectionObserver for section entry
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const newIndex = parseInt(entry.target.dataset.sectionIndex, 10)
          if (isNaN(newIndex)) return
          if (newIndex === currentSection.current) return

          currentSection.current = newIndex
          onSectionChange(newIndex, scrollVelocity.current)
        })
      },
      {
        threshold:  0.45,
        rootMargin: '0px'
      }
    )

    // Observe all section refs
    const refs = sectionRefs.current
    refs.forEach((el) => { if (el) observer.observe(el) })

    return () => {
      observer.disconnect()
      if (lenis) lenis.off('scroll', trackVelocity)
      window.removeEventListener('scroll', onScroll)
      clearTimeout(velocityTimer.current)
    }
  }, [onSectionChange])

  return { sectionRefs, assignRef }
}
