import { forwardRef } from 'react'
import styles from './Method.module.css'

const STEPS = [
  {
    num: '01',
    title: 'Analisi',
    body: 'Leggiamo brand, mercato, obiettivi, criticità, strumenti esistenti e opportunità reali.',
  },
  {
    num: '02',
    title: 'Architettura',
    body: 'Definiamo struttura, contenuti, UX, tecnologia, integrazioni e priorità di crescita.',
  },
  {
    num: '03',
    title: 'Costruzione',
    body: 'Sviluppiamo sistemi digitali robusti, chiari, veloci e pensati per essere governabili nel tempo.',
  },
  {
    num: '04',
    title: 'Evoluzione',
    body: 'Monitoriamo, correggiamo, ottimizziamo. Una presenza digitale forte cresce con metodo, non per inerzia.',
  },
]

const Method = forwardRef(function Method(_, ref) {
  return (
    <section
      ref={ref}
      id="method"
      data-section-index="6"
      className={`${styles.method} section-layer`}
    >
      <div className="container">
        <div className={styles.header}>
          <p className="eyebrow">Il metodo</p>
          <h2 className="section-title">
            Il metodo <span className="accent">Aranea</span>
          </h2>
          <p className={styles.intro}>
            Ogni progetto nasce da una domanda semplice:<br />
            come deve funzionare la tua rete digitale per produrre valore reale?
          </p>
        </div>

        <div className={styles.steps}>
          {STEPS.map((step, i) => (
            <div key={step.num} className={styles.step}>
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className={styles.connector} aria-hidden="true">
                  <div className={styles.connectorLine} />
                  <div className={styles.connectorDot} />
                </div>
              )}

              <div className={styles.stepNum}>{step.num}</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

export default Method
