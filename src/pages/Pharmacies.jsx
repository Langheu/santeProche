import EstablishmentList from '../components/EstablishmentList.jsx';
import './Pharmacies.css';

export default function Pharmacies() {
  return (
    <EstablishmentList
      scope="page-pharmacies"
      kind="pharmacies"
      basePath="/pharmacies"
      title="Les pharmacies autour de vous"
      subtitle="Triées par distance · Ouvert ou fermé en temps réel · Appel en un clic"
      placeholder="Nom de la pharmacie ou quartier…"
      emptyText="Aucune pharmacie ne correspond à votre recherche."
    />
  );
}
