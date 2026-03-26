import { forwardRef } from 'react'
import styles from './CTAFinal.module.css'

const CTAFinal = forwardRef(function CTAFinal(_, ref) {
  return (
    <section
      ref={ref}
      id="cta"
      data-section-index="7"
      className={`${styles.cta} section-layer`}
    >
      {/* Background image */}
      <div className={styles.bg}>
        <img
          src="https://www.araneaweb.com/wp-content/uploads/2026/02/Firefly.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
        <div className={styles.overlay} />
      </div>

      <div className={`container ${styles.content}`}>
        {/* Logo mark */}
        <div className={styles.logoMark} aria-hidden="true">
          <img
            src="/assets/risorsa5ara.svg"
            alt="Aranea logo"
            className={styles.logoImg}
            onError={(e) => {
              e.target.src = 'https://www.araneaweb.com/wp-content/uploads/2026/02/Risorsa-5ara.svg'
            }}
          />
        </div>

        <p className="eyebrow" style={{ justifyContent: 'center' }}>
          Il nodo da cui ripartire
        </p>

        <h2 className={styles.headline}>
          La tua presenza digitale<br />
          <span className={styles.accent}>è all'altezza del tuo business?</span>
        </h2>

        <p className={styles.body}>
          Se il tuo sito non rappresenta più il tuo livello, se i tuoi strumenti digitali sono
          scollegati, se vuoi vendere meglio, automatizzare di più e costruire una presenza
          realmente competitiva, Aranea è il nodo da cui ripartire.
        </p>

        <div className={styles.actions}>
          <a href="mailto:info@araneaweb.com" className="btn-primary">
            Richiedi un'analisi iniziale
          </a>
          <a href="mailto:info@araneaweb.com" className="btn-secondary">
            Parliamo del tuo progetto
          </a>
        </div>

        {/* Footer strip */}
        <div className={styles.footer}>
          <span className={styles.footerLogo}>Aranea</span>
          <span className={styles.footerSep} />
          <span className={styles.footerTagline}>Web architecture for growth</span>
          <span className={styles.footerSep} />
          <a href="mailto:info@araneaweb.com" className={styles.footerLink}>
            info@araneaweb.com
          </a>
        </div>
      </div>
    </section>
  )
})

export default CTAFinal
