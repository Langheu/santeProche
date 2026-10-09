import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { SITE_TITLE } from './hooks/useDocumentTitle.js';

import Home from './pages/Home.jsx';
import Medicaments from './pages/Medicaments.jsx';
import ShowMedicament from './pages/ShowMedicament.jsx';
import Pharmacies from './pages/Pharmacies.jsx';
import Cliniques from './pages/Cliniques.jsx';
import PharmacieGarde from './pages/PharmacieGarde.jsx';
import ShowPharmacie from './pages/ShowPharmacie.jsx';
import Ordonnance from './pages/Ordonnance.jsx';
import Contact from './pages/Contact.jsx';
import APropos from './pages/APropos.jsx';
import Assurances from './pages/Assurances.jsx';
import Faq from './pages/Faq.jsx';
import GestionPharmacie from './pages/GestionPharmacie.jsx';
import GestionClinique from './pages/GestionClinique.jsx';
import Grossiste from './pages/Grossiste.jsx';
import ConditionUtilisation from './pages/ConditionUtilisation.jsx';
import Politique from './pages/Politique.jsx';
import Placeholder from './pages/Placeholder.jsx';
import Admin from './pages/Admin.jsx';
import Assistant from './pages/Assistant.jsx';

// Titres des onglets (les fiches détail définissent le leur)
const TITLES = {
  '/assistant': 'Assistant de recherche',
  '/admin': 'Administration',
  '/': 'Accueil',
  '/medicaments': 'Liste des médicaments',
  '/condition-utilisations': "Conditions d'utilisations",
  '/politique-confidentialite': 'Politique de confidentialite',
  '/a-propos': 'A propos',
  '/actualites': 'Actualité santé',
  '/recherche-pharmacie': 'Rechercher une pharmacie',
  '/etablissement-sante': 'Etablissements santé',
  '/conseil-sante': 'Conseil santé',
  '/assurances': 'Assurances',
  '/contact': 'Contactez-nous',
  '/pharmacies': 'Pharmacies',
  '/cliniques': 'Mes cliniques',
  '/pharmacie-garde': 'Pharmacies de garde',
  '/faq': 'Faq',
  '/devenir-partenaire-pharmacie': 'Devenir partenaire pharmacie',
  '/gestion-cliniques': 'Gestion Clinique',
  '/devenir-partenaire-grossiste': 'Devenir partenaire grossiste',
  '/scanner-ordonnance': 'Scanner une ordonnance',
};

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    const title = TITLES[pathname];
    if (title) document.title = `${title} | ${SITE_TITLE}`;
  }, [pathname]);

  return (
    <Routes>
      <Route path="/admin" element={import.meta.env.VITE_GITHUB_PAGES === 'true' ? <main style={{ maxWidth: 650, margin: '80px auto', padding: 24 }}><h1>Administration</h1><p>Cette version GitHub est une démonstration. L’administration nécessite un backend hébergé.</p><a href="#/">Retour à l’accueil</a></main> : <Admin />} />
      <Route element={<Layout />}>
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/" element={<Home />} />
        <Route path="/medicaments" element={<Medicaments />} />
        <Route path="/medicament/:slug" element={<ShowMedicament />} />
        <Route path="/recherche-pharmacie" element={<Pharmacies />} />
        <Route path="/pharmacies" element={<Pharmacies />} />
        <Route path="/pharmacies/:slug" element={<ShowPharmacie />} />
        <Route path="/etablissement-sante" element={<Cliniques />} />
        <Route path="/cliniques" element={<Cliniques />} />
        <Route path="/cliniques/:slug" element={<ShowPharmacie />} />
        <Route path="/pharmacie-garde" element={<PharmacieGarde />} />
        <Route path="/scanner-ordonnance" element={<Ordonnance />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/a-propos" element={<APropos />} />
        <Route path="/assurances" element={<Assurances />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/devenir-partenaire-pharmacie" element={<GestionPharmacie />} />
        <Route path="/gestion-cliniques" element={<GestionClinique />} />
        <Route path="/devenir-partenaire-grossiste" element={<Grossiste />} />
        <Route path="/condition-utilisations" element={<ConditionUtilisation />} />
        <Route path="/politique-confidentialite" element={<Politique />} />
      </Route>
      <Route path="/actualites" element={<Placeholder name="actualites" />} />
      <Route path="/conseil-sante" element={<Placeholder name="conseil-sante" />} />
    </Routes>
  );
}
