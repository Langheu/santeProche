import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { request, write, fileData, assetUrl } from '../data/api.js';
import { SITE } from '../site.js';
import './Admin.css';
import AdminProfile from './AdminProfile.jsx';
import AdminPartners from './AdminPartners.jsx';

const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const TABS = { pharmacies: 'Pharmacies', cliniques: 'Cliniques', medicaments: 'Médicaments', partners: 'Inscriptions pharmacies', requests: 'Demandes reçues' };
const ICONS = { pharmacies: 'bi-shop', cliniques: 'bi-hospital', medicaments: 'bi-capsule', partners: 'bi-person-plus', requests: 'bi-envelope' };
const Icon = ({ name }) => <i className={`bi ${name}`} aria-hidden="true" />;

function RecordImage({ src, kind, preview = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return <span className={`admin-photo${preview ? ' admin-photo--preview' : ''}${kind === 'medicaments' ? ' admin-photo--product' : ''}`}>
    {src && !failed ? <img src={assetUrl(src)} alt={preview ? 'Aperçu de l’image' : ''} loading={preview ? 'eager' : 'lazy'} onError={() => setFailed(true)} /> : <span className="admin-photo-placeholder"><Icon name={ICONS[kind]} />{preview && <small>{failed ? 'Image indisponible' : 'Ajouter une photo'}</small>}</span>}
  </span>;
}
const emptyRecord = kind => kind === 'medicaments'
  ? { designation: '', forme: '', pharmacie_id: '', prix_public: '', quantite: '', currency: '', image: '', is_demo: false }
  : { nom: '', telephone: '', adresse: '', ville: '', pays: '', email: '', latitude: '', longitude: '', description: '', image: '', garde: false, is_demo: false };

function Field({ label, name, record, onChange, type = 'text', required = false, ...props }) {
  return <label className="admin-field">{label}<input name={name} type={type} value={record[name] ?? ''} required={required} onChange={event => onChange(name, event.target.value)} {...props} /></label>;
}

export default function Admin() {
  const [auth, setAuth] = useState(null);
  const [kind, setKind] = useState('pharmacies');
  const [records, setRecords] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyRecord('pharmacies'));
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const editorHeading = useRef(null);

  useEffect(() => { request('/auth/status').then(setAuth).catch(e => setError(e.message)); }, []);
  useEffect(() => {
    if (!auth?.authenticated) return;
    if (kind === 'profile' || kind === 'partners') { setLoading(false); setError(''); setMessage(''); return; }
    let cancelled = false;
    setLoading(true); setError(''); setMessage(''); setSelected(null); setFilter(''); setForm(emptyRecord(kind));
    Promise.all([request(`/admin/${kind}`), kind === 'medicaments' ? request('/admin/pharmacies') : Promise.resolve([])])
      .then(([items, places]) => {
        if (!cancelled) {
          setRecords(items); setPharmacies(places);
          if (kind !== 'requests' && items.length) { setSelected(items[0].id); setForm({ ...items[0] }); }
        }
      })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [auth?.authenticated, kind]);

  const change = (name, value) => setForm(record => ({ ...record, [name]: value }));
  const select = item => { setSelected(item.id); setForm({ ...item }); setError(''); setMessage(''); };
  const edit = item => {
    select(item);
    requestAnimationFrame(() => {
      editorHeading.current?.focus({ preventScroll: true });
      if (window.matchMedia('(max-width: 800px)').matches) {
        editorHeading.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      }
    });
  };
  const create = () => { setSelected(null); setForm(emptyRecord(kind)); setError(''); setMessage(''); };
  const cancel = () => {
    const saved = records.find(item => item.id === selected);
    setForm(saved ? { ...saved } : emptyRecord(kind)); setMessage(''); setError('');
  };
  const visibleRecords = records.filter(item => `${item.nom || item.designation} ${item.telephone || ''} ${item.ville || ''}`.toLowerCase().includes(filter.toLowerCase()));
  async function authenticate(event) {
    event.preventDefault(); setBusy(true); setError('');
    const credentials = Object.fromEntries(new FormData(event.currentTarget));
    try { await write(auth?.setupRequired ? '/auth/setup' : '/auth/login', credentials); setAuth({ authenticated: true, setupRequired: false }); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const saved = await write(`/admin/${kind}${selected ? `/${selected}` : ''}`, form, selected ? 'PUT' : 'POST');
      setSelected(saved.id); setForm(saved);
      setRecords(await request(`/admin/${kind}`)); setMessage('Fiche enregistrée dans la base de données.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function remove() {
    if (!selected || !window.confirm('Supprimer cette fiche de la base de données ?')) return;
    setBusy(true); setError('');
    try { await request(`/admin/${kind}/${selected}`, { method: 'DELETE' }); setRecords(await request(`/admin/${kind}`)); create(); setMessage('Fiche supprimée.'); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function upload(event) {
    const file = event.target.files[0]; event.target.value = ''; if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { setError('Choisissez une image JPG, PNG ou WEBP de moins de 10 Mo.'); return; }
    setUploading(true); setError('');
    try { const result = await write('/admin/upload', await fileData(file)); change('image', result.url); setMessage('Image ajoutée. Enregistrez la fiche pour l’associer.'); }
    catch (e) { setError(e.message); } finally { setUploading(false); }
  }
  async function logout() { try { await write('/auth/logout', {}); setAuth({ authenticated: false, setupRequired: false }); setRecords([]); } catch (e) { setError(e.message); } }

  return (
    <div className="page-admin">
      <header className="admin-header"><Link to="/" className="admin-brand"><Icon name="bi-heart-pulse" />{SITE.name}</Link><span className="admin-header-label">Administration</span><div className="admin-header-actions"><Link to="/"><Icon name="bi-box-arrow-up-right" />Voir le site</Link>{auth?.authenticated && <><button type="button" aria-pressed={kind === 'profile'} disabled={busy || uploading} onClick={() => setKind('profile')}><Icon name="bi-person-circle" />Mon profil</button><button type="button" disabled={busy || uploading} onClick={logout}><Icon name="bi-box-arrow-right" />Se déconnecter</button></>}</div></header>
      <main className="admin-container">
        {error && <p className="admin-error" role="alert">{error}</p>}
        {!auth ? <p>Connexion au serveur…</p> : !auth.authenticated ? (
          <form className="admin-login admin-panel" onSubmit={authenticate}>
            <h1>{auth.setupRequired ? 'Créer votre accès administrateur' : 'Connexion administrateur'}</h1>
            <p>{auth.setupRequired ? 'Choisissez vos identifiants. Aucun mot de passe n’est prédéfini.' : 'Connectez-vous pour modifier les fiches du site.'}</p>
            <label className="admin-field">Email<input type="email" name="email" autoComplete="username" required /></label>
            <label className="admin-field">Mot de passe<input type="password" name="password" autoComplete={auth.setupRequired ? 'new-password' : 'current-password'} minLength={auth.setupRequired ? 12 : undefined} required /></label>
            {auth.setupRequired && <small>12 caractères minimum. La création initiale se fait sur cet ordinateur.</small>}
            <button className="admin-primary" disabled={busy}>{busy ? 'Connexion…' : auth.setupRequired ? 'Créer mon accès' : 'Se connecter'}</button>
          </form>
        ) : (
          <>
            <div className="admin-title"><div><h1>Gérer les informations du site</h1><p>Modifiez les fiches et leurs images.</p></div><span className="admin-contact"><Icon name="bi-telephone" />Contact : {SITE.phone}</span></div>
            <nav className="admin-tabs" aria-label="Catégories">{Object.entries(TABS).map(([key, label]) => <button type="button" key={key} aria-pressed={kind === key} disabled={busy || uploading} onClick={() => setKind(key)}><Icon name={ICONS[key]} />{label}</button>)}</nav>
            {message && <p className="admin-success" role="status">{message}</p>}
            {kind === 'partners' ? <AdminPartners onBusyChange={setBusy} /> : kind === 'profile' ? <AdminProfile onBusyChange={setBusy} /> : loading ? <p>Chargement des données…</p> : kind === 'requests' ? (
              <div className="admin-requests">{!records.length && <p>Aucune demande reçue.</p>}{records.map(item => <article className="admin-panel" key={item.id}><h2>{item.kind === 'contact' ? item.data.sujet : 'Demande d’ordonnance'}</h2><p>{new Date(item.created).toLocaleString('fr-FR')}</p>{item.kind === 'contact' ? <><p>{item.data.nom} · {item.data.email}</p><p className="admin-message">{item.data.message}</p></> : <><p>{item.data.telephone} · {item.data.adresse || 'Quartier non renseigné'}</p><a href={assetUrl(`/api/admin/prescriptions/${item.id}/image`)} target="_blank" rel="noreferrer">Voir l’ordonnance</a></>}</article>)}</div>
            ) : (
              <div className="admin-layout">
                <aside className="admin-panel admin-list-panel">
                  <div className="admin-list-heading"><h2>{TABS[kind]} <small>({records.length})</small></h2><button type="button" className="admin-primary" onClick={create} disabled={busy || uploading}><Icon name="bi-plus-lg" />Ajouter</button></div>
                  <label className="admin-search"><span className="admin-sr-only">Rechercher une fiche</span><Icon name="bi-search" /><input placeholder="Rechercher une fiche…" value={filter} onChange={event => setFilter(event.target.value)} /></label>
                  <div className="admin-records">{visibleRecords.map(item => <div className="admin-record" key={item.id} data-selected={selected === item.id}>
                    <button className="admin-record-main" type="button" aria-pressed={selected === item.id} onClick={() => select(item)} disabled={busy || uploading}>
                    <RecordImage src={item.image} kind={kind} />
                    <span className="admin-record-copy"><strong>{item.nom || item.designation}</strong><span>{kind === 'medicaments' ? `${item.currency ? Number(item.prix_public).toLocaleString('fr-FR') + ' ' + item.currency : 'Prix à renseigner'} · ${pharmacies.find(p => p.id === item.pharmacie_id)?.nom || ''}` : [item.adresse, item.ville].filter(Boolean).join(', ') || 'Adresse non renseignée'}</span>{item.is_demo && <small>Démonstration</small>}</span>
                    </button>
                    <button className="admin-edit-button" type="button" aria-label={`Modifier ${item.nom || item.designation}`} onClick={() => edit(item)} disabled={busy || uploading}><Icon name="bi-pencil" />Modifier</button>
                  </div>)}{!visibleRecords.length && <p className="admin-empty">{records.length ? 'Aucune fiche ne correspond à votre recherche.' : 'Aucune fiche. Utilisez Ajouter pour créer la première.'}</p>}</div>
                  {records.some(item => item.is_demo) && <p className="admin-demo-note"><Icon name="bi-info-circle" />Les fiches marquées « Démonstration » contiennent des données fictives.</p>}
                </aside>
                <form className="admin-panel admin-editor" onSubmit={save}>
                  <div className="admin-editor-heading"><h2 ref={editorHeading} tabIndex={-1}>{selected ? 'Modifier la fiche' : 'Nouvelle fiche'}</h2>{form.is_demo && <span className="admin-demo-badge">Démonstration</span>}</div>
                  <fieldset disabled={busy || uploading}>
                    <div className="admin-image-area">
                      <RecordImage src={form.image} kind={kind} preview />
                      <div className="admin-image-controls"><label className="admin-upload-button"><Icon name="bi-image" />{uploading ? 'Ajout de l’image…' : form.image ? 'Changer l’image' : 'Ajouter une image'}<input className="admin-sr-only" aria-label="Image du profil / du produit" type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} /></label><small>JPG, PNG ou WEBP · 10 Mo maximum</small></div>
                    </div>
                    {kind === 'medicaments' ? <><Field label="Nom du médicament" name="designation" record={form} onChange={change} required /><Field label="Présentation / dosage" name="forme" record={form} onChange={change} /><label className="admin-field">Pharmacie<select value={form.pharmacie_id || ''} required onChange={event => change('pharmacie_id', event.target.value)}><option value="">Choisir une pharmacie</option>{pharmacies.map(place => <option key={place.id} value={place.id}>{place.nom}</option>)}</select></label><div className="admin-fields"><Field label="Prix" name="prix_public" type="number" min="0" step="0.01" record={form} onChange={change} required /><Field label="Devise" name="currency" maxLength="3" record={form} onChange={change} required /><Field label="Quantité disponible" name="quantite" type="number" min="0" step="1" record={form} onChange={change} required /></div><p className="admin-hint">L’adresse et le téléphone sont ceux de la pharmacie sélectionnée. Modifiez sa fiche pour les actualiser partout.</p></> : <><Field label="Nom de l’établissement" name="nom" record={form} onChange={change} required /><div className="admin-fields"><Field label="Téléphone" name="telephone" type="tel" record={form} onChange={change} /><Field label="Email" name="email" type="email" record={form} onChange={change} /></div><Field label="Adresse" name="adresse" record={form} onChange={change} /><div className="admin-fields"><Field label="Ville / quartier" name="ville" record={form} onChange={change} /><Field label="Pays" name="pays" record={form} onChange={change} /></div><details className="admin-coordinates"><summary><Icon name="bi-geo-alt" />Coordonnées GPS</summary><div className="admin-fields"><Field label="Latitude" name="latitude" type="number" min="-90" max="90" step="any" record={form} onChange={change} /><Field label="Longitude" name="longitude" type="number" min="-180" max="180" step="any" record={form} onChange={change} /></div></details><label className="admin-field">Description / spécialités<textarea rows="3" value={form.description || ''} onChange={event => change('description', event.target.value)} /></label>{kind === 'pharmacies' && <label className="admin-check"><input type="checkbox" checked={!!form.garde} onChange={event => change('garde', event.target.checked)} />Pharmacie de garde</label>}<details className="admin-schedule"><summary><Icon name="bi-clock" />Horaires d’ouverture</summary>{DAYS.map(day => <div className="admin-day" key={day}><label>{day}<select aria-label={`Statut ${day}`} value={form[`${day}_ouvert`] == null ? 'unknown' : form[`${day}_ouvert`] ? 'open' : 'closed'} onChange={event => change(`${day}_ouvert`, event.target.value === 'unknown' ? null : event.target.value === 'open')}><option value="unknown">Non renseigné</option><option value="open">Ouvert</option><option value="closed">Fermé</option></select></label><input aria-label={`Ouverture ${day}`} type="time" value={form[`${day}_heure_ouverture`]?.slice(0, 5) || ''} onChange={event => change(`${day}_heure_ouverture`, event.target.value)} /><input aria-label={`Fermeture ${day}`} type="time" value={form[`${day}_heure_fermeture`]?.slice(0, 5) || ''} onChange={event => change(`${day}_heure_fermeture`, event.target.value)} /></div>)}</details></>}
                    <details className="admin-image-link"><summary>Utiliser une adresse d’image</summary><Field label="Adresse de l’image" name="image" record={form} onChange={change} /></details>
                    <label className="admin-check"><input type="checkbox" checked={!!form.is_demo} onChange={event => change('is_demo', event.target.checked)} />Fiche de démonstration</label>
                    <div className="admin-form-actions"><button className="admin-primary" type="submit"><Icon name="bi-floppy" />{busy ? 'Enregistrement…' : 'Enregistrer la fiche'}</button><button type="button" className="admin-cancel" onClick={cancel}>Annuler</button>{selected && <button className="admin-delete" type="button" onClick={remove}><Icon name="bi-trash" />Supprimer</button>}</div>
                  </fieldset>
                  {uploading && <p role="status">Ajout de l’image…</p>}
                </form>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
