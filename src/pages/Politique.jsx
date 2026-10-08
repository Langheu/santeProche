import { Link } from 'react-router-dom';
import { SITE } from '../site.js';
import './Politique.css';

function scrollToSection(e, id) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const SECTIONS = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'collecte', title: 'Données collectées' },
  { id: 'utilisation', title: 'Utilisation des données' },
  { id: 'partage', title: 'Partage des données' },
  { id: 'conservation', title: 'Conservation des données' },
  { id: 'securite', title: 'Sécurité' },
  { id: 'droits', title: 'Vos droits' },
  { id: 'tiers', title: 'Services tiers' },
  { id: 'modifications', title: 'Modifications' },
  { id: 'contact', title: 'Nous contacter' },
];

export default function Politique() {
  return (
    <div className="page-politique">
      <main>
        <section className="bg-success align-items-center d-flex" style={{ background: 'url(/assets/images/pattern/04.png) no-repeat center center', backgroundSize: 'cover' }}>
          <div className="container">
            <div className="row">
              <div className="col-12 text-center">
                <h1 className="text-white">Politique de Confidentialité</h1>
                <div className="d-flex justify-content-center">
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb breadcrumb-dark breadcrumb-dots mb-0">
                      <li className="breadcrumb-item">
                        <Link to="/">Accueil</Link>
                      </li>
                      <li aria-current="page" className="breadcrumb-item active">Politique de Confidentialité</li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="privacy-section">
          <div className="container">
            <div className="row g-5">
              <div className="col-lg-3">
                <aside className="privacy-sidebar">
                  <div className="privacy-sidebar-inner">
                    <span className="privacy-sidebar-label">SUR CETTE PAGE</span>
                    <h2>Sommaire</h2>
                    <nav className="privacy-navigation">
                      {SECTIONS.map((s, i) => (
                        <a key={s.id} href={`#${s.id}`} onClick={e => scrollToSection(e, s.id)}>
                          <span>{String(i + 1).padStart(2, '0')}</span> {s.title}
                        </a>
                      ))}
                    </nav>
                  </div>
                </aside>
              </div>

              <div className="col-lg-9">
                <article className="privacy-content">
                  <section id="introduction" className="privacy-block">
                    <div className="privacy-heading">
                      <span>01</span>
                      <div>
                        <small>INTRODUCTION</small>
                        <h2>Introduction</h2>
                      </div>
                    </div>
                    <p>
                      Chez <strong>{SITE.name}</strong>, nous prenons très au sérieux la protection de vos données personnelles.
                    </p>
                    <p>Cette politique de confidentialité explique quelles informations nous collectons, comment nous les utilisons et les mesures que nous prenons pour protéger vos données.</p>
                  </section>

                  <section id="collecte" className="privacy-block">
                    <div className="privacy-heading">
                      <span>02</span>
                      <div>
                        <small>DONNÉES COLLECTÉES</small>
                        <h2>Quelles données collectons-nous ?</h2>
                      </div>
                    </div>
                    <p>Lorsque vous utilisez {SITE.name}, nous collectons :</p>
                    <p>
                      • Votre localisation (si vous acceptez la demande de géolocalisation).<br />
                      • Votre numéro de téléphone (lors de l'envoi d'une ordonnance ou d'un message).<br />
                      • Votre adresse (lors d'une demande spécifique).<br />
                      • Les ordonnances que vous nous envoyez en photo.<br />
                      • Les messages que vous nous écrivez via le formulaire de contact.
                    </p>
                    <p>Nous collectons également des données techniques : adresse IP, type de navigateur, pages consultées.</p>
                  </section>

                  <section id="utilisation" className="privacy-block">
                    <div className="privacy-heading">
                      <span>03</span>
                      <div>
                        <small>UTILISATION</small>
                        <h2>Comment utilisons-nous vos données ?</h2>
                      </div>
                    </div>
                    <p>Vos données sont utilisées pour :</p>
                    <p>
                      • Traiter votre ordonnance et vous contacter à son sujet.<br />
                      • Vous envoyer les informations que vous avez demandées.<br />
                      • Analyser l'utilisation du site pour l'améliorer.<br />
                      • Répondre à vos messages et questions.
                    </p>
                    <p><strong>Nous ne vendons jamais vos données personnelles à des tiers.</strong></p>
                  </section>

                  <section id="partage" className="privacy-block">
                    <div className="privacy-heading">
                      <span>04</span>
                      <div>
                        <small>PARTAGE</small>
                        <h2>Partage de vos données</h2>
                      </div>
                    </div>
                    <p>Vos données peuvent être partagées avec :</p>
                    <p>
                      • Les pharmacies et cliniques du réseau (lorsque vous demandez une ordonnance).<br />
                      • Nos prestataires techniques (hébergement, sécurité) qui signent un accord de confidentialité.
                    </p>
                    <p>Nous n'envoyons jamais vos données à des organismes externes sans votre consentement explicite, sauf exigence légale.</p>
                  </section>

                  <section id="conservation" className="privacy-block">
                    <div className="privacy-heading">
                      <span>05</span>
                      <div>
                        <small>CONSERVATION</small>
                        <h2>Combien de temps conservons-nous vos données ?</h2>
                      </div>
                    </div>
                    <p>Vos données sont conservées aussi longtemps que nécessaire pour traiter votre demande, puis supprimées :</p>
                    <p>
                      • Données de géolocalisation : non enregistrées.<br />
                      • Ordonnances : conservées 30 jours, puis supprimées.<br />
                      • Messages de contact : conservés 6 mois, puis supprimés.<br />
                      • Données techniques (logs) : conservées 90 jours, puis supprimées.
                    </p>
                  </section>

                  <section id="securite" className="privacy-block">
                    <div className="privacy-heading">
                      <span>06</span>
                      <div>
                        <small>SÉCURITÉ</small>
                        <h2>Sécurité de vos données</h2>
                      </div>
                    </div>
                    <p>
                      Vos données sont stockées sur des serveurs sécurisés avec chiffrement SSL/TLS. Seul {SITE.name} a accès à vos données.
                    </p>
                    <p>Nous prenons toutes les mesures raisonnables pour protéger vos informations contre l'accès non autorisé ou la modification.</p>
                  </section>

                  <section id="droits" className="privacy-block">
                    <div className="privacy-heading">
                      <span>07</span>
                      <div>
                        <small>VOS DROITS</small>
                        <h2>Vos droits</h2>
                      </div>
                    </div>
                    <p>Conformément à la loi, vous avez le droit de :</p>
                    <p>
                      • Accéder à vos données personnelles.<br />
                      • Corriger vos données si elles sont inexactes.<br />
                      • Supprimer vos données (« droit à l'oubli »).<br />
                      • Refuser le traitement de vos données.<br />
                      • Recevoir vos données dans un format portable.
                    </p>
                    <p>Pour exercer ces droits, écrivez-nous à {SITE.email}.</p>
                  </section>

                  <section id="tiers" className="privacy-block">
                    <div className="privacy-heading">
                      <span>08</span>
                      <div>
                        <small>SERVICES TIERS</small>
                        <h2>Services tiers</h2>
                      </div>
                    </div>
                    <p>{SITE.name} utilise les services tiers suivants :</p>
                    <p>
                      • <strong>Google Maps</strong> : pour afficher les itinéraires.<br />
                      • <strong>WhatsApp</strong> : pour les liens de contact.
                    </p>
                    <p>Ces services ont leurs propres politiques de confidentialité. Nous vous recommandons de les consulter.</p>
                  </section>

                  <section id="modifications" className="privacy-block">
                    <div className="privacy-heading">
                      <span>09</span>
                      <div>
                        <small>MODIFICATIONS</small>
                        <h2>Modifications de cette politique</h2>
                      </div>
                    </div>
                    <p>{SITE.name} peut modifier cette politique à tout moment. Les modifications entrent en vigueur dès leur publication.</p>
                    <p>Nous vous informerons par email si des changements importants surviennent.</p>
                  </section>

                  <section id="contact" className="privacy-block privacy-contact">
                    <div className="privacy-heading">
                      <span>10</span>
                      <div>
                        <small>NOUS CONTACTER</small>
                        <h2>Nous contacter</h2>
                      </div>
                    </div>
                    <p>Pour toute question concernant cette politique de confidentialité :</p>
                    <div className="privacy-contact-grid">
                      <a href={`mailto:${SITE.email}`} className="privacy-contact-card">
                        <span className="privacy-contact-icon">
                          <i className="fas fa-envelope"></i>
                        </span>
                        <span>
                          <small>Email</small>
                          <strong>{SITE.email}</strong>
                        </span>
                        <i className="fas fa-arrow-right privacy-contact-arrow"></i>
                      </a>
                      <a href={`tel:${SITE.phoneHref}`} className="privacy-contact-card">
                        <span className="privacy-contact-icon">
                          <i className="fas fa-phone"></i>
                        </span>
                        <span>
                          <small>Téléphone</small>
                          <strong>{SITE.phone}</strong>
                        </span>
                        <i className="fas fa-arrow-right privacy-contact-arrow"></i>
                      </a>
                    </div>
                  </section>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
