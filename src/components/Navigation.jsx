import { useEffect, useRef, useState } from 'react'
import styles from './Navigation.module.css'

const SECTIONS = [
  { label: 'Home',        href: '#hero' },
  { label: 'Ecosistema',  href: '#ecosystem' },
  { label: 'Servizi',     href: '#services' },
  { label: 'AI',          href: '#ai' },
  { label: 'SEO',         href: '#seo' },
  { label: 'Performance', href: '#performance' },
  { label: 'Metodo',      href: '#method' },
  { label: 'Contatti',    href: '#cta' },
]

export default function Navigation({ currentSection }) {
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return

    const obs = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0.1 }
    )
    obs.observe(hero)
    return () => obs.disconnect()
  }, [])

  const handleClick = (e, href) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav
      ref={navRef}
      className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}
      aria-label="Navigation principale"
    >
      <div className={styles.inner}>
        {/* Logo */}
        <a href="#hero" className={styles.logo} onClick={(e) => handleClick(e, '#hero')}>
          <img
            src="https://www.araneaweb.com/wp-content/uploads/2026/02/Risorsa-5ara.svg"
            alt="Aranea"
            className={styles.logoImg}
          />
        </a>

        {/* Section dots */}
        <div className={styles.dots} role="tablist" aria-label="Sezioni">
          {SECTIONS.map((s, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={currentSection === i}
              aria-label={s.label}
              className={`${styles.dot} ${currentSection === i ? styles.dotActive : ''}`}
              onClick={(e) => handleClick(e, s.href)}
              title={s.label}
            />
          ))}
        </div>

        {/* CTA */}
        <a
          href="#cta"
          className={styles.ctaBtn}
          onClick={(e) => handleClick(e, '#cta')}
        >
          Contattaci
        </a>
      </div>
    </nav>
  )
}
