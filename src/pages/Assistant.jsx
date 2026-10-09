import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { request, write, fileData, assetUrl } from '../data/api.js';
import PharmacyActions from '../components/PharmacyActions.jsx';
import './Assistant.css';

const Icon = ({ name }) => <i className={`bi ${name}`} aria-hidden="true" />;
const GREETING = 'Bonjour ! Que recherchez-vous aujourd’hui : un médicament, une pharmacie ou une clinique ?';
const SUGGESTIONS = [['bi-shop', 'Pharmacie ouverte', 'Je cherche une pharmacie ouverte près de moi'], ['bi-capsule', 'Trouver un médicament', 'Je cherche du paracétamol 500 mg près de moi'], ['bi-hospital', 'Chercher une clinique', 'Je cherche une clinique près de moi']];

function ResultCard({ item, kind }) {
  const medicine = kind === 'medicaments';
  const name = medicine ? item.pharmacie : item.nom;
  const src = medicine ? item.pharmacie_image || item.image : item.image;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const href = `${kind === 'cliniques' ? '/cliniques' : '/pharmacies'}/${medicine ? item.pharmacie_slug : item.slug}`;
  return <article className="assistant-result">
    <div className="assistant-result-image">{src && !failed ? <img src={assetUrl(src)} alt={name} loading="lazy" onError={() => setFailed(true)} /> : <Icon name={kind === 'cliniques' ? 'bi-hospital' : 'bi-shop'} />}</div>
    <div className="assistant-result-copy"><h3><Link to={href}>{name}</Link></h3>{medicine && <p className="assistant-product-name">{item.designation}</p>}<p><Icon name="bi-geo-alt" />{[item.adresse, item.ville].filter(Boolean).join(', ') || 'Adresse non renseignée'}</p>
      <div className="assistant-result-facts"><span><Icon name="bi-person-walking" />{item.distance ? `À ${item.distance}` : 'Distance non disponible'}</span><span className={medicine || item.statusText === 'Ouvert' ? 'assistant-stock' : ''}>{medicine ? 'En stock' : item.statusText}</span>{medicine && <strong>{item.currency ? `${Number(item.prix_public).toLocaleString('fr-FR')} ${item.currency}` : 'Prix à renseigner'}</strong>}</div>
      {item.is_demo && <small className="assistant-demo">Démonstration · Données fictives</small>}
      <PharmacyActions item={{ ...item, slug: medicine ? item.pharmacie_slug : item.slug }} basePath={kind === 'cliniques' ? '/cliniques' : '/pharmacies'} />
    </div>
  </article>;
}

export default function Assistant() {
  const [configured, setConfigured] = useState(null);
  const [messages, setMessages] = useState([{ role: 'assistant', text: GREETING }]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(null);
  const [product, setProduct] = useState({ name: '', dosage: '', presentation: '' });
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [consent, setConsent] = useState(false);
  const [position, setPosition] = useState({});
  const [locating, setLocating] = useState(false);
  const [city, setCity] = useState('');
  const [cityOpen, setCityOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [readAloud, setReadAloud] = useState(false);
  const [voiceNote, setVoiceNote] = useState('');
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsArea = useRef(null);
  const toolsButton = useRef(null);
  const photoInput = useRef(null);
  const recognition = useRef(null);
  const conversation = useRef(null);
  const cityInput = useRef(null);
  const mounted = useRef(true);
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => {
    mounted.current = true;
    request('/assistant/status').then(value => { if (mounted.current) setConfigured(value.configured); }).catch(e => { if (mounted.current) setError(e.message); });
    return () => { mounted.current = false; recognition.current?.abort(); window.speechSynthesis?.cancel(); };
  }, []);
  useEffect(() => { if (conversation.current) conversation.current.scrollTop = conversation.current.scrollHeight; }, [messages, busy]);
  useEffect(() => { if (cityOpen) cityInput.current?.focus(); }, [cityOpen]);
  useEffect(() => {
    if (!toolsOpen) return;
    const dismiss = event => { if (!toolsArea.current?.contains(event.target)) setToolsOpen(false); };
    const escape = event => { if (event.key === 'Escape') { setToolsOpen(false); toolsButton.current?.focus(); } };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [toolsOpen]);
  useEffect(() => {
    const url = photo ? URL.createObjectURL(photo) : '';
    setPhotoUrl(url);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [photo]);

  const speak = message => {
    if (!readAloud || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message); utterance.lang = 'fr-FR';
    window.speechSynthesis.speak(utterance);
  };
  const append = (role, message) => setMessages(items => [...items.slice(-19), { role, text: message }]);
  async function search(message, options = {}) {
    if (busy || listening) return;
    setBusy(true); setError('');
    if (message) append('user', message);
    try {
      const payload = { message, previous: result?.intent || null, history: messages.slice(-6), ...position, ...(city.trim() ? { city: city.trim() } : {}), ...options };
      const response = await write('/assistant/search', payload);
      if (!mounted.current) return;
      append('assistant', response.message); speak(response.message);
      if (response.confirmation) { setPending(response.intent); setProduct(response.intent.product); setResult(null); }
      else { setResult(response); setPending(null); if (options.intent) { setPhoto(null); setConsent(false); } }
    } catch (e) { if (mounted.current) setError(e.message); }
    finally { if (mounted.current) setBusy(false); }
  }
  function send(event) { event.preventDefault(); if (!text.trim()) return; const message = text.trim(); setText(''); search(message); }
  async function locate() {
    if (!navigator.geolocation) { setError('La localisation n’est pas disponible. Choisissez votre ville.'); setCityOpen(true); return; }
    setLocating(true); setError('');
    navigator.geolocation.getCurrentPosition(pos => {
      if (!mounted.current) return;
      const location = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setPosition(location); setCity(''); setLocating(false);
      if (result?.intent) search('', { intent: result.intent, ...location, city: '' });
    }, () => { if (mounted.current) { setLocating(false); setError('Position indisponible ou refusée. Vous pouvez choisir une ville.'); setCityOpen(true); } }, { timeout: 10000, maximumAge: 60000 });
  }
  function pickPhoto(event) {
    const file = event.target.files[0]; event.target.value = ''; if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { setError('Choisissez une photo JPG, PNG ou WEBP de moins de 10 Mo.'); return; }
    setError(''); setPending(null); setPhoto(file); setConsent(false); setResult(null);
  }
  async function analyze() {
    if (!photo || !consent || configured !== true) return;
    try { await search('Identifier le produit sur cette photo', { image: await fileData(photo), consent_image: true }); } catch (e) { setError(e.message); }
  }
  function confirm(event) {
    event.preventDefault();
    search(`Rechercher ${product.name} ${product.dosage}`, { intent: { ...pending, kind: 'medicaments', query: [product.name, product.dosage].filter(Boolean).join(' '), product } });
  }
  function toggleVoice() {
    if (listening) { recognition.current?.stop(); return; }
    if (!SpeechRecognition || busy) return;
    window.speechSynthesis?.cancel(); setVoiceNote('');
    const engine = new SpeechRecognition(); engine.lang = 'fr-FR'; engine.interimResults = true; engine.continuous = false;
    recognition.current = engine;
    engine.onstart = () => { if (mounted.current) setListening(true); };
    engine.onresult = event => { if (mounted.current) setText(Array.from(event.results).map(item => item[0].transcript).join(' ')); };
    engine.onerror = event => { if (mounted.current) setVoiceNote(event.error === 'not-allowed' ? 'Autorisez le micro dans votre navigateur pour dicter.' : 'La dictée est indisponible. Vous pouvez saisir votre demande.'); };
    engine.onend = () => { if (mounted.current) setListening(false); };
    try { engine.start(); } catch { setListening(false); setVoiceNote('Le micro ne peut pas être démarré. Réessayez ou utilisez le clavier.'); }
  }

  return <div className="page-assistant"><main>
    <section className="assistant-hero"><div className="container"><span><Icon name="bi-stars" />Assistant SantéProche</span><h1>Votre assistant SantéProche</h1><p>Trouvez un médicament, une pharmacie ou une clinique.</p>
      <div className="assistant-location"><button type="button" disabled={busy || locating || listening} onClick={locate}><Icon name="bi-geo-alt" />{locating ? 'Localisation…' : position.lat != null ? 'Actualiser ma position' : 'Utiliser ma position'}</button><button type="button" disabled={busy} onClick={() => setCityOpen(value => !value)}><Icon name="bi-building" />Choisir une ville</button></div>
    </div></section>
    <div className="container assistant-workspace">
      {configured === false && <p className="assistant-config-note" role="status"><Icon name="bi-info-circle" />Mode recherche classique. L’IA et l’analyse des photos ne sont pas encore activées.</p>}
      <div className="assistant-layout">
        <section className="assistant-panel assistant-chat" aria-label="Conversation avec l’assistant">
          <header className="assistant-chat-header"><Icon name="bi-chat-dots" /><div><h2>Comment puis-je vous aider ?</h2><p>{configured ? 'Recherche assistée par IA dans les fiches du site' : 'Recherche dans les fiches du site'}</p></div></header>
          <div className="assistant-suggestions">{SUGGESTIONS.map(([icon, label, message]) => <button key={label} type="button" disabled={busy || listening} onClick={() => { setPhoto(null); setPending(null); search(message); }}><Icon name={icon} />{label}</button>)}</div>
          <div ref={conversation} className="assistant-conversation" role="log" aria-live="polite" aria-relevant="additions text">{messages.map((message, i) => <div key={i} className={`assistant-message assistant-message--${message.role}`}><span><Icon name={message.role === 'user' ? 'bi-person' : 'bi-stars'} /></span><p>{message.text}</p></div>)}{busy && <p className="assistant-working" role="status">{configured ? 'Analyse de votre demande…' : 'Recherche dans les fiches…'}</p>}</div>
          {cityOpen && <form className="assistant-city" onSubmit={event => { event.preventDefault(); setPosition({}); if (result?.intent) search('', { intent: result.intent, city: city.trim(), lat: null, lng: null }); }}><label>Ville ou quartier<input ref={cityInput} value={city} onChange={event => setCity(event.target.value)} placeholder="Saisir une ville ou un quartier" maxLength={150} disabled={busy} /></label><button type="submit" disabled={busy || listening}>Appliquer</button></form>}
          {error && <p className="assistant-error" role="alert">{error}</p>}
          <form className="assistant-composer" onSubmit={send}>
            <div className="assistant-tools" ref={toolsArea} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setToolsOpen(false); }}>
              <button ref={toolsButton} className="assistant-plus" type="button" aria-label="Ajouter une photo ou dicter" aria-expanded={toolsOpen} aria-controls="assistant-tools-menu" disabled={busy} onClick={() => setToolsOpen(value => !value)}><Icon name={toolsOpen ? 'bi-x-lg' : 'bi-plus-lg'} /></button>
              {toolsOpen && <div className="assistant-tools-menu" id="assistant-tools-menu" role="group" aria-label="Options de recherche">
                <button type="button" disabled={listening} onClick={() => { setToolsOpen(false); photoInput.current?.click(); }}><Icon name="bi-camera" />Ajouter une photo</button>
                <button type="button" disabled={!SpeechRecognition} onClick={() => { setToolsOpen(false); toggleVoice(); toolsButton.current?.focus(); }}><Icon name={listening ? 'bi-stop-circle' : 'bi-mic'} />{listening ? 'Arrêter la dictée' : 'Dicter ma recherche'}</button>
              </div>}
            </div>
            <input ref={photoInput} tabIndex={-1} className="assistant-sr-only" aria-label="Photo du produit" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={pickPhoto} disabled={busy || listening} />
            <label className="assistant-sr-only" htmlFor="assistant-text">Votre demande</label>
            <textarea id="assistant-text" value={text} onChange={event => setText(event.target.value)} placeholder="Écrivez votre demande…" rows={2} maxLength={1500} disabled={busy} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (!busy && !listening && text.trim()) { const message = text.trim(); setText(''); search(message); } } }} />
            <button className="assistant-send" type="submit" aria-label="Envoyer ma recherche" disabled={busy || listening || !text.trim()}><Icon name="bi-arrow-up" /></button>
          </form>
          <div className="assistant-voice-options"><label><input type="checkbox" checked={readAloud} disabled={!window.speechSynthesis} onChange={event => { setReadAloud(event.target.checked); if (!event.target.checked) window.speechSynthesis?.cancel(); }} />Lire les réponses à voix haute</label>{readAloud && <button type="button" onClick={() => window.speechSynthesis?.cancel()}>Arrêter la lecture</button>}</div>
          <p className="assistant-voice-note" aria-live="polite">{listening ? 'Écoute en cours… Vérifiez la transcription, puis envoyez votre demande.' : voiceNote || (!SpeechRecognition ? 'La dictée n’est pas disponible dans ce navigateur.' : 'Le micro permet de dicter. Vérifiez les noms et dosages avant l’envoi.')}</p>
          <small className="assistant-disclaimer">Cet assistant aide à rechercher des fiches. Il ne fournit pas de diagnostic ni de conseil de traitement.</small>
        </section>
        <section className="assistant-panel assistant-results" aria-label="Résultats de votre recherche"><h2>{photo ? pending ? 'Vérifiez le produit reconnu' : 'Rechercher avec une photo' : 'Résultats de votre recherche'}</h2>
          {photo ? <div className="assistant-photo-flow"><img className="assistant-photo-preview" src={photoUrl} alt="Photo du produit à analyser" />{pending ? <form onSubmit={confirm}><span className="assistant-recognition-label">Reconnaissance proposée · À confirmer</span>{[['name', 'Nom du produit'], ['dosage', 'Dosage'], ['presentation', 'Présentation']].map(([field, label]) => <label key={field}>{label}<input value={product[field]} onChange={event => setProduct(value => ({ ...value, [field]: event.target.value }))} required={field === 'name'} disabled={busy} /></label>)}<p>Vérifiez le nom et le dosage. Vous pouvez corriger les champs avant de confirmer.</p><button className="assistant-button assistant-button--primary" type="submit" disabled={busy}><Icon name="bi-check-circle" />Confirmer et rechercher</button></form> : <><p>Photographiez une boîte avec le nom, le dosage et la présentation bien visibles.</p><label className="assistant-consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} disabled={busy || configured !== true} />J’autorise l’envoi de cette photo au service IA pour l’analyse.</label><button className="assistant-button assistant-button--primary" type="button" disabled={busy || !consent || configured !== true} onClick={analyze}><Icon name="bi-stars" />Analyser la photo</button>{configured !== true && <p className="assistant-voice-note">L’analyse photo nécessite l’activation du service IA. La recherche par nom reste disponible.</p>}</>}<button className="assistant-text-button" type="button" disabled={busy} onClick={() => { setPhoto(null); setPending(null); setConsent(false); }}>Revenir à la recherche</button></div> : result ? <>
            <div className="assistant-result-tags">{result.intent.query && <span><Icon name={result.intent.kind === 'medicaments' ? 'bi-capsule' : 'bi-search'} />{result.intent.query}</span>}<span><Icon name="bi-geo-alt" />{result.intent.city || (position.lat != null ? 'Autour de ma position' : 'Toutes les villes')}</span></div>
            <p className="assistant-result-count" role="status">{result.total} résultat(s){result.total > result.results.length ? ` · ${result.results.length} affichés` : ''}</p>
            <div className="assistant-result-list">{result.results.map(item => <ResultCard key={`${result.intent.kind}-${item.id}`} item={item} kind={result.intent.kind} />)}</div>
            {!result.results.length && <div className="assistant-empty"><Icon name="bi-search" /><p>{result.message}</p></div>}
            <p className="assistant-result-source">Les prix, stocks et coordonnées proviennent des fiches enregistrées. Les distances sont calculées à vol d’oiseau quand la position est disponible.</p>
          </> : <div className="assistant-empty"><Icon name="bi-chat-dots" /><h3>Votre recherche commence ici</h3><p>Écrivez votre demande, dictez-la avec le bouton + ou choisissez une suggestion. Les fiches correspondantes s’afficheront ici.</p><Link to="/medicaments">Consulter les médicaments <Icon name="bi-arrow-right" /></Link></div>}
        </section>
      </div>
    </div>
  </main></div>;
}
