import { SITE, whatsappLink } from '../site.js';
import './GestionClinique.css';

const CONTACT_LINK = whatsappLink(`Bonjour, je souhaite une démonstration de ${SITE.name} pour ma clinique.`);

const STATS = [
  { value: '1 outil', label: 'pour l’accueil, les soins et la caisse' },
  { value: '0 papier', label: 'dossiers patients numérisés' },
  { value: '24 h/24', label: 'accès sécurisé à vos données' },
  { value: '100 %', label: 'paramétrable selon vos services' },
];

const FEATURES = [
  { icon: 'fas fa-user-plus', title: 'Accueil des patients', text: 'Création du dossier en quelques secondes, retrouvé instantanément à la visite suivante.' },
  { icon: 'fas fa-calendar-check', title: 'Rendez-vous', text: 'Planning partagé entre médecins et secrétariat, avec rappels aux patients.' },
  { icon: 'fas fa-notes-medical', title: 'Dossier médical', text: 'Consultations, examens et prescriptions réunis dans une même fiche.' },
  { icon: 'fas fa-flask-vial', title: 'Laboratoire', text: 'Demandes d’analyses et résultats transmis directement au médecin.' },
  { icon: 'fas fa-cash-register', title: 'Facturation', text: 'Actes, encaissements et parts d’assurance suivis sans ressaisie.' },
  { icon: 'fas fa-pills', title: 'Pharmacie interne', text: 'Stock de médicaments et consommables mis à jour à chaque délivrance.' },
];

const CONNECT = [
  { icon: 'fas fa-map-location-dot', title: 'Votre clinique visible sur la carte des patients' },
  { icon: 'fas fa-prescription', title: 'Ordonnances transmises aux pharmacies partenaires' },
  { icon: 'fas fa-shield-heart', title: 'Échanges avec les assureurs simplifiés' },
];

export default function GestionClinique() {
  return (
    <div className="page-gestionclinique">
      <main>
        <section className="hero">
          <div className="hero-inner">
            <div>
              <div className="hero-badge">
                <span>Logiciel pour cliniques et centres de santé</span>
              </div>
              <h1>
                Toute votre clinique,
                <br />
                <em>dans un seul écran.</em>
              </h1>
              <p className="hero-desc">
                Accueil, consultations, analyses, caisse et pharmacie : {SITE.name} relie tous vos services pour que
                l’information suive le patient, pas l’inverse.
              </p>
              <div className="hero-actions">
                <a href={CONTACT_LINK} target="_blank" rel="noreferrer" className="btn-primary">
                  Demander une démo
                </a>
                <a href="#fonctionnalites" className="btn-ghost">
                  Voir les fonctionnalités
                </a>
              </div>
            </div>

            <div className="hero-visual">
              <div className="mock-card">
                <div className="mock-header">
                  <span className="mock-title">Patients reçus cette semaine</span>
                  <span className="mock-badge">+12 %</span>
                </div>
                <div className="mock-big-num">248</div>
                <div className="mock-sub">Exemple de tableau de bord</div>
                <div className="mock-bar-row">
                  {[1, 1, 1, 1, 0, 1, 1].map((fill, i) => (
                    <div key={i} className={`mock-bar${fill ? ' fill' : ''}`} style={{ height: `${30 + ((i * 37) % 60)}%` }}></div>
                  ))}
                </div>
              </div>
              <div className="mock-card">
                <div className="mock-header">
                  <span className="mock-title">Stock de la pharmacie interne</span>
                  <span className="mock-badge">À jour</span>
                </div>
                <div className="mock-list">
                  <div className="mock-item">
                    <div className="mock-dot ok"></div>
                    <span className="mock-item-name">Gants d’examen</span>
                    <span className="mock-item-qty">540</span>
                    <span className="mock-tag ok">OK</span>
                  </div>
                  <div className="mock-item">
                    <div className="mock-dot warn"></div>
                    <span className="mock-item-name">Sérum physiologique</span>
                    <span className="mock-item-qty">18</span>
                    <span className="mock-tag low">Bas</span>
                  </div>
                  <div className="mock-item">
                    <div className="mock-dot ok"></div>
                    <span className="mock-item-name">Seringues 5 ml</span>
                    <span className="mock-item-qty">1 200</span>
                    <span className="mock-tag ok">OK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="stats-bar">
          <div className="stats-inner">
            {STATS.map(s => (
              <div className="stat-item reveal visible" key={s.label}>
                <div className="stat-num">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <section className="section features" id="fonctionnalites">
          <div>
            <div className="reveal visible">
              <span className="section-label">Fonctionnalités</span>
              <h2 className="section-title">
                Chaque service,
                <br />
                enfin connecté aux autres
              </h2>
              <p className="section-desc">Des modules que vous activez selon la taille et l’organisation de votre établissement.</p>
            </div>
            <div className="features-grid">
              {FEATURES.map(f => (
                <div className="feature-card" key={f.title}>
                  <div className="feature-icon">
                    <i className={f.icon} style={{ color: '#fff' }}></i>
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section connect">
          <div className="connect-inner">
            <div className="reveal visible">
              <span className="section-label">Réseau</span>
              <h2 className="section-title">
                Votre clinique,
                <br />
                ouverte sur son quartier
              </h2>
              <p className="section-desc">En rejoignant {SITE.name}, vous profitez aussi du réseau de pharmacies et d’assureurs.</p>
              <ul className="connect-list">
                {CONNECT.map(c => (
                  <li key={c.title}>
                    <div className="icon-wrap">
                      <i className={c.icon}></i>
                    </div>
                    <div>
                      <strong>{c.title}</strong>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="connect-visual">
              <div className="connect-flow">
                <p>Le trajet d’une ordonnance</p>
                <div className="flow-row">
                  <div className="flow-node dark">
                    <span>Clinique</span>
                    <small>prescription</small>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-node dark">
                    <span>{SITE.name}</span>
                    <small>recherche du stock</small>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-node dark">
                    <span>Pharmacie</span>
                    <small>délivrance</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>
            Envie de voir l’outil
            <br />
            en conditions réelles ?
          </h2>
          <p>Nous venons le présenter à votre équipe, sur place ou en visio.</p>
          <a href={CONTACT_LINK} target="_blank" rel="noreferrer" className="btn-white">
            Planifier une démonstration
          </a>
        </section>
      </main>
    </div>
  );
}
