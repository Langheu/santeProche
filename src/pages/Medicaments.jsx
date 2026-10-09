import { useState } from 'react';
import { Link } from 'react-router-dom';
import usePaginatedList from '../hooks/usePaginatedList.js';
import { listMedicines } from '../data/api.js';
import SearchHero from '../components/SearchHero.jsx';
import Pagination from '../components/Pagination.jsx';
import './Medicaments.css';
import './MedicamentsProfiles.css';

const formatPrice = (value, currency) => currency ? `${Number(value).toLocaleString('fr-FR')} ${currency}` : 'Prix à renseigner';

function SkeletonCard() {
  return (
    <div className="col-sm-6 mb-4">
      <div className="medicine-card">
        <div className="skeleton medicine-image-skeleton"></div>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-subtitle"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-button"></div>
      </div>
    </div>
  );
}

function ProductImage({ src, designation }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="medicine-image-wrap">
      {src && !failed ? (
        <img
          className="medicine-product-image"
          src={src}
          alt={designation}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="medicine-image-missing">
          <i className="bi bi-capsule" aria-hidden="true"></i>
          <span>Photo du produit à venir</span>
        </div>
      )}
    </div>
  );
}

function MedicineCard({ item }) {
  const initials = item.pharmacie
    .replace(/^pharmacie\s*/i, '')
    .split(/[\s’-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();

  return (
    <div className="col-sm-6 mb-4">
      <div className="medicine-card">
        <ProductImage key={item.image || 'missing'} src={item.image} designation={item.designation} />
        <div className="medicine-top">
          <div className="medicine-heading">
            <h5>
              <Link to={`/medicament/${item.slug}`}>{item.designation}</Link>
            </h5>
            <Link className="medicine-pharmacy-profile" to={`/pharmacies/${item.pharmacie_slug}`}>
              <span className="medicine-pharmacy-avatar" aria-hidden="true">{initials}+</span>
              <span>
                <span className="medicine-eyebrow">{item.pharmacie}</span>
                <span className="medicine-profile-label">Profil de la pharmacie</span>
              </span>
            </Link>
          </div>
        </div>
        <div className="medicine-body">
          <div className="medicine-address">
            <i className="bi bi-geo-alt" aria-hidden="true"></i>
            <span>{[item.adresse,item.quartier,item.ville].filter(Boolean).join(' — ')}</span>
          </div>
          <div className="medicine-distance">
            <i className="bi bi-person-walking" aria-hidden="true"></i> {item.distance ? `À ${item.distance} de vous` : 'Distance non disponible'}
          </div>
          <div className="medicine-phone">
            <i className="bi bi-telephone" aria-hidden="true"></i> {item.telephone || 'Téléphone non renseigné'}
          </div>
          <div className="medicine-actions">
            <div className="price-btn">
              {formatPrice(item.prix_public, item.currency)}
            </div>
            {item.latitude != null && item.longitude != null ? <a
              target="_blank"
              rel="noreferrer"
              className="itineraire-btn"
              href={`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`}
            >
              <i className="bi bi-cursor" aria-hidden="true"></i> Y aller
            </a> : <span className="small text-muted">Localisation non renseignée</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Medicaments() {
  const { data, loading, error, search, setSearch, submitSearch, goToPage } = usePaginatedList(listMedicines);

  return (
    <div className="page-medicaments">
      <main>
        <SearchHero
          title="Où trouver mon médicament ?"
          subtitle="Saisissez un nom : nous listons les pharmacies qui l’ont en stock, de la plus proche à la plus éloignée."
          placeholder="Ex. : paracétamol, amoxicilline, sirop…"
          value={search}
          onChange={setSearch}
          onSubmit={submitSearch}
        />
        <section className="py-5 medicine-results">
          <div className="container">
            <p><Link className="btn btn-outline-success" style={{ whiteSpace: 'normal' }} to="/assistant"><i className="bi bi-stars me-2" aria-hidden="true"></i>Rechercher avec l’assistant · Photo ou voix</Link></p>
            {error && <p className="alert alert-danger" role="alert">{error}</p>}
            {data?.data.some(item => item.is_demo) && <p className="medicine-demo-note">Certaines fiches sont des démonstrations : images illustratives et données fictives.</p>}
            <div className="row g-4">
              {loading && !data
                ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
                : data?.data.map(item => <MedicineCard key={item.id} item={item} />)}
            </div>
            {data && !data.data.length && (
              <p className="text-center py-5">Aucun médicament ne correspond à votre recherche.</p>
            )}
            <Pagination data={data} onChange={goToPage} />
          </div>
        </section>
      </main>
    </div>
  );
}
