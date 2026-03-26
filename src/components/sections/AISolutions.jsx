import { forwardRef } from 'react'
import styles from './AISolutions.module.css'

const AISolutions = forwardRef(function AISolutions(_, ref) {
  return (
    <section
      ref={ref}
      id="ai"
      data-section-index="3"
      className={`${styles.ai} section-layer`}
    >
      <div className={`container ${styles.grid}`}>
        {/* Left: image */}
        <div className={styles.imageWrap}>
          <img
            src="https://www.araneaweb.com/wp-content/uploads/2026/02/Firefly_GeminiFlash-7.png"
            alt="AI Solutions"
            loading="lazy"
            className={styles.image}
          />
          <div className={styles.imageOverlay} />
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            AI-Powered
          </div>
        </div>

        {/* Right: text */}
        <div className={styles.text}>
          <p className="eyebrow">AI Solutions</p>
          <h2 className="section-title">
            AI solutions<br />
            <span className="accent">e agenti intelligenti</span>
          </h2>
          <p className="body-text">
            Progettiamo soluzioni AI concrete, integrate nei processi e orientate al risultato.
            Non demo da mostrare: strumenti da usare.
          </p>
          <p className="body-text">
            Chatbot e assistenti AI per siti e customer care, agenti per lead qualification
            e supporto commerciale, workflow intelligenti per marketing, sales e operation.
          </p>
          <p className="body-text">
            La vera differenza non sarà avere l'AI, ma inserirla nei punti in cui fa risparmiare
            tempo, migliora il servizio e aumenta la qualità delle decisioni.
          </p>

          <div className={styles.features}>
            {[
              'Chatbot e assistenti conversazionali',
              'Agenti per lead qualification',
              'Workflow intelligenti',
              'Integrazione con CRM e piattaforme',
            ].map(f => (
              <div key={f} className={styles.feature}>
                <div className={styles.featureDot} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})

export default AISolutions
