import { Link } from 'react-router-dom';
import usePaginatedList from '../hooks/usePaginatedList.js';
import { listEstablishments } from '../data/api.js';
import SearchHero from './SearchHero.jsx';
import Pagination from './Pagination.jsx';
import PharmacyActions from './PharmacyActions.jsx';

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-badge"></div>
      <div className="skeleton skeleton-line"></div>
      <div className="skeleton skeleton-subtitle"></div>
      <div className="skeleton skeleton-button"></div>
    </div>
  );
}

function Card({ item, index, basePath, isClinic }) {
  return (
    <article className={`pharma-card ${item.statusBadge}`} style={{ animationDelay: `${index * 60}ms` }}>
      <div className="card-body">
        {item.image && <img src={item.image} alt={item.nom} loading="lazy" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }} />}
        <h2 className="card-name">{item.nom}</h2>
        <div className="card-header-row">
          <span className={`card-badge ${item.statusBadge}`}>{item.statusText}</span>
        </div>
        <p className="card-address fw-bold">
          <i className="bi bi-telephone" aria-hidden="true"></i>{' '}
          {item.telephone || 'Téléphone non renseigné'}
        </p>
        <p className="card-address fw-bold">
          {isClinic ? <i className="bi bi-geo-alt" aria-hidden="true"></i> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21C12 21 5 13.5 5 8.5a7 7 0 0 1 14 0C19 13.5 12 21 12 21Z"></path>
            <circle cx="12" cy="8.5" r="2.5"></circle>
          </svg>}{' '}
          {item.adresse}
        </p>
        <div className="card-footer">
          <span className="card-distance">
            <i className="bi bi-person-walking me-1" aria-hidden="true"></i>{' '}
            {item.distance || 'Distance non disponible'}
          </span>
          <small className="card-subtext">
            {isClinic && <i className="bi bi-clock" aria-hidden="true"></i>}{' '}
            {item.statusSubText}
          </small>
        </div>
        {isClinic ? <Link
          className="btn btn-outline-success w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
          to={`${basePath}/${item.slug}`}
        >
          <i className={`bi ${isClinic ? 'bi-file-earmark-text' : 'bi-card-list'}`} aria-hidden="true"></i>{' '}
          Consulter la fiche
        </Link> : <PharmacyActions item={item} basePath={basePath} />}
      </div>
    </article>
  );
}

/** Liste d'établissements de santé proches de l'utilisateur (pharmacies, cliniques, gardes). */
export default function EstablishmentList({ scope, kind, basePath, title, subtitle, placeholder, emptyText }) {
  const { data, loading, error, search, setSearch, submitSearch, goToPage } = usePaginatedList(params => listEstablishments(kind, params));

  return (
    <div className={scope}>
      <main className="pharma-page">
        <SearchHero
          title={title}
          subtitle={subtitle}
          placeholder={placeholder}
          value={search}
          onChange={setSearch}
          onSubmit={submitSearch}
        />
        <section className="cards-section">
          <div className="container">
            {error && <p className="alert alert-danger" role="alert">{error}</p>}
            <div className="cards-grid">
              {loading && !data
                ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
                : data?.data.map((item, i) => <Card key={item.id} item={item} index={i} basePath={basePath} isClinic={kind === 'cliniques'} />)}
            </div>
            {data && !data.data.length && <p className="text-center py-5">{emptyText}</p>}
            <Pagination data={data} onChange={goToPage} />
          </div>
        </section>
      </main>
    </div>
  );
}
