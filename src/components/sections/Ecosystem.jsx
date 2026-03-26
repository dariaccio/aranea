import { forwardRef } from 'react'
import styles from './Ecosystem.module.css'

const Ecosystem = forwardRef(function Ecosystem(_, ref) {
  return (
    <section
      ref={ref}
      id="ecosystem"
      data-section-index="1"
      className={`${styles.ecosystem} section-layer`}
    >
      <div className={`container ${styles.grid}`}>
        {/* Left: text */}
        <div className={styles.text}>
          <p className="eyebrow">L'ecosistema Aranea</p>
          <h2 className="section-title">
            Ogni business ha bisogno di una rete.<br />
            <span className="accent">La domanda è:<br />quanto è solida la tua?</span>
          </h2>
          <p className="body-text">
            In natura, la ragnatela non è decorazione: è architettura, strategia, sensibilità, controllo.
            Ogni filo ha una funzione. Ogni connessione risponde a un obiettivo.
          </p>
          <p className="body-text">
            Aranea applica questa logica al digitale: costruiamo presenze online che non si limitano
            a esserci, ma trasformano il web in un sistema capace di attrarre, orientare, convertire
            e crescere nel tempo.
          </p>
          <p className="body-text">
            Per questo uniamo visione strategica, design essenziale, sviluppo robusto e strumenti
            intelligenti, creando infrastrutture digitali pronte a sostenere il business oggi e ad
            adattarsi rapidamente a quello che verrà domani.
          </p>

          <div className={styles.stats}>
            {[
              { n: '10+', label: 'anni di expertise' },
              { n: '200+', label: 'progetti completati' },
              { n: '98%', label: 'clienti soddisfatti' },
            ].map(({ n, label }) => (
              <div key={n} className={styles.stat}>
                <span className={styles.statNum}>{n}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: image */}
        <div className={styles.imageWrap}>
          <div className={styles.imageBorder} />
          <img
            src="https://www.araneaweb.com/wp-content/uploads/2026/02/Firefly_GeminiFlash-8-scaled.png"
            alt="Ecosistema digitale Aranea"
            loading="lazy"
            className={styles.image}
          />
          <div className={styles.imageGlow} />
        </div>
      </div>
    </section>
  )
})

export default Ecosystem
