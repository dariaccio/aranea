import { forwardRef } from 'react'
import styles from './Hero.module.css'

const Hero = forwardRef(function Hero(_, ref) {
  return (
    <section
      ref={ref}
      id="hero"
      data-section-index="0"
      className={`${styles.hero} section-layer`}
    >
      <div className={styles.bg}>
        <img
          src="https://www.araneaweb.com/wp-content/uploads/2026/02/Firefly_GeminiFlash_Inquadratura-cinematografica-in-stile-thriller-tecnologico-ingresso-di-un-complesso-69772.png"
          alt=""
          aria-hidden="true"
          loading="eager"
        />
        <div className={styles.overlay} />
      </div>

      <div className={`container ${styles.content}`}>
        {/* Flashing logo badge — matches standalone.html hero-kicker */}
        <div className={styles.kicker}>
          <img
            className={styles.kickerLogo}
            src="https://www.araneaweb.com/wp-content/uploads/2026/02/Risorsa-5ara.svg"
            alt="Aranea"
          />
          Aranea Web and Digital Agency
        </div>

        <h1 className={styles.headline}>
          <span>Tessiamo infrastrutture</span><br />
          <span className={styles.gradText}>digitali che trasformano</span><br />
          <span>il web in vantaggio competitivo</span>
        </h1>

        <p className={styles.sub}>
          Aranea progetta ecosistemi digitali in cui strategia, tecnologia, contenuti,
          automazione e performance lavorano come una rete intelligente:{' '}
          <strong>solida, precisa, misurabile.</strong>
        </p>

        <p className={styles.subSmall}>
          Siti web ad alte prestazioni, e-commerce, AI solutions, SEO evoluta,
          automazioni e piattaforme su misura.
        </p>

        <div className={styles.ctas}>
          <a
            href="https://tidycal.com/team/aranea/consulenza-informatica-team-point-1g54756-mn27npx"
            className="btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Parliamo del tuo progetto
          </a>
          <a
            href="https://tidycal.com/team/aranea/consulenza-informatica-team-point-1g54756"
            className="btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Prenota una consulenza
          </a>
        </div>

        <div className={styles.scrollHint} aria-hidden="true">
          <div className={styles.scrollLine} />
        </div>
      </div>
    </section>
  )
})

export default Hero
