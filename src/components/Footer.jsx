import { Link } from 'react-router-dom';
import { SITE } from '../site.js';

const NAVIGATION = [
  { label: 'Accueil', to: '/' },
  { label: 'Pour les pharmacies', to: '/devenir-partenaire-pharmacie' },
  { label: 'Inscrire ma pharmacie', to: '/inscription-pharmacie' },
  { label: 'Espace pharmacie', to: '/espace-pharmacie' },
  { label: 'Pour les grossistes', to: '/devenir-partenaire-grossiste' },
  { label: 'FAQ', to: '/faq' },
];

const SERVICES = [
  { label: 'Trouver un médicament', to: '/medicaments' },
  { label: 'Pharmacies proches', to: '/pharmacies' },
  { label: 'Cliniques et centres de santé', to: '/cliniques' },
  { label: 'Pharmacies de garde', to: '/pharmacie-garde' },
];

const SOCIALS = [
  { key: 'facebook', icon: 'fa-facebook-f', cls: 'text-facebook' },
  { key: 'instagram', icon: 'fa-instagram', cls: 'text-instagram' },
  { key: 'twitter', icon: 'fa-twitter', cls: 'text-twitter' },
  { key: 'linkedin', icon: 'fa-linkedin-in', cls: 'text-linkedin' },
];

function LinkList({ items }) {
  return (
    <ul className="nav flex-column">
      {items.map(item => (
        <li className="nav-item" key={item.to}>
          <Link className="nav-link" to={item.to}>
            <i className="fas fa-angle-right me-2"></i> {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  return (
    <footer className="pt-5 border-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-3">
            <Link to="/" className="me-0">
              <img src="/img/logo/logo.svg" alt={SITE.name} className="light-mode-item h-40px" />
              <img src="/img/logo/logo.svg" alt={SITE.name} className="dark-mode-item h-40px" />
            </Link>
            <p className="my-3">
              {SITE.name} rassemble en un seul endroit les pharmacies, les médicaments et les centres de soins de votre ville,
              pour que trouver de l'aide médicale ne prenne plus qu'un instant.
            </p>
          </div>
          <div className="col-6 col-md-3">
            <h5 className="mb-2 text-success mb-md-4">Navigation</h5>
            <LinkList items={NAVIGATION} />
          </div>
          <div className="col-6 col-md-3">
            <h5 className="mb-2 text-success mb-md-4">Services</h5>
            <LinkList items={SERVICES} />
          </div>
          <div className="col-lg-3">
            <h5 className="mb-2 text-success mb-md-4">Nous joindre</h5>
            <p className="mb-2">
              Téléphone{' '}
              <span className="h6 fw-light ms-2">
                <strong><a href={`tel:${SITE.phoneHref}`}>{SITE.phone}</a></strong>
              </span>
            </p>
            <p className="mb-0">
              Email :{' '}
              <span className="h6 fw-light ms-2">
                <strong><a href={`mailto:${SITE.email}`}>{SITE.email}</a></strong>
              </span>
            </p>
            <ul className="list-inline mb-0 mt-3">
              {SOCIALS.map((s, i) => (
                <li className={`list-inline-item${i ? ' ms-1' : ''}`} key={s.key}>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className={`btn btn-sm btn-white px-2 shadow ${s.cls}`}
                    href={SITE.socials[s.key]}
                    aria-label={s.key}
                  >
                    <i className={`${s.icon} fa-fw fab`}></i>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <hr className="mt-4 mb-0" />
        <div className="py-3">
          <div className="container px-0">
            <div className="d-lg-flex justify-content-between align-items-center py-3 text-center text-md-left">
              <div className="text-body text-primary-hover">
                © {new Date().getFullYear()} {SITE.name}. Tous droits réservés.
              </div>
              <div className="justify-content-center mt-3 mt-lg-0">
                <ul className="nav list-inline justify-content-center mb-0">
                  <li className="list-inline-item">
                    <Link className="nav-link" to="/condition-utilisations">Conditions d'utilisation</Link>
                  </li>
                  <li className="list-inline-item">
                    <Link className="nav-link pe-0" to="/politique-confidentialite">Confidentialité</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
