import { Link } from 'react-router-dom';
import './PharmacyActions.css';

export default function PharmacyActions({ item, basePath }) {
  const phone = String(item.telephone || '').replace(/[\s().-]/g, '');
  const canCall = /^(?:\+|00)?\d{7,15}$/.test(phone);
  const canNavigate = item.latitude != null && item.longitude != null && item.latitude !== '' && item.longitude !== ''
    && Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude))
    && Math.abs(Number(item.latitude)) <= 90 && Math.abs(Number(item.longitude)) <= 180;

  return (
    <div className="pharmacy-card-actions">
      <Link className="pharmacy-action pharmacy-action--profile" to={`${basePath}/${item.slug}`}>
        <i className="bi bi-person-badge" aria-hidden="true" />Voir le profil
      </Link>
      <div className="pharmacy-card-actions-secondary">
        {canCall ? <a className="pharmacy-action pharmacy-action--secondary" href={`tel:${phone}`}>
          <i className="bi bi-telephone" aria-hidden="true" />Appeler
        </a> : <button className="pharmacy-action pharmacy-action--secondary" type="button" disabled title="Le téléphone de cette pharmacie n’est pas renseigné.">
          <i className="bi bi-telephone" aria-hidden="true" />Appeler
        </button>}
        {canNavigate ? <a className="pharmacy-action pharmacy-action--secondary" href={`https://www.google.com/maps/dir/?api=1&destination=${Number(item.latitude)},${Number(item.longitude)}`} target="_blank" rel="noopener noreferrer">
          <i className="bi bi-cursor" aria-hidden="true" />Aller
        </a> : <button className="pharmacy-action pharmacy-action--secondary" type="button" disabled title="La position de cette pharmacie n’est pas renseignée.">
          <i className="bi bi-cursor" aria-hidden="true" />Aller
        </button>}
      </div>
    </div>
  );
}
