import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getEstablishment } from '../data/api.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import './ShowPharmacie.css';

const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const WEEK = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

// "09:00:00" -> "09h 00"
const formatTime = time => {
  if (!time) return '';
  const [h, m] = time.split(':');
  return `${h}h ${m}`;
};

const mapUrl = ({ latitude, longitude }) => `https://www.google.com/maps?q=${latitude},${longitude}&output=embed`;

export default function ShowPharmacie() {
  const { slug } = useParams();
  const [pharmacie, setPharmacie] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = DAYS[new Date().getDay()];

  useDocumentTitle(pharmacie?.nom);

  useEffect(() => {
    setLoading(true);
    getEstablishment(slug)
      .then(setPharmacie)
      .catch(err => {
        console.error(err);
        setPharmacie(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const p = pharmacie;
  const isClinic = p?.type_etablissement === 'clinique';

  return (
    <div className="page-showpharmacie">
      <main>
        <section
          className="bg-success align-items-center d-flex"
          style={{ background: 'url(/assets/images/pattern/04.png) no-repeat center center', backgroundSize: 'cover' }}
        >
          <div className="container text-center">
            <h1 className="pharma-title text-white">{p?.nom}</h1>
            <p className="pharma-subtitle text-white">
              {p && `${p.ville} • ${p.pays}`}
            </p>
            <nav aria-label="breadcrumb" className="d-flex justify-content-center mt-2">
              <ol className="breadcrumb text-white">
                <li className="breadcrumb-item text-white">
                  <Link to="/">Accueil</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to={isClinic ? '/cliniques' : '/pharmacies'}>{isClinic ? 'Cliniques' : 'Pharmacies'}</Link>
                </li>
                <li className="breadcrumb-item active">{p?.nom}</li>
              </ol>
            </nav>
          </div>
        </section>
        {p ? (
          <section className="container py-4">
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="card p-4 shadow-sm border-0">
                  <h5>Informations</h5>
                  <hr />
                  {p.image && <img src={p.image} alt={p.nom} className="w-100 mb-3" style={{ maxHeight: 260, objectFit: 'cover', borderRadius: 12 }} />}
                  {p.description && <p className="mb-3">{p.description}</p>}
                  <h6>Adresse</h6>
                  <p>
                    <i className="bi bi-geo-alt-fill text-success me-1"></i>{' '}
                    {p.adresse}, {p.ville}
                  </p>
                  <h6>Téléphone</h6>
                  <p>
                    <i className="bi bi-telephone-fill me-1"></i>{' '}
                    {p.telephone || 'Non renseigné'}
                  </p>
                  {p.email && (
                    <>
                      <h6>Email</h6>
                      <p>
                        <i className="bi bi-envelope-fill me-1"></i>{' '}
                        {p.email}
                      </p>
                    </>
                  )}
                  <hr />
                  <h5>Horaires d'ouverture</h5>
                  <div className="schedule">
                    {WEEK.map(day => (
                      <div className={`schedule-item${day === today ? ' active' : ''}`} key={day}>
                        <span>{capitalize(day)}</span>
                        <span>
                          {p[`${day}_ouvert`]
                            ? `${formatTime(p[`${day}_heure_ouverture`])} - ${formatTime(p[`${day}_heure_fermeture`])}`
                            : p[`${day}_ouvert`] == null ? 'Non renseigné' : 'Fermé'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card p-3 shadow-sm border-0">
                  <h6 className="d-flex justify-content-between align-items-center">
                    <span>Statut</span>
                    <span className={`badge ${p.statusText === 'Ouvert' ? 'bg-success' : 'bg-danger'}`}>{p.statusText}</span>
                  </h6>
                  <hr />
                  <h6>Actions rapides</h6>
                  {p.telephone && <a className="btn btn-success w-100 mb-2" href={`tel:${p.telephone.replace(/\s/g, '')}`}>
                    <i className="bi bi-telephone-fill me-1"></i>{' '}
                    Appeler
                  </a>}
                  {p.latitude != null && p.longitude != null && <a target="_blank" rel="noreferrer" className="btn btn-outline-success w-100 mb-2" href={`https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`}>
                    <i className="bi bi-geo-alt-fill me-1"></i>{' '}
                    Itinéraire
                  </a>}
                </div>
                <div className="card p-3 mt-3 shadow-sm border-0">
                  <h6>Localisation</h6>
                  <hr />
                  <div className="map-box mt-4">
                    {p.latitude != null && p.longitude != null ? <iframe
                      title="Localisation"
                      width="100%"
                      height="250"
                      loading="lazy"
                      style={{ border: 0, borderRadius: '12px' }}
                      src={mapUrl(p)}
                    ></iframe> : <p>Localisation non renseignée.</p>}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          !loading && (
            <section className="container py-5 text-center">
              <p>Cet établissement est introuvable.</p>
              <Link to="/" className="btn btn-success mt-2">Retour à l’accueil</Link>
            </section>
          )
        )}
      </main>
    </div>
  );
}
