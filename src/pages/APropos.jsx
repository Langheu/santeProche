import { Link } from 'react-router-dom';
import { SITE } from '../site.js';
import useStats from '../hooks/useStats.js';
import './APropos.css';

const MINI_CARDS = [
  { variant: 'pharmacy', icon: 'fas fa-prescription-bottle-medical', label: 'Pharmacies', title: 'Ouvertes maintenant', text: 'Le statut se met à jour selon l’heure.' },
  { variant: 'guard', icon: 'fas fa-clock', label: 'De garde', title: 'La nuit et le dimanche', text: 'Les officines qui restent disponibles.' },
  { variant: 'patient', icon: 'fas fa-user', label: 'Patients', title: 'Sans inscription', text: 'Tout est consultable librement.' },
];

const PROBLEMS = [
  { icon: 'fas fa-location-dot', title: 'Des allers-retours inutiles', text: 'On se déplace d’une officine à l’autre sans savoir si le produit y est.' },
  { icon: 'fas fa-pills', title: 'Des prix difficiles à comparer', text: 'Le même médicament peut coûter plus ou moins cher selon le quartier.' },
  { icon: 'fas fa-network-wired', title: 'Une information éparpillée', text: 'Horaires, numéros et adresses sont rarement réunis au même endroit.' },
];

const VALUES = [
  { icon: 'fas fa-scale-balanced', title: 'Neutralité', text: 'Aucun établissement n’est mis en avant contre paiement dans les résultats.' },
  { icon: 'fas fa-people-group', title: 'Proximité', text: 'Nous travaillons avec les pharmaciens et les soignants du terrain.' },
  { icon: 'fas fa-eye', title: 'Clarté', text: 'Des informations simples, lisibles sur n’importe quel téléphone.' },
  { icon: 'fas fa-leaf', title: 'Sobriété', text: 'Un site léger, qui fonctionne même avec une connexion modeste.' },
];

const NUMBERS = [
  { key: 'pharmacies', label: 'pharmacies référencées' },
  { key: 'cliniques', label: 'cliniques et centres' },
  { value: '7j/7', label: 'informations disponibles' },
];

export default function APropos() {
  const stats = useStats();
  return (
    <div className="page-apropos">
      <main className="about">
        <section className="about-hero">
          <div className="container">
            <div className="about-hero-wrapper">
              <div className="about-hero-content">
                <span className="about-hero-label">Qui sommes-nous</span>
                <h1>
                  Rendre l’accès aux soins
                  <span> plus simple, quartier par quartier.</span>
                </h1>
                <p>
                  {SITE.name} est né d’un constat banal : trouver un médicament ou une pharmacie ouverte prend souvent bien plus
                  de temps que nécessaire. Nous avons voulu réunir ces informations en un seul endroit.
                </p>
                <div className="about-hero-actions">
                  <Link className="about-hero-button" to="/contact">
                    Nous contacter <i className="fas fa-arrow-right"></i>
                  </Link>
                  <a href="#notre-mission" className="about-hero-link">
                    Notre mission <i className="fas fa-arrow-down"></i>
                  </a>
                </div>
              </div>

              <div className="about-hero-visual">
                <div className="about-hero-cards">
                  <div className="about-feature-card about-feature-card--main">
                    <div className="about-feature-card__top">
                      <div className="about-feature-card__icon">
                        <i className="fas fa-pills"></i>
                      </div>
                      <span className="about-feature-card__badge">Disponible</span>
                    </div>
                    <div className="about-feature-card__content">
                      <span>Exemple de recherche</span>
                      <h3>Paracétamol 500 mg</h3>
                      <p>En stock dans 6 pharmacies autour de vous.</p>
                    </div>
                    <div className="about-feature-card__footer">
                      <span>
                        <i className="fas fa-location-dot"></i> La plus proche à 400 m
                      </span>
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>

                  {MINI_CARDS.map(card => (
                    <div className={`about-feature-card about-feature-card--${card.variant}`} key={card.variant}>
                      <div className="about-feature-card__small-icon">
                        <i className={card.icon}></i>
                      </div>
                      <div>
                        <span className="about-feature-card__mini-label">{card.label}</span>
                        <h4>{card.title}</h4>
                        <p>{card.text}</p>
                      </div>
                    </div>
                  ))}

                  <div className="about-feature-card about-feature-card--search">
                    <div className="about-feature-card__search-icon">
                      <i className="fas fa-magnifying-glass"></i>
                    </div>
                    <div>
                      <strong>Une seule recherche</strong>
                      <span>pharmacies, cliniques, médicaments</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="notre-mission" className="about-mission">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-5">
                <span className="about-section-label">Notre mission</span>
                <h2 className="about-section-title">
                  Moins chercher, <span>mieux se soigner.</span>
                </h2>
              </div>
              <div className="col-lg-7">
                <div className="about-mission-text">
                  <p className="about-lead">
                    Nous voulons qu’en quelques secondes, chacun sache où trouver ce dont il a besoin pour se soigner.
                  </p>
                  <p>
                    Concrètement, nous recensons les pharmacies, cliniques et centres de santé, leurs horaires et, quand
                    c’est possible, les médicaments qu’ils ont en stock.
                  </p>
                  <p>
                    Pour les professionnels, c’est une vitrine gratuite et un moyen d’être trouvés par les patients qui
                    habitent à côté.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-problem">
          <div className="container">
            <div className="row justify-content-center text-center">
              <div className="col-xl-7">
                <span className="about-section-label">Le point de départ</span>
                <h2 className="about-section-title">
                  Ce qui complique <span>le quotidien des patients</span>
                </h2>
                <p className="about-section-description">Trois difficultés que nous entendons sans cesse, et que nous voulons résoudre.</p>
              </div>
            </div>
            <div className="row g-4 mt-4">
              {PROBLEMS.map((p, i) => (
                <div className="col-md-4" key={p.title}>
                  <div className="about-problem-card">
                    <div className="about-card-number">{String(i + 1).padStart(2, '0')}</div>
                    <div className="about-problem-icon">
                      <i className={p.icon}></i>
                    </div>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-values">
          <div className="container">
            <div className="row justify-content-center text-center">
              <div className="col-xl-7">
                <span className="about-section-label">Nos principes</span>
                <h2 className="about-section-title">
                  Ce qui guide <span>nos choix</span>
                </h2>
                <p className="about-section-description">Quatre engagements qui s’appliquent à chaque fonctionnalité que nous ajoutons.</p>
              </div>
            </div>
            <div className="row g-4 mt-4">
              {VALUES.map(v => (
                <div className="col-lg-3 col-sm-6" key={v.title}>
                  <div className="about-value-card">
                    <div className="about-value-icon">
                      <i className={v.icon}></i>
                    </div>
                    <h3>{v.title}</h3>
                    <p>{v.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-numbers">
          <div className="container">
            <div className="about-numbers-wrapper">
              <div className="row g-0">
                {NUMBERS.map(n => (
                  <div className="col-md-4" key={n.label}>
                    <div className="about-number-item">
                      <strong>{n.key ? stats?.[n.key] ?? '—' : n.value}</strong>
                      <span>{n.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="about-vision">
          <div className="container">
            <div className="row justify-content-center text-center">
              <div className="col-xl-8">
                <span className="about-section-label">Et demain ?</span>
                <h2 className="about-vision-title">
                  Couvrir toute la ville, <span>puis tout le pays.</span>
                </h2>
                <p>
                  Nous élargissons le réseau quartier après quartier, en commençant par les zones où trouver une pharmacie
                  ouverte est le plus difficile.
                </p>
                <p>Chaque nouvel établissement partenaire rend le service plus utile pour tout le monde.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-cta">
          <div className="container">
            <div className="about-cta-wrapper">
              <div>
                <span>Professionnels de santé</span>
                <h2>Rejoignez le réseau {SITE.name}</h2>
                <p>Le référencement de base est gratuit et prend quelques minutes.</p>
              </div>
              <Link className="about-cta-button" to="/devenir-partenaire-pharmacie">
                Devenir partenaire <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
