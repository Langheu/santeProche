import { Link } from 'react-router-dom';
import { SITE } from '../site.js';
import './GestionPharmacie.css';

const BENEFITS = [
  { icon: 'fas fa-chart-line', title: 'Plus de passages au comptoir', text: 'Les patients du quartier vous trouvent au moment où ils cherchent un produit.' },
  { icon: 'fas fa-boxes-stacked', title: 'Votre stock mis en avant', text: 'Indiquez les produits disponibles : vous apparaissez dans les recherches correspondantes.' },
  { icon: 'fas fa-users', title: 'Une relation de confiance', text: 'Horaires et gardes toujours à jour : vos clients savent quand passer.' },
];

const PLANS = [
  {
    icon: 'fas fa-wifi',
    badge: 'Pour commencer',
    name: 'Essentiel',
    price: 'Gratuit',
    period: '',
    text: 'La fiche de base pour être visible.',
    featuresTitle: 'Inclus',
    features: ['Fiche avec adresse et téléphone', 'Horaires d’ouverture', 'Statut ouvert / fermé', 'Lien d’itinéraire', 'Bouton d’appel direct'],
  },
  {
    icon: 'fas fa-rocket',
    badge: 'Le plus choisi',
    name: 'Visibilité',
    price: 'Sur devis',
    period: '',
    text: 'Pour être trouvé sur vos médicaments.',
    featuresTitle: 'Tout Essentiel, plus',
    featured: true,
    features: [
      'Publication de votre stock',
      'Affichage de vos prix',
      'Signalement des gardes',
      'Réception des ordonnances',
      'Statistiques de consultation',
      'Assistance prioritaire',
    ],
  },
  {
    icon: 'fas fa-server',
    badge: 'Sur mesure',
    name: 'Connecté',
    price: 'Sur devis',
    period: '',
    text: 'Votre logiciel de caisse relié au site.',
    featuresTitle: 'Tout Visibilité, plus',
    variant: 'local',
    features: [
      'Synchronisation automatique du stock',
      'Mise à jour des prix en temps réel',
      'Accompagnement à l’installation',
      'Formation de votre équipe',
      'Suivi technique dédié',
    ],
  },
];

const FEATURES = [
  { icon: 'fas fa-box-open', title: 'Gestion du stock', text: 'Ajoutez, retirez ou marquez un produit en rupture en quelques clics.' },
  { icon: 'fas fa-layer-group', title: 'Catalogue clair', text: 'Vos produits classés par famille, faciles à retrouver pour les patients.' },
  { icon: 'fas fa-cart-shopping', title: 'Demandes de patients', text: 'Recevez les ordonnances envoyées par les patients de votre zone.' },
  { icon: 'fas fa-truck', title: 'Lien avec les grossistes', text: 'Préparez vos réapprovisionnements à partir des ruptures signalées.' },
  { icon: 'fas fa-chart-column', title: 'Statistiques', text: 'Voyez quels produits sont les plus recherchés autour de vous.' },
  { icon: 'fas fa-mobile-screen-button', title: 'Depuis votre téléphone', text: 'Tout se gère depuis un smartphone, sans matériel supplémentaire.' },
];

export default function GestionPharmacie() {
  return (
    <div className="page-gestionpharmacie">
      <main>
        <section className="partner-intro">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-8 col-lg-10 text-center">
                <span className="partner-label">Pharmaciens</span>
                <h2 className="partner-title">Faites venir les patients de votre quartier</h2>
                <p className="partner-description">
                  Chaque jour, des habitants cherchent sur {SITE.name} une pharmacie ouverte ou un médicament précis.
                  Assurez-vous qu’ils tombent sur la vôtre.
                </p>
                <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginTop:20}}><Link to="/inscription-pharmacie" className="btn btn-success">Inscrire ma pharmacie</Link><Link to="/espace-pharmacie" className="btn btn-outline-success">Se connecter à mon espace</Link></div>
              </div>
            </div>
          </div>
        </section>

        <section className="partner-benefits">
          <div className="container">
            <div className="row g-4">
              {BENEFITS.map(b => (
                <div className="col-lg-4" key={b.title}>
                  <div className="partner-benefit-card">
                    <div className="partner-benefit-icon">
                      <i className={b.icon}></i>
                    </div>
                    <h4>{b.title}</h4>
                    <p>{b.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="partner-pricing">
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-xl-8 text-center">
                <span className="partner-label">Formules</span>
                <h2 className="partner-title">Choisissez votre niveau de visibilité</h2>
                <p className="partner-description">Commencez gratuitement, évoluez quand vous le souhaitez.</p>
              </div>
            </div>
            <div className="row g-4 align-items-stretch">
              {PLANS.map(plan => (
                <div className="col-lg-4" key={plan.name}>
                  <div className={`pricing-card${plan.featured ? ' pricing-card--featured' : ''}${plan.variant ? ` pricing-card--${plan.variant}` : ''}`}>
                    {plan.featured && <div className="pricing-popular">Recommandé</div>}
                    <div className="pricing-card__header">
                      <div className="pricing-icon">
                        <i className={plan.icon}></i>
                      </div>
                      <span className="pricing-badge">{plan.badge}</span>
                      <h3>{plan.name}</h3>
                      <div className="pricing-price">
                        <strong>{plan.price}</strong>
                        <span>{plan.period}</span>
                      </div>
                      <p>{plan.text}</p>
                    </div>
                    <div className="pricing-card__body">
                      <h5>{plan.featuresTitle}</h5>
                      <ul className="pricing-features">
                        {plan.features.map(f => (
                          <li key={f}>
                            <i className="fas fa-check"></i> {f}
                          </li>
                        ))}
                      </ul>
                      <Link className={`btn ${plan.featured ? 'btn-success' : 'btn-outline-success'} pricing-button`} to="/contact">
                        {plan.price === 'Gratuit' ? 'Créer ma fiche' : 'Être recontacté'}
                        <i className="fas fa-arrow-right ms-2"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="partner-features">
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-xl-8 text-center">
                <span className="partner-label">Votre espace</span>
                <h2 className="partner-title">Des outils pensés pour l’officine</h2>
                <p className="partner-description">Simples à prendre en main, même au milieu d’une journée chargée.</p>
              </div>
            </div>
            <div className="row g-4">
              {FEATURES.map(f => (
                <div className="col-md-6 col-lg-4" key={f.title}>
                  <div className="feature-card">
                    <i className={f.icon}></i>
                    <h4>{f.title}</h4>
                    <p>{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="partner-cta">
          <div className="container">
            <div className="partner-cta__inner">
              <div>
                <span>Prêt à commencer ?</span>
                <h2>Votre fiche peut être en ligne dès aujourd’hui</h2>
                <p>Envoyez-nous vos coordonnées, nous nous occupons du reste.</p>
              </div>
              <Link className="btn btn-light partner-cta__button" to="/contact">
                Référencer ma pharmacie
                <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
