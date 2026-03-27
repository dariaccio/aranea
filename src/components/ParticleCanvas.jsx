import { useEffect, useRef } from 'react'
import {
  initParticleSystem,
  triggerExplosion,
  setFormation,
  updatePointer,
  enterCTA,
  exitCTA
} from '../utils/particleSystem.js'
import { getLenis } from '../hooks/useLenis.js'

export default function ParticleCanvas({ currentSection, scrollVelocity }) {
  const canvasRef   = useRef(null)
  const prevSection = useRef(-1)
  const initialized = useRef(false)

  // Init Three.js particle system once canvas is mounted
  useEffect(() => {
    if (!canvasRef.current || initialized.current) return
    initialized.current = true

    const lenis   = getLenis()
    const cleanup = initParticleSystem(canvasRef.current, lenis)

    // Pointer / touch interaction
    const handleMouseMove = (e) => {
      updatePointer(
        (e.clientX / window.innerWidth)  * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      )
    }
    const handleTouchMove = (e) => {
      const t = e.touches[0]
      updatePointer(
        (t.clientX / window.innerWidth)  * 2 - 1,
        -(t.clientY / window.innerHeight) * 2 + 1
      )
    }
    const handleMouseLeave = () => updatePointer(9999, 9999)

    window.addEventListener('mousemove',  handleMouseMove)
    window.addEventListener('touchmove',  handleTouchMove,  { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave)

    // CTA section IntersectionObserver — triggers logo particle animation
    const ctaSection = document.querySelector('[data-section-index="7"]')
    let ctaObserver = null
    if (ctaSection) {
      ctaObserver = new IntersectionObserver(([entry]) => {
        if (entry.intersectionRatio >= 0.35) enterCTA()
        else if (entry.intersectionRatio < 0.04) exitCTA()
      }, { threshold: [0.04, 0.35] })
      ctaObserver.observe(ctaSection)
    }

    return () => {
      cleanup()
      window.removeEventListener('mousemove',  handleMouseMove)
      window.removeEventListener('touchmove',  handleTouchMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      if (ctaObserver) ctaObserver.disconnect()
    }
  }, [])

  // React to section changes
  useEffect(() => {
    if (prevSection.current === currentSection) return
    prevSection.current = currentSection

    const intensity = Math.min(2.0, (scrollVelocity || 0) * 0.015 + 0.7)
    triggerExplosion(intensity)

    const timer = setTimeout(() => {
      setFormation(currentSection)
    }, 320)

    return () => clearTimeout(timer)
  }, [currentSection, scrollVelocity])

  return (
    <div className="particle-canvas-wrapper">
      <canvas ref={canvasRef} />
    </div>
  )
}
