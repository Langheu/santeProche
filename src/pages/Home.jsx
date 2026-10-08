import { Link } from 'react-router-dom';
import { SITE, whatsappLink } from '../site.js';
import useStats from '../hooks/useStats.js';
import './Home.css';

const ACTIONS = [
  {
    to: '/medicaments',
    label: 'Trouver un médicament',
    primary: true,
    icon: (
      <>
        <circle cx="11" cy="11" r="7"></circle>
        <path d="m20 20-4-4"></path>
      </>
    ),
  },
  {
    to: '/pharmacies',
    label: 'Pharmacies près de moi',
    icon: (
      <>
        <path d="M3 10h18"></path>
        <path d="M5 10v9"></path>
        <path d="M19 10v9"></path>
        <path d="M4 19h16"></path>
        <path d="M5 10 7 4h10l2 6"></path>
      </>
    ),
  },
  {
    to: '/cliniques',
    label: 'Cliniques et centres de soins',
    icon: (
      <>
        <path d="M3 21h18"></path>
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
        <path d="M9 8h6"></path>
        <path d="M12 5v6"></path>
      </>
    ),
  },
  {
    to: '/scanner-ordonnance',
    label: 'Envoyer mon ordonnance',
    icon: (
      <>
        <path d="M6 3h9l3 3v15H6z"></path>
        <path d="M9 10h6"></path>
        <path d="M9 14h6"></path>
        <path d="M9 18h3"></path>
      </>
    ),
  },
];

const STATS = [
  { icon: 'bi bi-shop', key: 'pharmacies', label: 'Pharmacies référencées' },
  { icon: 'bi bi-hospital', key: 'cliniques', label: 'Cliniques et centres' },
  { icon: 'bi bi-capsule', key: 'medicaments', label: 'Médicaments suivis' },
  { icon: 'bi bi-moon-stars', key: 'garde', label: 'Pharmacies de garde' },
];

const STEPS = [
  {
    number: '01',
    icon: 'fas fa-magnifying-glass',
    label: 'Chercher',
    title: 'Tapez ce dont vous avez besoin',
    text: 'Le nom d’un médicament, d’une pharmacie ou simplement votre quartier suffit.',
  },
  {
    number: '02',
    icon: 'fas fa-circle-check',
    label: 'Comparer',
    title: 'Voyez qui est ouvert et à quel prix',
    text: 'Horaires du jour, prix pratiqués et distance s’affichent d’un coup d’œil.',
  },
  {
    number: '03',
    icon: 'fas fa-location-dot',
    label: 'Y aller',
    title: 'Laissez-vous guider',
    text: 'Appelez directement l’établissement ou ouvrez l’itinéraire dans votre application de cartes.',
  },
];

export default function Home() {
  const stats = useStats();
  return (
    <div className="page-home">
      <main>
        <section className="health-hero">
          <div className="health-hero__container">
            <div className="health-hero__content">
              <h1>
                Vos soins,
                <br className="desktop-only" />
                <strong className="brandColor"> au coin de la rue.</strong>
              </h1>
              <p className="health-hero__description">
                Plus besoin de faire le tour des pharmacies pour un seul médicament. {SITE.name} vous montre où il est
                disponible, quelles officines sont ouvertes maintenant et comment rejoindre la clinique la plus proche.
              </p>
              <div className="health-hero__actions">
                {ACTIONS.map(action => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className={`health-action${action.primary ? ' health-action--primary' : ''}`}
                  >
                    <span className="health-action__icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {action.icon}
                      </svg>
                    </span>
                    <span>{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="health-hero__visual">
              <img src="/img/hero.svg" alt="Carte de la ville avec les pharmacies proches" className="health-hero__image" />
            </div>
          </div>
        </section>

        <section className="stats-strip">
          <div className="stats-container">
            {STATS.map(stat => (
              <div className="col-md-3 col-6" key={stat.label}>
                <div className="stat-item">
                  <div className="stat-icon">
                    <i className={stat.icon}></i>
                  </div>
                  <div className="stat-info">
                    <strong>{stats?.[stat.key] ?? '—'}</strong>
                    <span>{stat.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="home-process-section">
          <div className="container">
            <div className="home-section-heading text-center">
              <span className="home-section-label">En trois gestes</span>
              <h2 className="home-section-title">
                Du besoin à la bonne adresse, <span className="brandColor">sans détour.</span>
              </h2>
              <p className="home-section-description mx-auto">
                Que ce soit pour une ordonnance urgente ou un simple conseil, voici comment {SITE.name} vous fait gagner du temps.
              </p>
            </div>
            <div className="home-process-grid">
              {STEPS.map(step => (
                <div className="home-process-item" key={step.number}>
                  <span className="home-process-number">{step.number}</span>
                  <div className="home-process-icon">
                    <i className={step.icon}></i>
                  </div>
                  <span className="home-process-label">{step.label}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section alt">
          <div className="container">
            <div className="cta-band">
              <div className="cta-text">
                <h2>Vous tenez une pharmacie ou une clinique ?</h2>
                <p>Rejoignez {SITE.name} pour que les patients de votre quartier vous trouvent plus facilement.</p>
              </div>
              <div className="cta-actions">
                <Link to="/devenir-partenaire-pharmacie" className="btn btn-light">
                  Devenir partenaire
                </Link>
                <a
                  href={whatsappLink(`Bonjour, je souhaite référencer mon établissement sur ${SITE.name}.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-light"
                >
                  Nous écrire
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
