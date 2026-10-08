import EstablishmentList from '../components/EstablishmentList.jsx';
import './Cliniques.css';
import './CliniquesControls.css';

export default function Cliniques() {
  return (
    <EstablishmentList
      scope="page-cliniques"
      kind="cliniques"
      basePath="/cliniques"
      title="Cliniques et centres de soins proches"
      subtitle="Urgences, consultations, analyses : trouvez la bonne porte où frapper"
      placeholder="Nom de l’établissement ou quartier…"
      emptyText="Aucun établissement ne correspond à votre recherche."
    />
  );
}
