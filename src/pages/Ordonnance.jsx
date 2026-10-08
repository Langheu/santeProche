import { Fragment, useEffect, useState } from 'react';
import { SITE } from '../site.js';
import { sendPrescription } from '../data/api.js';
import './Ordonnance.css';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024;

const isValidPhone = phone =>
  /^(?:\+|00)?[\d\s().-]+$/.test(phone.trim()) &&
  phone.replace(/\D/g, '').length >= 7 &&
  phone.replace(/\D/g, '').length <= 15;

const STEPS = [
  { title: 'Photographiez l’ordonnance', text: 'Une photo nette, à plat et bien éclairée suffit.' },
  { title: 'Nous interrogeons les pharmacies', text: 'Notre équipe vérifie qui a vos médicaments en stock près de chez vous.' },
  { title: 'Vous recevez un appel', text: 'On vous indique où aller et le prix de chaque médicament.' },
];

export default function Ordonnance() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [acceptContact, setAcceptContact] = useState(false);
  const [acceptSubstitution, setAcceptSubstitution] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const cleanTelephone = telephone.trim().replace(/[\s().-]/g, '');

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const handleFile = selected => {
    setError('');
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError('Formats acceptés : JPG, PNG ou WEBP.');
      return;
    }
    if (selected.size > MAX_SIZE) {
      setError('L’image dépasse 10 Mo. Essayez une photo moins lourde.');
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setTelephone('');
    setAdresse('');
    setAcceptContact(false);
    setAcceptSubstitution(false);
    setSent(false);
  };

  const submit = async () => {
    setError('');
    if (!file) return setError('Ajoutez d’abord la photo de votre ordonnance.');
    if (!isValidPhone(telephone)) return setError('Saisissez un numéro valide de 7 à 15 chiffres, avec votre indicatif si nécessaire.');
    if (!acceptContact) return setError('Cochez la case pour que nous puissions vous rappeler.');

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('telephone', cleanTelephone);
      form.append('adresse', adresse.trim());
      form.append('ordonnance', file, file.name);
      form.append('accept_substitution', acceptSubstitution ? '1' : '0');
      await sendPrescription(form);
      setSent(true);
    } catch (err) {
      console.error(err);
      setError('L’envoi a échoué. Vérifiez votre connexion et réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-ordonnance">
      <main className="ordonnance-page">
        <section className="ordonnance-hero">
          <div className="ordonnance-container">
            <div className="ordonnance-intro">
              <h1>
                Une ordonnance à servir ?
                <span> On cherche pour vous.</span>
              </h1>
              <p>
                Envoyez-nous la photo de votre ordonnance : nous repérons les pharmacies proches qui ont vos médicaments
                et nous vous rappelons avec les adresses et les prix.
              </p>
              <div className="hero-trust">
                <span>
                  <i className="fas fa-check-circle"></i> Réponse rapide
                </span>
                <span>
                  <i className="fas fa-lock"></i> Données confidentielles
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="ordonnance-form-section">
          <div className="ordonnance-container">
            <div className="ordonnance-form-card">
              {sent ? (
                <div className="payment-notification payment-notification--success">
                  <div className="payment-notification__icon">
                    <i className="fas fa-circle-check"></i>
                  </div>
                  <p>
                    Merci ! Votre ordonnance est bien arrivée. Un membre de l’équipe {SITE.name} vous appelle au{' '}
                    {telephone} très bientôt.{' '}
                    <button type="button" className="btn btn-link p-0 align-baseline" onClick={reset}>
                      Envoyer une autre ordonnance
                    </button>
                  </p>
                </div>
              ) : (
                <>
                  <div className="form-card-header">
                    <div className="form-header-icon">
                      <i className="fas fa-file-prescription"></i>
                    </div>
                    <div className="form-header-content">
                      <div className="form-header-top">
                        <div>
                          <span className="form-eyebrow">FORMULAIRE</span>
                          <h2>Votre demande</h2>
                        </div>
                        <div className="form-status">
                          <i className="fas fa-circle"></i>
                          <span>Moins d’une minute</span>
                        </div>
                      </div>
                      <p>Trois informations suffisent pour que nous puissions vous aider.</p>
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="telephone">Votre numéro</label>
                    <span className="field-description">C’est sur ce numéro que nous vous rappellerons.</span>
                    <div className="phone-field">
                      <input
                        id="telephone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        maxLength="25"
                        placeholder="Votre numéro avec indicatif"
                        value={telephone}
                        onChange={e => setTelephone(e.target.value)}
                      />
                      <div className="phone-valid-icon">
                        <i className="fas fa-phone"></i>
                      </div>
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="adresse">Votre quartier</label>
                    <span className="field-description">Pour chercher en priorité les pharmacies les plus proches.</span>
                    <div className="phone-field">
                      <input
                        id="adresse"
                        type="text"
                        autoComplete="street-address"
                        placeholder="Ex. : Kipé, Matam…"
                        value={adresse}
                        onChange={e => setAdresse(e.target.value)}
                      />
                      <div className="phone-valid-icon">
                        <i className="fas fa-location-dot"></i>
                      </div>
                    </div>
                  </div>

                  <div className="form-field">
                    <div className="field-heading">
                      <div>
                        <label>Photo de l’ordonnance</label>
                        <span className="field-description">Vérifiez que tous les noms de médicaments sont lisibles.</span>
                      </div>
                      <span className="field-required">Requis</span>
                    </div>
                    <div className="prescription-upload">
                      <input
                        id="ordonnance-file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        hidden
                        onChange={e => {
                          handleFile(e.target.files[0]);
                          e.target.value = '';
                        }}
                      />
                      {!file ? (
                        <label htmlFor="ordonnance-file" className="upload-empty">
                          <div className="upload-visual">
                            <div className="upload-symbol">
                              <i className="fas fa-camera"></i>
                            </div>
                            <div className="upload-plus">
                              <i className="fas fa-plus"></i>
                            </div>
                          </div>
                          <div className="upload-title">Prendre ou choisir une photo</div>
                          <div className="upload-subtitle">Depuis votre téléphone ou votre ordinateur</div>
                          <span className="upload-action">
                            <i className="fas fa-upload"></i> Parcourir
                          </span>
                          <div className="upload-formats">
                            <span>JPG</span>
                            <span>PNG</span>
                            <span>WEBP</span>
                            <i className="fas fa-circle"></i>
                            <span>10 Mo max.</span>
                          </div>
                        </label>
                      ) : (
                        <div className="upload-preview">
                          <div className="preview-header">
                            <div className="preview-file">
                              <div className="preview-file-icon">
                                <i className="fas fa-file-image"></i>
                              </div>
                              <div className="preview-file-info">
                                <strong>{file.name}</strong>
                                <span>{(file.size / 1024 / 1024).toFixed(2)} Mo</span>
                              </div>
                            </div>
                            <button type="button" className="remove-file" onClick={() => { setFile(null); setPreviewUrl(null); }} aria-label="Retirer la photo">
                              <i className="fas fa-xmark"></i>
                            </button>
                          </div>
                          <img className="prescription-image" src={previewUrl} alt="Aperçu de l’ordonnance" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-field">
                    <div className="field-heading">
                      <div>
                        <label>Équivalents</label>
                        <span className="field-description">Utile si un médicament est en rupture.</span>
                      </div>
                    </div>
                    <div
                      className={`substitution-option${acceptSubstitution ? ' active' : ''}`}
                      role="switch"
                      aria-checked={acceptSubstitution}
                      tabIndex={0}
                      onClick={() => setAcceptSubstitution(v => !v)}
                      onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && setAcceptSubstitution(v => !v)}
                    >
                      <div className="substitution-icon">
                        <i className="fas fa-repeat"></i>
                      </div>
                      <div className="substitution-content">
                        <div className="substitution-title">J’accepte un générique ou un équivalent</div>
                        <div className="substitution-description">
                          Le pharmacien pourra vous proposer un produit de même composition.
                        </div>
                      </div>
                      <div className="substitution-switch">
                        <span></span>
                      </div>
                    </div>
                  </div>

                  <div className="treatment-price">
                    <div className="price-information">
                      <div className="price-icon">
                        <i className="fas fa-receipt"></i>
                      </div>
                      <div className="price-text">
                        <span className="price-label">COÛT DU SERVICE</span>
                        <strong>Recherche de disponibilité</strong>
                        <small>Vous ne payez que vos médicaments, directement à la pharmacie.</small>
                      </div>
                    </div>
                    <div className="price-value">
                      <strong>0</strong>
                      <span>GNF</span>
                    </div>
                  </div>

                  <label className="contact-consent">
                    <input type="checkbox" checked={acceptContact} onChange={e => setAcceptContact(e.target.checked)} />
                    <span className="custom-checkbox">
                      <i className="fas fa-check"></i>
                    </span>
                    <span>J’accepte que {SITE.name} me rappelle au sujet de cette demande.</span>
                  </label>

                  {error && (
                    <div className="alert-message alert-message--error">
                      <div className="alert-message__icon">
                        <i className="fas fa-circle-exclamation"></i>
                      </div>
                      <div className="alert-message__content">{error}</div>
                      <button type="button" className="alert-message__close" onClick={() => setError('')} aria-label="Fermer">
                        <i className="fas fa-xmark"></i>
                      </button>
                    </div>
                  )}

                  <button type="button" className="submit-button" disabled={submitting || !file || !acceptContact} onClick={submit}>
                    <span>{submitting ? 'Envoi…' : 'Envoyer ma demande'}</span>
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </>
              )}
            </div>

            <div className="ordonnance-help">
              <div className="help-header">
                <span className="help-eyebrow">LA SUITE</span>
                <h3>Ce qui se passe après l’envoi</h3>
              </div>
              <div className="help-process">
                {STEPS.map((step, i) => (
                  <Fragment key={step.title}>
                    <div className="help-item">
                      <div className="help-number">{i + 1}</div>
                      <div>
                        <strong>{step.title}</strong>
                        <span>{step.text}</span>
                      </div>
                    </div>
                    {i < STEPS.length - 1 && <div className="help-line"></div>}
                  </Fragment>
                ))}
              </div>
              <div className="ordonnance-notice">
                <i className="fas fa-circle-info"></i>
                <p>
                  En cas d’urgence vitale, ne passez pas par ce formulaire : rendez-vous directement aux urgences les plus proches.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
