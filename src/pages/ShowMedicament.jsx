import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMedicine } from '../data/api.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const formatPrice = (value, currency) => `${Number(value).toLocaleString('fr-FR')} ${currency}`;

// Fiche d'un médicament : présentation et pharmacies qui le proposent
export default function ShowMedicament() {
  const { slug } = useParams();
  const [medicament, setMedicament] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useDocumentTitle(medicament?.designation);

  useEffect(() => {
    setNotFound(false);
    getMedicine(slug)
      .then(setMedicament)
      .catch(() => setNotFound(true));
  }, [slug]);

  const prices = medicament?.pharmacies.map(p => p.prix_public) || [];
  const currencies = new Set(medicament?.pharmacies.map(p => p.currency));

  return (
    <div className="page-showmedicament">
      <main>
        <section
          className="bg-success align-items-center d-flex py-5"
          style={{ background: 'url(/assets/images/pattern/04.png) no-repeat center center', backgroundSize: 'cover' }}
        >
          <div className="container">
            <div className="row">
              <div className="col-12 text-center">
                <h1 className="text-white">{medicament?.designation || (notFound ? 'Médicament introuvable' : '')}</h1>
                <div className="d-flex justify-content-center">
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb breadcrumb-dark breadcrumb-dots mb-0">
                      <li className="breadcrumb-item">
                        <Link to="/">Accueil</Link>
                      </li>
                      <li className="breadcrumb-item">
                        <Link to="/medicaments">Médicaments</Link>
                      </li>
                      <li aria-current="page" className="breadcrumb-item active">{medicament?.designation}</li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </section>

        {medicament && (
          <section className="py-5">
            <div className="container">
              <div className="row g-4">
                <div className="col-lg-4">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h3 className="text-success fs-5">{medicament.designation}</h3>
                      {medicament.image && <img src={medicament.image} alt={medicament.designation} className="w-100 mb-3" style={{ maxHeight: 240, objectFit: 'contain' }} />}
                      <p className="mb-2">
                        <strong>Présentation :</strong> {medicament.forme}
                      </p>
                      <p className="mb-2">
                        <strong>Disponible dans :</strong> {medicament.pharmacies.length} pharmacie(s)
                      </p>
                      <p className="mb-0">
                        <strong>Prix constatés :</strong> {currencies.size === 1 ? `de ${formatPrice(Math.min(...prices), [...currencies][0])} à ${formatPrice(Math.max(...prices), [...currencies][0])}` : 'Voir les prix et devises par pharmacie ci-dessous.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-8">
                  <h5 className="mb-3">Où le trouver</h5>
                  <div className="row g-3">
                    {medicament.pharmacies.map(ph => (
                      <div className="col-md-6" key={ph.slug}>
                        <div className="card shadow-sm h-100">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-title mb-0">
                                <Link to={`/pharmacies/${ph.slug}`}>{ph.nom}</Link>
                              </h6>
                              <span className={`badge ${ph.statusText === 'Ouvert' ? 'bg-success' : 'bg-danger'}`}>
                                {ph.statusText}
                              </span>
                            </div>
                            <p className="small mb-1">
                              {ph.adresse} — {ph.ville}
                            </p>
                            <p className="small mb-1">Stock : {ph.quantite} unité(s)</p>
                            <p className="fw-bold text-success mb-2">{formatPrice(ph.prix_public, ph.currency)}</p>
                            {ph.telephone && <a className="btn btn-sm btn-outline-success" href={`tel:${ph.telephone.replace(/\s/g, '')}`}>
                              <i className="bi bi-telephone-fill me-1"></i> Appeler
                            </a>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {notFound && (
          <section className="container py-5 text-center">
            <p>Ce médicament n’est référencé dans aucune pharmacie pour le moment.</p>
            <Link to="/medicaments" className="btn btn-success mt-2">Voir tous les médicaments</Link>
          </section>
        )}
      </main>
    </div>
  );
}
