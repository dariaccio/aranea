import { forwardRef } from 'react'
import styles from './Services.module.css'

const CARDS = [
  {
    num: '01',
    title: 'Siti web strategici',
    body: 'Progettiamo siti corporate, istituzionali e onepage ad alte prestazioni, pensati per comunicare autorevolezza, semplificare il percorso utente e trasformare l\'interesse in contatto.',
    detail: 'Velocità, chiarezza, contenuti ben strutturati e una base tecnica pronta a dialogare con campagne, analytics, CRM e strumenti AI.',
    tags: ['Corporate', 'Landing Page', 'Performance', 'CMS'],
  },
  {
    num: '02',
    title: 'E-commerce e piattaforme',
    body: 'Realizziamo e-commerce e sistemi digitali che non si fermano all\'estetica: vendono meglio, organizzano meglio, scalano meglio.',
    detail: 'Cataloghi evoluti, funnel di acquisto, integrazioni con pagamenti, CRM, gestionali, prenotazioni, aree riservate e processi su misura.',
    tags: ['WooCommerce', 'Custom', 'Integrazioni', 'Scalabile'],
  },
  {
    num: '03',
    title: 'Automazioni e processi',
    body: 'Uniamo strategia e tecnologia per eliminare attività ripetitive, connettere strumenti e rendere più fluido il lavoro.',
    detail: 'Form intelligenti, nurturing, lead management, integrazioni tra sito, email, CRM, database e dashboard operative.',
    tags: ['Make', 'Zapier', 'CRM', 'Lead Management'],
  },
]

const Services = forwardRef(function Services(_, ref) {
  return (
    <section
      ref={ref}
      id="services"
      data-section-index="2"
      className={`${styles.services} section-layer`}
    >
      <div className="container">
        <div className={styles.header}>
          <p className="eyebrow">I nostri servizi</p>
          <h2 className="section-title">
            Servizi digitali costruiti<br />
            <span className="accent">per durare, crescere</span><br />
            e generare valore
          </h2>
          <p className={styles.intro}>
            Non realizziamo semplici siti web. Progettiamo ecosistemi digitali in cui strategia,
            tecnologia, contenuti, automazione e performance lavorano come una rete intelligente:
            solida, precisa, misurabile.
          </p>
        </div>

        <div className={styles.cards}>
          {CARDS.map((card) => (
            <article key={card.num} className={styles.card}>
              <div className={styles.cardNum}>{card.num}</div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardBody}>{card.body}</p>
              <p className={styles.cardDetail}>{card.detail}</p>
              <div className={styles.tags}>
                {card.tags.map(t => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>
              <div className={styles.cardLine} aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
})

export default Services
