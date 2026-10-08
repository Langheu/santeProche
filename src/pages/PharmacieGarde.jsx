import EstablishmentList from '../components/EstablishmentList.jsx';
import './PharmacieGarde.css';

export default function PharmacieGarde() {
  return (
    <EstablishmentList
      scope="page-pharmaciegarde"
      kind="pharmacies-garde"
      basePath="/pharmacies"
      title="Pharmacies de garde"
      subtitle="Ouvertes tard le soir, la nuit et le dimanche, au plus près de vous"
      placeholder="Nom de la pharmacie ou quartier…"
      emptyText="Aucune pharmacie de garde ne correspond à votre recherche."
    />
  );
}
