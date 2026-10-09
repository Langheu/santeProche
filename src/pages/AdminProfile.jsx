import PasswordField from '../components/PasswordField.jsx';
import { useEffect, useState } from 'react';
import { request, write, fileData, assetUrl } from '../data/api.js';

const EMPTY_PASSWORD = { current_password: '', new_password: '', confirm_password: '' };
export default function AdminProfile({ onBusyChange }) {
  const [profile, setProfile] = useState(null);
  const [original, setOriginal] = useState(null);
  const [emailPassword, setEmailPassword] = useState('');
  const [password, setPassword] = useState(EMPTY_PASSWORD);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [failedImage, setFailedImage] = useState(false);
  useEffect(() => {
    let cancelled = false;
    request('/admin/profile').then(value => { if (!cancelled) { setProfile(value); setOriginal(value); } }).catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => setFailedImage(false), [profile?.image]);
  const change = (field, value) => setProfile(previous => ({ ...previous, [field]: value }));
  const setWorking = value => { setBusy(value); onBusyChange(value); };
  async function saveProfile(event) {
    event.preventDefault(); setWorking(true); setMessage(''); setError('');
    try {
      const saved = await write('/admin/profile', { ...profile, current_password: emailPassword }, 'PUT');
      setProfile(saved); setOriginal(saved); setEmailPassword(''); setMessage('Votre profil a été enregistré.');
    } catch (e) { setError(e.message); } finally { setWorking(false); }
  }
  async function savePassword(event) {
    event.preventDefault(); setError(''); setMessage('');
    if (password.new_password !== password.confirm_password) { setError('Les deux nouveaux mots de passe ne correspondent pas.'); return; }
    setWorking(true);
    try {
      await write('/admin/profile/password', password, 'PUT'); setPassword(EMPTY_PASSWORD); setEmailPassword('');
      setMessage('Mot de passe modifié. Les autres sessions ont été déconnectées.');
    } catch (e) { setError(e.message); } finally { setWorking(false); }
  }
  async function upload(event) {
    const file = event.target.files[0]; event.target.value = ''; if (!file) return;
    setError(''); setMessage('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { setError('Choisissez une image JPG, PNG ou WEBP de moins de 10 Mo.'); return; }
    setWorking(true);
    try { const result = await write('/admin/upload', await fileData(file)); change('image', result.url); setMessage('Photo ajoutée. Enregistrez votre profil pour la conserver.'); }
    catch (e) { setError(e.message); } finally { setWorking(false); }
  }
  return <section className="admin-profile" aria-label="Mon profil administrateur">
    {error && <p className="admin-error" role="alert">{error}</p>}
    {message && <p className="admin-success" role="status">{message}</p>}
    {!profile ? <p>{error ? 'Impossible de charger le profil. Rechargez la page pour réessayer.' : 'Chargement de votre profil…'}</p> : <div className="admin-profile-layout">
      <form className="admin-panel" onSubmit={saveProfile}>
        <h2>Mon profil</h2><p className="admin-hint">Vos informations personnelles et votre email de connexion.</p>
        <fieldset disabled={busy}>
          <div className="admin-profile-photo-row"><div className="admin-profile-avatar">{profile.image && !failedImage ? <img src={assetUrl(profile.image)} alt="Photo de profil administrateur" onError={() => setFailedImage(true)} /> : <i className="bi bi-person" aria-hidden="true" />}</div><div className="admin-image-controls"><label className="admin-upload-button"><i className="bi bi-image" aria-hidden="true" />Changer ma photo<input className="admin-sr-only" aria-label="Photo de profil" type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} /></label><small>JPG, PNG ou WEBP · 10 Mo maximum</small>{profile.image && <button className="admin-delete" type="button" onClick={() => change('image', '')}>Retirer la photo</button>}</div></div>
          <label className="admin-field">Nom complet<input name="nom" autoComplete="name" maxLength={200} value={profile.nom} onChange={e => change('nom', e.target.value)} /></label>
          <label className="admin-field">Email de connexion<input name="email" type="email" autoComplete="username" maxLength={200} required value={profile.email} onChange={e => change('email', e.target.value)} /></label>
          <label className="admin-field">Téléphone personnel<input name="telephone" type="tel" autoComplete="tel" maxLength={40} value={profile.telephone} onChange={e => change('telephone', e.target.value)} /></label>
          {profile.email !== original.email && <PasswordField className="admin-field" label="Mot de passe actuel pour changer l’email" autoComplete="current-password" maxLength={256} required value={emailPassword} onChange={e => setEmailPassword(e.target.value)} />}
          <div className="admin-form-actions"><button className="admin-primary" type="submit"><i className="bi bi-floppy" aria-hidden="true" />Enregistrer mon profil</button><button type="button" onClick={() => { setProfile({ ...original }); setEmailPassword(''); setError(''); setMessage(''); }}>Annuler</button></div>
        </fieldset>
      </form>
      <form className="admin-panel" onSubmit={savePassword}>
        <h2>Modifier mon mot de passe</h2><p className="admin-hint">Choisissez un mot de passe de 12 caractères minimum. Vous resterez connecté sur cet appareil.</p>
        <fieldset disabled={busy}>
          <PasswordField className="admin-field" label="Mot de passe actuel" autoComplete="current-password" maxLength={256} required value={password.current_password} onChange={e => setPassword(value => ({ ...value, current_password: e.target.value }))} />
          <PasswordField className="admin-field" label="Nouveau mot de passe" autoComplete="new-password" minLength={12} maxLength={256} required value={password.new_password} onChange={e => setPassword(value => ({ ...value, new_password: e.target.value }))} />
          <PasswordField className="admin-field" label="Confirmer le nouveau mot de passe" autoComplete="new-password" minLength={12} maxLength={256} required value={password.confirm_password} onChange={e => setPassword(value => ({ ...value, confirm_password: e.target.value }))} />
          <div className="admin-form-actions"><button className="admin-primary" type="submit"><i className="bi bi-lock" aria-hidden="true" />Changer mon mot de passe</button></div>
        </fieldset>
      </form>
    </div>}
  </section>;
}
