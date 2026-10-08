import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../site.js';
import './Grossiste.css';

const FLOW = [
  { title: 'La pharmacie signale une rupture', text: 'Le produit manquant est noté dans son espace.' },
  { title: 'Vous recevez la demande', text: 'Les grossistes partenaires voient les besoins de leur zone.' },
  { title: 'La commande est préparée', text: 'Vous confirmez la quantité et le délai de livraison.' },
];

const BENEFITS = [
  { icon: 'fas fa-store', title: 'De nouveaux clients', text: 'Entrez en contact avec des officines qui ne vous connaissaient pas encore.' },
  { icon: 'fas fa-cart-shopping', title: 'Des commandes plus nettes', text: 'Moins d’appels et de bons griffonnés : les demandes arrivent déjà structurées.' },
  { icon: 'fas fa-network-wired', title: 'Une vue sur le terrain', text: 'Repérez les produits qui manquent le plus dans chaque quartier.' },
];

const PLANS = [
  {
    label: 'En ligne',
    name: 'Catalogue',
    text: 'Votre offre consultable par les pharmacies partenaires.',
    price: 'Sur devis',
    unit: '',
    features: ['Publication de votre catalogue', 'Réception des demandes', 'Messagerie avec les pharmacies', 'Tableau de bord des commandes'],
  },
  {
    label: 'Intégré',
    name: 'Connexion logicielle',
    text: 'Votre outil de gestion relié directement au réseau.',
    price: 'Sur devis',
    unit: '',
    variant: 'local',
    features: ['Tout le catalogue en ligne', 'Synchronisation des stocks', 'Import automatique des commandes', 'Accompagnement technique'],
  },
];

const STEPS = [
  { title: 'Prise de contact', text: 'Présentez-nous votre activité et votre zone de livraison.' },
  { title: 'Mise en place', text: 'Nous importons votre catalogue avec vous.' },
  { title: 'Premières commandes', text: 'Les pharmacies de votre zone peuvent commander.' },
];

export default function Grossiste() {
  return (
    <div className="page-grossiste">
      <main>
        <section className="wholesale-intro">
          <div className="container">
            <div className="row justify-content-center text-center">
              <div className="col-xl-8">
                <span className="wholesale-section-label">Grossistes et distributeurs</span>
                <h2 className="wholesale-intro-title">
                  Soyez le premier appelé <span>quand une pharmacie est en rupture</span>
                </h2>
                <p className="wholesale-intro-description">
                  {SITE.name} relie les officines du réseau aux fournisseurs capables de les réapprovisionner rapidement.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="wholesale-bridge">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-5">
                <span className="wholesale-section-label">Comment ça circule</span>
                <h2 className="wholesale-bridge-title">
                  Du manque <span>à la livraison</span>
                </h2>
                <p className="wholesale-bridge-description">
                  Une chaîne courte et lisible, où chacun sait ce qu’il doit faire et quand.
                </p>
              </div>
              <div className="col-lg-7">
                <div className="wholesale-flow">
                  {FLOW.map((f, i) => (
                    <Fragment key={f.title}>
                      <div className="wholesale-flow-item">
                        <div className="wholesale-flow-number">{i + 1}</div>
                        <div>
                          <strong>{f.title}</strong>
                          <span>{f.text}</span>
                        </div>
                      </div>
                      {i < FLOW.length - 1 && <div className="wholesale-flow-line"></div>}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="wholesale-benefits">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-xl-7">
                <span className="wholesale-section-label">Avantages</span>
                <h2 className="wholesale-section-title">Ce que vous y gagnez</h2>
                <p className="wholesale-section-description">Un canal de vente supplémentaire, sans changer vos habitudes.</p>
              </div>
            </div>
            <div className="row g-4">
              {BENEFITS.map(b => (
                <div className="col-lg-4" key={b.title}>
                  <div className="wholesale-benefit">
                    <div className="wholesale-benefit-icon">
                      <i className={b.icon}></i>
                    </div>
                    <h3>{b.title}</h3>
                    <p>{b.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="wholesale-pricing">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-xl-7">
                <span className="wholesale-section-label">Offres</span>
                <h2 className="wholesale-section-title">Deux façons de nous rejoindre</h2>
                <p className="wholesale-section-description">Selon que vous avez déjà, ou non, un logiciel de gestion.</p>
              </div>
            </div>
            <div className="row justify-content-center g-4">
              {PLANS.map(plan => (
                <div className="col-lg-5" key={plan.name}>
                  <div className={`wholesale-pricing-card${plan.variant ? ` wholesale-pricing-card--${plan.variant}` : ''}`}>
                    <div className="wholesale-pricing-header">
                      <span className="wholesale-pricing-label">{plan.label}</span>
                      <h3>{plan.name}</h3>
                      <p>{plan.text}</p>
                    </div>
                    <div className="wholesale-pricing-price">
                      <strong>{plan.price}</strong>
                      <span>{plan.unit}</span>
                    </div>
                    <div className="wholesale-pricing-divider"></div>
                    <ul className="wholesale-pricing-features">
                      {plan.features.map(f => (
                        <li key={f}>
                          <i className="fas fa-check"></i>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link className="wholesale-pricing-button" to="/contact">
                      Nous contacter <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="wholesale-pricing-note text-center">
              <i className="fas fa-circle-info"></i>
              <span>Les tarifs dépendent du volume et de la zone couverte : parlons-en.</span>
            </div>
          </div>
        </section>

        <section className="wholesale-steps">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-xl-7">
                <span className="wholesale-section-label">Démarrage</span>
                <h2 className="wholesale-section-title">Opérationnel en trois étapes</h2>
              </div>
            </div>
            <div className="row g-4">
              {STEPS.map((s, i) => (
                <div className="col-md-4" key={s.title}>
                  <div className="wholesale-step">
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
