import { useEffect, useRef, useState } from 'react';
import { getInstallPrompt, getWaitingWorker, installPwa, isInstalled, registerPwa, updatePwa } from '../pwa.js';
import './PwaInstall.css';

export default function PwaInstall() {
  const [installed, setInstalled] = useState(isInstalled);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [update, setUpdate] = useState(Boolean(getWaitingWorker()));
  const [help, setHelp] = useState(false), [busy, setBusy] = useState(false);
  const dialog = useRef(null);
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  useEffect(() => {
    const install = () => setInstalled(true), network = () => setOffline(!navigator.onLine), upgrade = () => setUpdate(true);
    window.addEventListener('santeproche:installed', install); window.addEventListener('santeproche:update', upgrade);
    window.addEventListener('online', network); window.addEventListener('offline', network);
    registerPwa().then(() => { if (getWaitingWorker()) upgrade(); });
    return () => { window.removeEventListener('santeproche:installed', install); window.removeEventListener('santeproche:update', upgrade); window.removeEventListener('online', network); window.removeEventListener('offline', network); };
  }, []);
  useEffect(() => { if (help) dialog.current?.showModal(); else dialog.current?.close(); }, [help]);
  async function install() {
    if (!getInstallPrompt()) { setHelp(true); return; }
    setBusy(true); try { await installPwa(); } catch { setHelp(true); } finally { setBusy(false); }
  }
  return <>
    {offline && <p className="pwa-notice" role="status">Vous êtes hors connexion. Les disponibilités actualisées, l’administration et l’IA nécessitent Internet.</p>}
    {update && <div className="pwa-notice" role="status">Une nouvelle version est disponible. <button type="button" onClick={updatePwa}>Mettre à jour</button><small>La page sera rechargée : terminez votre saisie avant de continuer.</small></div>}
    {!installed && <section className="pwa-install container" aria-label="Installer l’application SantéProche">
      <img src={`${import.meta.env.BASE_URL}pwa/icon-192.png`} alt="" width="48" height="48" />
      <div><h2>SantéProche sur votre téléphone</h2><p>Retrouvez le site depuis votre écran d’accueil.</p></div>
      <button type="button" disabled={busy} onClick={install}><i className="bi bi-download" aria-hidden="true" />{busy ? 'Installation…' : 'Installer SantéProche'}</button>
    </section>}
    <dialog ref={dialog} className="pwa-dialog" aria-labelledby="pwa-help-title" onCancel={() => setHelp(false)} onClick={event => { if (event.target === dialog.current) setHelp(false); }}>
      <button type="button" className="pwa-close" aria-label="Fermer les instructions" onClick={() => setHelp(false)} autoFocus>×</button>
      <h2 id="pwa-help-title">Installer SantéProche</h2>
      {ios ? <><p>Sur iPhone ou iPad, ouvrez le site dans Safari :</p><ol><li>Touchez le bouton <strong>Partager</strong>.</li><li>Choisissez <strong>Sur l’écran d’accueil</strong>.</li><li>Confirmez avec <strong>Ajouter</strong>.</li></ol></> : <><p>Ouvrez le menu de votre navigateur, puis choisissez <strong>Installer l’application</strong> ou <strong>Ajouter à l’écran d’accueil</strong>.</p><p>Si cette option n’apparaît pas, essayez Chrome ou Edge et rechargez le site une fois connecté à Internet.</p></>}
      <p className="pwa-help-note">L’installation dépend du navigateur. Les recherches actualisées et l’assistant IA nécessitent une connexion au serveur.</p>
    </dialog>
  </>;
}
