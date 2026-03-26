import { forwardRef } from 'react'
import styles from './SEO.module.css'

const SEO = forwardRef(function SEO(_, ref) {
  return (
    <section
      ref={ref}
      id="seo"
      data-section-index="4"
      className={`${styles.seo} section-layer`}
    >
      <div className={`container ${styles.grid}`}>
        {/* Left: text */}
        <div className={styles.text}>
          <p className="eyebrow">SEO Evoluta</p>
          <h2 className="section-title">
            SEO evoluta<br />
            <span className="accent">per search e AI search</span>
          </h2>
          <p className="body-text">
            Ottimizziamo siti e contenuti per una visibilità che non dipende solo dal ranking
            tradizionale, ma dalla capacità di essere trovati, compresi e scelti in un
            ecosistema di ricerca sempre più ibrido.
          </p>
          <p className="body-text">
            SEO tecnica, architettura semantica, contenuti orientati all'intento di ricerca,
            performance, autorevolezza e struttura chiara per motori e sistemi AI.
          </p>
          <p className="body-text">
            Per i prossimi anni questa sarà una delle aree più decisive: non basta essere
            indicizzati, bisogna essere una fonte leggibile, credibile e preferibile.
          </p>

          <div className={styles.pillsRow}>
            {['SEO Tecnica','Semantic Architecture','Core Web Vitals','AI Search','Schema Markup','Content Strategy'].map(p => (
              <span key={p} className={styles.pill}>{p}</span>
            ))}
          </div>
        </div>

        {/* Right: image */}
        <div className={styles.imageWrap}>
          <img
            src="https://www.araneaweb.com/wp-content/uploads/2026/02/Firefly_GeminiFlash-3.png"
            alt="SEO evoluta"
            loading="lazy"
            className={styles.image}
          />
          <div className={styles.imageOverlay} />

          {/* Floating metric */}
          <div className={styles.metric}>
            <span className={styles.metricNum}>#1</span>
            <span className={styles.metricLabel}>Posizione organica</span>
          </div>
        </div>
      </div>
    </section>
  )
})

export default SEO
