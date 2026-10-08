import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../site.js';
import './ConditionUtilisation.css';

function scrollToSection(e, id) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const SECTIONS = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'definition', title: 'Définitions' },
  { id: 'utilisation', title: "Conditions d'utilisation" },
  { id: 'donnees', title: 'Données personnelles' },
  { id: 'precision', title: 'Précision des informations' },
  { id: 'responsabilite', title: 'Limitation de responsabilité' },
  { id: 'medicaments', title: 'Information sur les médicaments' },
  { id: 'propriete', title: 'Propriété intellectuelle' },
  { id: 'modifications', title: 'Modifications des conditions' },
  { id: 'contact', title: 'Contact' },
];

export default function ConditionUtilisation() {
  return (
    <div className="page-conditionutilisation">
      <main>
        <section className="bg-success align-items-center d-flex" style={{ background: 'url(/assets/images/pattern/04.png) no-repeat center center', backgroundSize: 'cover' }}>
          <div className="container">
            <div className="row">
              <div className="col-12 text-center">
                <h1 className="text-white">Conditions d'utilisation</h1>
                <div className="d-flex justify-content-center">
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb breadcrumb-dark breadcrumb-dots mb-0">
                      <li className="breadcrumb-item">
                        <Link to="/">Accueil</Link>
                      </li>
                      <li aria-current="page" className="breadcrumb-item active">Conditions d'utilisation</li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="terms-section">
          <div className="container">
            <div className="row g-5">
              <div className="col-lg-3">
                <aside className="terms-sidebar">
                  <div className="terms-sidebar-inner">
                    <span className="terms-sidebar-label">SUR CETTE PAGE</span>
                    <h2>Sommaire</h2>
                    <nav className="terms-navigation">
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
                <article className="terms-content">
                  <section id="introduction" className="terms-block">
                    <div className="terms-heading">
                      <span>01</span>
                      <div>
                        <small>INTRODUCTION</small>
                        <h2>Introduction</h2>
                      </div>
                    </div>
                    <p>
                      Bienvenue sur <strong>{SITE.name}</strong>. En accédant à ce site et en l'utilisant, vous acceptez de vous conformer aux présentes Conditions d'utilisation et d'être lié par celles-ci.
                    </p>
                    <p>Si vous n'acceptez pas ces Conditions, veuillez ne pas utiliser le site.</p>
                  </section>

                  <section id="definition" className="terms-block">
                    <div className="terms-heading">
                      <span>02</span>
                      <div>
                        <small>DÉFINITIONS</small>
                        <h2>Définitions</h2>
                      </div>
                    </div>
                    <p>« Service » désigne l'ensemble des fonctionnalités et contenus fournis par {SITE.name}.</p>
                    <p>« Utilisateur » désigne vous-même, ou tout visiteur du site, qu'il soit inscrit ou non.</p>
                    <p>« Contenu » désigne les textes, images, données et tout matériel mis à disposition sur le service.</p>
                  </section>

                  <section id="utilisation" className="terms-block">
                    <div className="terms-heading">
                      <span>03</span>
                      <div>
                        <small>UTILISATION</small>
                        <h2>Conditions d'utilisation du service</h2>
                      </div>
                    </div>
                    <p>Vous acceptez d'utiliser {SITE.name} uniquement à titre personnel et légal. Vous ne devez pas :</p>
                    <p>
                      • Reproduire, modifier, copier ou distribuer le contenu du site sans permission.<br />
                      • Utiliser des robots, scrapers ou outils automatisés pour accéder au service.<br />
                      • Transmettre des virus, logiciels malveillants ou tout code nuisible.<br />
                      • Harceler, menacer ou insulter d'autres utilisateurs.
                    </p>
                  </section>

                  <section id="donnees" className="terms-block">
                    <div className="terms-heading">
                      <span>04</span>
                      <div>
                        <small>DONNÉES PERSONNELLES</small>
                        <h2>Données personnelles</h2>
                      </div>
                    </div>
                    <p>Nous nous engageons à protéger votre vie privée et vos données personnelles conformément à notre <Link to="/politique-confidentialite" className="terms-link">Politique de Confidentialité</Link>.</p>
                    <p>En utilisant le site, vous reconnaissez que vos informations peuvent être collectées, utilisées et traitées conformément aux dispositions décrites dans cette politique.</p>
                  </section>

                  <section id="precision" className="terms-block">
                    <div className="terms-heading">
                      <span>05</span>
                      <div>
                        <small>PRÉCISION</small>
                        <h2>Précision des informations</h2>
                      </div>
                    </div>
                    <p>{SITE.name} s'efforce de maintenir à jour les horaires, coordonnées et disponibilités des établissements partenaires. Cependant, certaines informations peuvent être obsolètes.</p>
                    <p>Avant de vous déplacer, nous vous conseillons d'appeler l'établissement pour confirmer les horaires et la disponibilité des produits.</p>
                  </section>

                  <section id="responsabilite" className="terms-block">
                    <div className="terms-heading">
                      <span>06</span>
                      <div>
                        <small>RESPONSABILITÉ</small>
                        <h2>Limitation de responsabilité</h2>
                      </div>
                    </div>
                    <p>{SITE.name} est fourni « tel quel ». Nous ne garantissons pas qu'il fonctionnera sans interruption ni qu'il sera exempt de bugs.</p>
                    <p>En aucun cas {SITE.name} ne pourra être tenu responsable des dommages résultant de votre utilisation du service.</p>
                    <p><strong>En cas d'urgence vitale, rendez-vous directement aux urgences.</strong></p>
                  </section>

                  <section id="medicaments" className="terms-block">
                    <div className="terms-heading">
                      <span>07</span>
                      <div>
                        <small>MÉDICAMENTS</small>
                        <h2>Information sur les médicaments</h2>
                      </div>
                    </div>
                    <p>{SITE.name} ne remplace pas un conseil pharmacien ou médical. Consultez toujours un professionnel de santé en cas de doute.</p>
                  </section>

                  <section id="propriete" className="terms-block">
                    <div className="terms-heading">
                      <span>08</span>
                      <div>
                        <small>PROPRIÉTÉ INTELLECTUELLE</small>
                        <h2>Propriété intellectuelle</h2>
                      </div>
                    </div>
                    <p>Tout contenu du site (textes, logos, images, code) est la propriété de {SITE.name} ou de ses partenaires et est protégé par les lois sur les droits d'auteur.</p>
                    <p>Vous ne pouvez pas reproduire, modifier ou distribuer ce contenu sans permission écrite préalable.</p>
                  </section>

                  <section id="modifications" className="terms-block">
                    <div className="terms-heading">
                      <span>09</span>
                      <div>
                        <small>MODIFICATIONS</small>
                        <h2>Modifications des conditions</h2>
                      </div>
                    </div>
                    <p>{SITE.name} se réserve le droit de modifier ces conditions à tout moment. Les modifications entrent en vigueur dès leur publication sur le site.</p>
                  </section>

                  <section id="contact" className="terms-block terms-contact">
                    <div className="terms-heading">
                      <span>10</span>
                      <div>
                        <small>CONTACT</small>
                        <h2>Contact</h2>
                      </div>
                    </div>
                    <p>Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter :</p>
                    <a href={`mailto:${SITE.email}`} className="terms-contact-card">
                      <span className="terms-contact-icon">
                        <i className="fas fa-envelope"></i>
                      </span>
                      <span>
                        <small>Adresse e-mail</small>
                        <strong>{SITE.email}</strong>
                      </span>
                      <i className="fas fa-arrow-right terms-contact-arrow"></i>
                    </a>
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
