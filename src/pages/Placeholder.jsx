import BackToTop from '../components/BackToTop.jsx';

// Pages « Actualités » et « Conseil santé » : à l'identique du site d'origine, elles ne contiennent encore rien
// (pas de menu ni de pied de page non plus).
export default function Placeholder({ name }) {
  return (
    <>
      <p>{name} works!</p>
      <BackToTop />
    </>
  );
}
