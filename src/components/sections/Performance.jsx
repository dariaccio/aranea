import { forwardRef } from 'react'
import styles from './Performance.module.css'

const Performance = forwardRef(function Performance(_, ref) {
  return (
    <section
      ref={ref}
      id="performance"
      data-section-index="5"
      className={`${styles.perf} section-layer`}
    >
      <div className={`container ${styles.grid}`}>
        {/* Left: image */}
        <div className={styles.imageWrap}>
          <img
            src="https://www.araneaweb.com/wp-content/uploads/2026/02/Firefly_GeminiFlash_Fotografia-cinematografica-low-key-in-un-ufficio-moderno-e-minimale-primo-piano-di-m-69772.png"
            alt="Performance e conversione"
            loading="lazy"
            className={styles.image}
          />
          <div className={styles.imageOverlay} />

          {/* Growth indicator */}
          <div className={styles.indicator}>
            <svg width="60" height="40" viewBox="0 0 60 40" fill="none" aria-hidden="true">
              <polyline
                points="2,36 18,24 30,28 42,14 58,4"
                stroke="var(--color-particle-core)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="58" cy="4" r="3" fill="var(--color-particle-core)" />
            </svg>
            <span className={styles.indicatorLabel}>Crescita continua</span>
          </div>
        </div>

        {/* Right: text */}
        <div className={styles.text}>
          <p className="eyebrow">Performance & Conversione</p>
          <h2 className="section-title">
            Conversione,<br />
            <span className="accent">performance,</span><br />
            crescita continua
          </h2>
          <p className="body-text">
            Più visite non significano automaticamente più risultati. Una rete ben progettata
            lavora sulla qualità delle interazioni, non sul volume fine a sé stesso.
          </p>
          <p className="body-text">
            Ottimizziamo funnel, user experience, CTA, pagine chiave, percorsi di contatto
            e acquisto. Analizziamo i dati, riduciamo attriti e miglioriamo ciò che conta:
            lead, opportunità, vendite.
          </p>
          <p className="body-text">
            Il go-live non è un punto d'arrivo: è l'inizio della propagazione.
          </p>

          <div className={styles.kpis}>
            {[
              { label: 'Conversion Rate Optimization', icon: '◈' },
              { label: 'Funnel & UX Analysis',          icon: '◈' },
              { label: 'A/B Testing & Iterazione',      icon: '◈' },
              { label: 'Analytics e Reporting',         icon: '◈' },
            ].map(({ label, icon }) => (
              <div key={label} className={styles.kpi}>
                <span className={styles.kpiIcon}>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})

export default Performance
