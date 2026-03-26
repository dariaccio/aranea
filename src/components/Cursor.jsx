import { useEffect, useRef } from 'react'
import styles from './Cursor.module.css'

export default function Cursor() {
  const dotRef   = useRef(null)
  const ringRef  = useRef(null)
  const rafRef   = useRef(null)

  // Current and lagging positions
  const mouse  = useRef({ x: window.innerWidth  / 2, y: window.innerHeight / 2 })
  const ring   = useRef({ x: window.innerWidth  / 2, y: window.innerHeight / 2 })
  const isHover = useRef(false)

  useEffect(() => {
    // Only show on pointer devices
    if (!window.matchMedia('(pointer: fine)').matches) return

    const dot  = dotRef.current
    const ringEl = ringRef.current
    if (!dot || !ringEl) return

    const onMouseMove = (e) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }

    const onMouseEnter = () => { isHover.current = true }
    const onMouseLeave = () => { isHover.current = false }

    // Detect interactive elements for hover state
    const interactives = 'a, button, [role="button"], input, textarea, label'
    document.querySelectorAll(interactives).forEach(el => {
      el.addEventListener('mouseenter', onMouseEnter)
      el.addEventListener('mouseleave', onMouseLeave)
    })

    // MutationObserver to pick up dynamically added elements
    const mutObs = new MutationObserver(() => {
      document.querySelectorAll(interactives).forEach(el => {
        el.addEventListener('mouseenter', onMouseEnter)
        el.addEventListener('mouseleave', onMouseLeave)
      })
    })
    mutObs.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('mousemove', onMouseMove)

    // Animation loop
    const LERP = 0.14
    function animate() {
      rafRef.current = requestAnimationFrame(animate)

      // Dot follows exactly
      dot.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px) translate(-50%, -50%)`

      // Ring lags behind
      ring.current.x += (mouse.current.x - ring.current.x) * LERP
      ring.current.y += (mouse.current.y - ring.current.y) * LERP
      ringEl.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%)`

      // Hover state
      if (isHover.current) {
        dot.classList.add(styles.dotHover)
        ringEl.classList.add(styles.ringHover)
      } else {
        dot.classList.remove(styles.dotHover)
        ringEl.classList.remove(styles.ringHover)
      }
    }
    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMouseMove)
      mutObs.disconnect()
    }
  }, [])

  return (
    <>
      <div ref={dotRef}  className={styles.dot}  aria-hidden="true" />
      <div ref={ringRef} className={styles.ring} aria-hidden="true" />
    </>
  )
}
