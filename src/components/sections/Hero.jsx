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
      {/* Background image with overlay */}
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
        <p className="eyebrow">Aranea — Web Agency Italiana</p>

        <h1 className={styles.headline}>
          Tessiamo infrastrutture digitali<br />
          <span className={styles.accentLine}>che trasformano il web</span><br />
          in vantaggio competitivo
        </h1>

        <p className={styles.sub}>
          Aranea progetta ecosistemi digitali in cui strategia, tecnologia, contenuti,
          automazione e performance lavorano come una rete intelligente:<br />
          <strong>solida, precisa, misurabile.</strong>
        </p>

        <p className={styles.subSmall}>
          Siti web ad alte prestazioni, e-commerce, AI solutions, SEO evoluta,
          automazioni e piattaforme su misura: ogni nodo è progettato per rafforzare il tuo business.
        </p>

        <div className={styles.ctas}>
          <a href="#cta" className="btn-primary">
            Parliamo del tuo progetto
          </a>
          <a href="#services" className="btn-secondary">
            Scopri i servizi
          </a>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollHint} aria-hidden="true">
          <div className={styles.scrollLine} />
          <span>Scroll</span>
        </div>
      </div>
    </section>
  )
})

export default Hero
