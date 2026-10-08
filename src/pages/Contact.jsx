import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../site.js';
import { sendContactMessage } from '../data/api.js';

const EMPTY_FORM = { nom: '', email: '', sujet: '', message: '' };

const CHANNELS = [
  {
    col: 'col-sm-6 col-lg-12 col-xl-6 mb-5',
    iconBg: 'bg-success',
    icon: 'bi bi-envelope',
    title: 'Par email',
    value: SITE.email,
    href: `mailto:${SITE.email}`,
  },
  {
    col: 'col-sm-6 col-lg-12 col-xl-6 mb-5 mb-xl-0',
    iconBg: 'bg-purple',
    icon: 'fas fa-tty',
    title: 'Par téléphone',
    value: SITE.phone,
    href: `tel:${SITE.phoneHref}`,
  },
  {
    col: 'col-12 mb-5 mb-xl-0',
    iconBg: 'bg-orange',
    icon: 'fas fa-globe',
    title: 'Où nous trouver',
    value: SITE.address,
  },
];

export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const update = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (Object.values(form).some(v => !v.trim())) {
      setError('Merci de remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      await sendContactMessage(form);
      setSuccess('Votre message a été enregistré et peut être consulté par l’équipe.');
      setForm(EMPTY_FORM);
    } catch {
      setError('Le message n’a pas pu partir. Réessayez dans un instant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-contact">
      <main>
        <section
          className="bg-success align-items-center d-flex"
          style={{ background: 'url(/assets/images/pattern/04.png) no-repeat center center', backgroundSize: 'cover' }}
        >
          <div className="container">
            <div className="row">
              <div className="col-12 text-center">
                <h1 className="text-white">Parlons-en</h1>
                <div className="d-flex justify-content-center">
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb breadcrumb-dark breadcrumb-dots mb-0">
                      <li className="breadcrumb-item">
                        <Link to="/">Accueil</Link>
                      </li>
                      <li aria-current="page" className="breadcrumb-item active">Contact</li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact-form" className="position-relative overflow-hidden pt-0 pt-md-5">
          <div className="container">
            <div className="row g-4 g-lg-5 align-items-center">
              <div className="col-lg-6">
                <h2 className="h1 mb-3">Une question, une idée, un souci ?</h2>
                <p>
                  Patient, pharmacien ou simple curieux : écrivez-nous. Une personne de l’équipe {SITE.name} lit chaque
                  message et vous répond personnellement.
                </p>
                <div className="row mt-5">
                  {CHANNELS.map(c => (
                    <div className={c.col} key={c.title}>
                      <div className="card card-body shadow">
                        <div className={`icon-lg ${c.iconBg} text-white rounded-circle position-absolute top-0 start-100 translate-middle ms-n6`}>
                          <i className={c.icon}></i>
                        </div>
                        <h6>{c.title}</h6>
                        {c.href ? (
                          <p className="h6 mb-0">
                            <a href={c.href} className="text-primary-hover mb-0 fw-light stretched-link">{c.value}</a>
                          </p>
                        ) : (
                          <p className="h6 mb-0 fw-light">{c.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card card-body shadow p-4 p-sm-5 position-relative">
                  <form noValidate onSubmit={submit} className="row g-3 position-relative">
                    <div className="col-md-6 col-lg-12 col-xl-6">
                      <label className="form-label" htmlFor="c-nom">Votre nom *</label>
                      <input id="c-nom" type="text" required className="form-control" value={form.nom} onChange={update('nom')} />
                    </div>
                    <div className="col-md-6 col-lg-12 col-xl-6">
                      <label className="form-label" htmlFor="c-email">Votre email *</label>
                      <input id="c-email" type="email" required className="form-control" value={form.email} onChange={update('email')} />
                    </div>
                    <div className="col-12">
                      <label className="form-label" htmlFor="c-sujet">Sujet *</label>
                      <input id="c-sujet" type="text" required className="form-control" value={form.sujet} onChange={update('sujet')} />
                    </div>
                    <div className="col-12">
                      <label className="form-label" htmlFor="c-message">Message *</label>
                      <textarea id="c-message" required rows="4" className="form-control" value={form.message} onChange={update('message')}></textarea>
                    </div>
                    <div className="col-12">
                      {success && <div className="alert alert-success mb-3">{success}</div>}
                      {error && <div className="alert alert-danger mb-3">{error}</div>}
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Envoi…' : 'Envoyer'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
