import { useEffect, useRef } from 'react'
import Lenis from '@studio-freight/lenis'

let lenisInstance = null

export function getLenis() {
  return lenisInstance
}

export function useLenis() {
  const lenisRef = useRef(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.2,
      // Let Three.js tick call lenis.raf() — disable Lenis's own loop
      autoRaf: false
    })

    lenisRef.current  = lenis
    lenisInstance     = lenis

    return () => {
      lenis.destroy()
      lenisInstance = null
    }
  }, [])

  return lenisRef
}
