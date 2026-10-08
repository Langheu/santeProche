import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../site.js';
import './Faq.css';

const CATEGORIES = [
  { icon: 'fas fa-prescription-bottle-medical', title: 'Pharmacies', text: 'Horaires, gardes et coordonnées des officines.' },
  { icon: 'fas fa-pills', title: 'Médicaments', text: 'Disponibilité, prix et ordonnances.' },
  { icon: 'fas fa-handshake', title: 'Professionnels', text: 'Référencer votre établissement.' },
];

const GROUPS = [
  {
    number: '01',
    label: 'Bien démarrer',
    title: `Utiliser ${SITE.name}`,
    items: [
      {
        q: `${SITE.name}, c’est quoi exactement ?`,
        a: 'Un annuaire de santé en ligne : vous y trouvez les pharmacies, cliniques et centres de soins proches de vous, ainsi que les médicaments qu’ils proposent.',
      },
      {
        q: 'Dois-je créer un compte ?',
        a: 'Non. Toutes les recherches sont accessibles sans inscription. Seul l’envoi d’une ordonnance demande un numéro de téléphone, pour pouvoir vous rappeler.',
      },
      {
        q: 'Pourquoi le site demande-t-il ma position ?',
        a: 'Pour trier les résultats du plus proche au plus éloigné. Si vous refusez, nous utilisons une position par défaut au centre-ville ; rien n’est enregistré.',
      },
    ],
  },
  {
    number: '02',
    label: 'Recherche',
    title: 'Médicaments et ordonnances',
    items: [
      {
        q: 'Les stocks affichés sont-ils fiables ?',
        a: 'Ils proviennent des pharmacies partenaires et sont mis à jour régulièrement, mais un produit peut partir entre-temps. En cas de doute, appelez la pharmacie avant de vous déplacer.',
      },
      {
        q: 'Les prix sont-ils les mêmes partout ?',
        a: 'Pas toujours. C’est justement pour cela que nous affichons le prix pratiqué par chaque pharmacie : vous pouvez comparer avant de choisir.',
      },
      {
        q: 'Que devient la photo de mon ordonnance ?',
        a: 'Elle sert uniquement à rechercher vos médicaments. Elle n’est ni revendue ni partagée en dehors des pharmacies consultées pour votre demande.',
      },
    ],
  },
  {
    number: '03',
    label: 'Partenaires',
    title: 'Pharmacies et cliniques',
    items: [
      {
        q: 'Comment référencer mon établissement ?',
        a: 'Remplissez le formulaire de contact ou écrivez-nous sur WhatsApp. Nous vérifions vos informations puis votre fiche apparaît dans les résultats.',
      },
      {
        q: 'Le référencement est-il payant ?',
        a: 'La fiche de base (adresse, horaires, téléphone) est gratuite. Des options comme la mise à jour automatique des stocks sont proposées séparément.',
      },
    ],
  },
];

function FaqGroup({ group, defaultOpen }) {
  // une seule question ouverte à la fois par rubrique
  const [active, setActive] = useState(defaultOpen ? 0 : -1);

  return (
    <div className="faq-group">
      <div className="faq-group__header">
        <div className="faq-group__number">{group.number}</div>
        <div>
          <span>{group.label}</span>
          <h3>{group.title}</h3>
        </div>
      </div>
      <div className="accordion faq-accordion">
        {group.items.map((item, i) => {
          const open = active === i;
          return (
            <div className="accordion-item" key={item.q}>
              <h2 className="accordion-header">
                <button
                  type="button"
                  className={`accordion-button${open ? '' : ' collapsed'}`}
                  aria-expanded={open}
                  onClick={() => setActive(open ? -1 : i)}
                >
                  <span className="faq-question-icon">
                    <i className="fas fa-question"></i>
                  </span>
                  <span className="faq-question-text">{item.q}</span>
                  <i className={`fas fa-chevron-down faq-chevron${open ? ' rotate' : ''}`}></i>
                </button>
              </h2>
              <div className={`faq-answer${open ? ' open' : ''}`}>
                <div className="accordion-body">{item.a}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Faq() {
  return (
    <div className="page-faq">
      <section className="faq-section">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-xl-8 text-center">
              <span className="section-label">Aide</span>
              <h2 className="section-title">Vos questions, nos réponses</h2>
              <p className="section-description">
                Les réponses aux questions qu’on nous pose le plus souvent. Si la vôtre n’y figure pas, écrivez-nous.
              </p>
            </div>
          </div>
          <div className="row g-4 mb-5">
            {CATEGORIES.map(cat => (
              <div className="col-md-4" key={cat.title}>
                <div className="faq-category">
                  <div className="faq-category__icon">
                    <i className={cat.icon}></i>
                  </div>
                  <div>
                    <h5>{cat.title}</h5>
                    <p>{cat.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="row justify-content-center">
            <div className="col-xl-9 col-lg-10">
              {GROUPS.map((group, i) => (
                <FaqGroup group={group} key={group.number} defaultOpen={i === 0} />
              ))}
              <div className="faq-contact">
                <div className="faq-contact__icon">
                  <i className="fas fa-headset"></i>
                </div>
                <div className="faq-contact__content">
                  <span>Toujours un doute ?</span>
                  <h3>Une vraie personne vous répond.</h3>
                  <p>Posez-nous directement votre question, nous revenons vers vous rapidement.</p>
                </div>
                <Link className="btn btn-success faq-contact__button" to="/contact">
                  Poser ma question
                  <i className="fas fa-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
