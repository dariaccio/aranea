import { useState, useCallback, useRef } from 'react'
import ParticleCanvas from './components/ParticleCanvas.jsx'
import Navigation    from './components/Navigation.jsx'
import Cursor        from './components/Cursor.jsx'
import Hero          from './components/sections/Hero.jsx'
import Ecosystem     from './components/sections/Ecosystem.jsx'
import Services      from './components/sections/Services.jsx'
import AISolutions   from './components/sections/AISolutions.jsx'
import SEO           from './components/sections/SEO.jsx'
import Performance   from './components/sections/Performance.jsx'
import Method        from './components/sections/Method.jsx'
import CTAFinal      from './components/sections/CTAFinal.jsx'
import { useLenis }      from './hooks/useLenis.js'
import { useScrollState } from './hooks/useScrollState.js'

const SECTION_COMPONENTS = [
  Hero, Ecosystem, Services, AISolutions,
  SEO, Performance, Method, CTAFinal
]

export default function App() {
  const [currentSection, setCurrentSection]    = useState(0)
  const scrollVelocityRef                       = useRef(0)

  // Init Lenis smooth scroll (must happen before particle system reads it)
  useLenis()

  const handleSectionChange = useCallback((newIndex, velocity) => {
    scrollVelocityRef.current = velocity
    setCurrentSection(newIndex)
  }, [])

  const { assignRef } = useScrollState(handleSectionChange)

  return (
    <>
      {/* WebGL particle layer — always in background */}
      <ParticleCanvas
        currentSection={currentSection}
        scrollVelocity={scrollVelocityRef.current}
      />

      {/* Custom cursor (desktop only) */}
      <Cursor />

      {/* Fixed navigation */}
      <Navigation currentSection={currentSection} />

      {/* Scrollable page content */}
      <main className="page-content">
        {SECTION_COMPONENTS.map((Section, i) => (
          <Section key={i} ref={assignRef(i)} />
        ))}
      </main>
    </>
  )
}
