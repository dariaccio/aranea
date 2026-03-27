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
      <div className={styles.bg}>
        <img
          src="https://www.araneaweb.com/wp-content/uploads/2026/02/Firefly.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.inner}>
        {/* Spacer reserves space for the particle logo above the text */}
        <div className={styles.logoSpacer} aria-hidden="true" />

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
          <a
            href="https://tidycal.com/team/aranea/consulenza-informatica-team-point-1g54756"
            className="btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Prenota una consulenza
          </a>
          <a
            href="https://tidycal.com/team/aranea/consulenza-informatica-team-point-1g54756-mn27npx"
            className="btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Parliamo del tuo progetto
          </a>
        </div>

        <div className={styles.footer}>
          <span className={styles.footerTag}>
            ARANEAWEB.COM &nbsp;|&nbsp; 2026 ALL RIGHTS RESERVED &nbsp;|&nbsp;
            ARANEA is a trademark of BIT CANTIERI SRL &nbsp;|&nbsp;
            VAT number 04281290165 &nbsp;|&nbsp; REA BG &ndash; 450560 &nbsp;|&nbsp; Vers. 1.00
          </span>
        </div>
      </div>
    </section>
  )
})

export default CTAFinal
