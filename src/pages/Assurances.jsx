import { SITE, whatsappLink } from '../site.js';

const BENEFITS = [
  { icon: 'bi bi-shield-lock fs-2 text-success', title: 'Échanges sécurisés', text: 'Les informations de vos assurés circulent de façon chiffrée et restent confidentielles.' },
  { icon: 'bi bi-lightning-charge fs-2 text-warning', title: 'Prise en charge plus rapide', text: 'La pharmacie vérifie la couverture en direct, sans appel ni formulaire papier.' },
  { icon: 'bi bi-diagram-3 fs-2 text-primary', title: 'Un réseau déjà en place', text: 'Vos assurés retrouvent sur la carte les établissements qui acceptent votre contrat.' },
];

const FLOW = [
  { icon: 'bi bi-person fs-2 text-success', title: 'L’assuré se présente', text: 'Il montre sa carte ou donne son numéro d’adhérent.' },
  { icon: 'bi bi-hospital fs-2 text-success', title: 'L’établissement vérifie', text: 'Les droits sont contrôlés en quelques secondes.' },
  { icon: 'bi bi-check-circle fs-2 text-success', title: 'Le soin est délivré', text: 'Le patient ne règle que la part qui lui revient.' },
  { icon: 'bi bi-cash-stack fs-2 text-success', title: 'Le remboursement suit', text: 'L’établissement est réglé selon les conditions convenues.' },
];

const TOOLS = [
  { icon: 'bi bi-clock-history fs-2 text-info', title: 'Historique des prises en charge', text: 'Retrouvez chaque dossier traité, avec sa date et son montant.' },
  { icon: 'bi bi-bar-chart fs-2 text-success', title: 'Tableaux de bord', text: 'Suivez les dépenses par type de soin et par établissement.' },
  { icon: 'bi bi-eye fs-2 text-primary', title: 'Contrôle facilité', text: 'Repérez rapidement les demandes inhabituelles à examiner.' },
];

export default function Assurances() {
  return (
    <div className="page-assurances">
      <main>
        <section className="bg-success text-white d-flex align-items-center py-5">
          <div className="container text-center">
            <span className="badge bg-light text-success px-3 py-2 mb-3">Assureurs et mutuelles</span>
            <h1 className="fw-bold text-white display-5">Vos assurés soignés sans paperasse</h1>
            <p className="text-white-50 fs-5 mt-3 mx-auto" style={{ maxWidth: 720 }}>
              Connectez votre organisme au réseau {SITE.name} et simplifiez la prise en charge en pharmacie et en clinique.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container text-center">
            <h2 className="section-title text-success">Le constat</h2>
            <p className="section-subtitle mx-auto">
              Aujourd’hui, vérifier qu’un patient est couvert prend du temps aux soignants et retarde parfois la délivrance
              des soins. Nous voulons que cette étape devienne invisible.
            </p>
          </div>
        </section>

        <section id="solution" className="section">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="section-title text-success">Ce que nous proposons</h2>
              <p className="section-subtitle">Une passerelle simple entre votre organisme et les établissements de santé.</p>
            </div>
            <div className="row g-4">
              {BENEFITS.map(b => (
                <div className="col-md-4" key={b.title}>
                  <div className="feature-card h-100">
                    <i className={b.icon}></i>
                    <h5 className="mt-3">{b.title}</h5>
                    <p>{b.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container text-center">
            <h2 className="section-title text-success">Le parcours, étape par étape</h2>
            <p className="section-subtitle">Du comptoir au remboursement.</p>
            <div className="row mt-5 g-4">
              {FLOW.map(f => (
                <div className="col-md-3" key={f.title}>
                  <div className="feature-card">
                    <i className={f.icon}></i>
                    <h6>{f.title}</h6>
                    <p>{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-light">
          <div className="container text-center">
            <h2 className="section-title text-success">Vos outils de suivi</h2>
            <div className="row mt-5 g-4">
              {TOOLS.map(t => (
                <div className="col-md-4" key={t.title}>
                  <div className="feature-card h-100">
                    <i className={t.icon}></i>
                    <h5>{t.title}</h5>
                    <p>{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section text-white text-center bg-success">
          <div className="container">
            <h2 className="fw-bold text-white">Discutons de votre projet</h2>
            <p className="text-white-50">Une démonstration de 20 minutes suffit pour voir si nous pouvons travailler ensemble.</p>
            <a
              className="btn btn-light text-success fw-bold mt-2"
              href={whatsappLink(`Bonjour, je représente un organisme d’assurance et je souhaite en savoir plus sur ${SITE.name}.`)}
              target="_blank"
              rel="noreferrer"
            >
              Demander une démonstration
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
