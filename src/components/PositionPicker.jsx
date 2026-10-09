import { useEffect, useId, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PositionPicker.css';

function coordinates(value) {
  const { latitude, longitude } = value;
  if (latitude == null || longitude == null || latitude === '' || longitude === '') return null;
  const lat = Number(latitude), lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? [lat, lng] : null;
}

function PositionMap({ value, onChange, disabled }) {
  const container = useRef(null), map = useRef(null), marker = useRef(null);
  const latest = useRef({ onChange, disabled });
  latest.current = { onChange, disabled };
  const [tileError, setTileError] = useState(false);
  useEffect(() => {
    const initial = coordinates(value);
    const instance = L.map(container.current, { scrollWheelZoom: false }).setView(initial || [8, 20], initial ? 16 : 3);
    map.current = instance;
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
    }).addTo(instance);
    tiles.on('tileerror', () => setTileError(true));
    tiles.on('tileload', () => setTileError(false));
    instance.on('click', event => {
      if (!latest.current.disabled) latest.current.onChange({ latitude: Number(event.latlng.lat.toFixed(6)), longitude: Number(event.latlng.wrap().lng.toFixed(6)) });
    });
    const resize = new ResizeObserver(() => instance.invalidateSize());
    resize.observe(container.current);
    return () => { resize.disconnect(); instance.remove(); map.current = null; marker.current = null; };
  }, []);
  useEffect(() => {
    const point = coordinates(value), instance = map.current;
    if (!instance) return;
    if (!point) { marker.current?.remove(); marker.current = null; return; }
    if (!marker.current) {
      marker.current = L.marker(point, {
        draggable: !disabled, title: 'Emplacement de l’établissement',
        icon: L.divIcon({ className: 'position-pin', html: '<span aria-hidden="true">📍</span>', iconSize: [36, 42], iconAnchor: [18, 38] }),
      }).addTo(instance);
      marker.current.on('dragend', () => {
        if (latest.current.disabled) return;
        const location = marker.current.getLatLng().wrap();
        latest.current.onChange({ latitude: Number(location.lat.toFixed(6)), longitude: Number(location.lng.toFixed(6)) });
      });
    } else marker.current.setLatLng(point);
    instance.setView(point, Math.max(instance.getZoom(), 16), { animate: false });
    if (disabled) marker.current.dragging.disable(); else marker.current.dragging.enable();
  }, [value.latitude, value.longitude, disabled]);
  function chooseCenter() {
    const location = map.current.getCenter().wrap();
    onChange({ latitude: Number(location.lat.toFixed(6)), longitude: Number(location.lng.toFixed(6)) });
  }
  return <div className="position-map-wrap">
    <p>Zoomez jusqu’à votre établissement, puis touchez la carte ou déplacez le repère.</p>
    <div ref={container} className="position-map" role="region" aria-label="Carte de l’emplacement de l’établissement" />
    {tileError && <p role="status">Le fond de carte est indisponible. Vérifiez votre connexion ou utilisez votre position.</p>}
    <button type="button" disabled={disabled} onClick={chooseCenter}>Placer le repère au centre</button>
  </div>;
}

export default function PositionPicker({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false), [locating, setLocating] = useState(false);
  const [error, setError] = useState(''), [message, setMessage] = useState('');
  const requestId = useRef(0), latest = useRef({ onChange, disabled });
  latest.current = { onChange, disabled };
  const mapId = useId(), point = coordinates(value);
  useEffect(() => () => { requestId.current++; }, []);
  useEffect(() => { if (disabled) { requestId.current++; setLocating(false); } }, [disabled]);
  function update(next) {
    requestId.current++; setLocating(false); setError(''); setMessage('Emplacement choisi. Enregistrez le formulaire pour le conserver.');
    onChange(next);
  }
  function locate() {
    setError(''); setMessage('');
    if (!navigator.geolocation) { setError('La localisation est indisponible sur cet appareil. Choisissez l’emplacement sur la carte.'); return; }
    const id = ++requestId.current;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(position => {
      if (id !== requestId.current || latest.current.disabled) return;
      const next = { latitude: Number(position.coords.latitude.toFixed(6)), longitude: Number(position.coords.longitude.toFixed(6)) };
      latest.current.onChange(next); setLocating(false); setOpen(true);
      setMessage(`Position obtenue${Number.isFinite(position.coords.accuracy) ? ` (précision estimée : ${Math.round(position.coords.accuracy)} m)` : ''}. Vérifiez le repère, puis enregistrez le formulaire.`);
    }, failure => {
      if (id !== requestId.current) return;
      setLocating(false);
      setError(failure.code === 1 ? 'Accès à la position refusé. Autorisez la localisation dans votre navigateur ou choisissez l’emplacement sur la carte.' : 'Position introuvable. Vérifiez le GPS et réessayez, ou choisissez l’emplacement sur la carte.');
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  }
  return <section className="position-picker" aria-label="Position de l’établissement">
    <h3>Emplacement de l’établissement</h3>
    <p>Si vous êtes sur place, utilisez votre position. Sinon, choisissez l’emplacement sur la carte.</p>
    <div className="position-actions">
      <button type="button" className="position-locate" disabled={disabled || locating} onClick={locate}><i className="bi bi-crosshair" aria-hidden="true" />{locating ? 'Recherche de votre position…' : 'Utiliser ma position'}</button>
      <button type="button" disabled={disabled} aria-expanded={open} aria-controls={mapId} onClick={() => setOpen(state => !state)}><i className="bi bi-map" aria-hidden="true" />{open ? 'Masquer la carte' : 'Choisir sur la carte'}</button>
      {(value.latitude !== '' && value.latitude != null || value.longitude !== '' && value.longitude != null) && <button type="button" disabled={disabled || locating} onClick={() => { requestId.current++; onChange({ latitude: '', longitude: '' }); setMessage('Position retirée du formulaire. Enregistrez pour confirmer.'); setError(''); }}>Retirer la position</button>}
    </div>
    {error && <p className="position-error" role="alert">{error}</p>}
    {message && <p className="position-status" role="status">{message}</p>}
    {!message && <p className="position-status">{point ? 'Un emplacement est renseigné. Vous pouvez le vérifier sur la carte.' : 'Aucun emplacement choisi pour le moment.'}</p>}
    {open && <div id={mapId}><PositionMap value={value} disabled={disabled || locating} onChange={update} /></div>}
    <details><summary>Saisir les coordonnées manuellement</summary><div className="position-coordinates">
      <label>Latitude<input type="number" min="-90" max="90" step="any" disabled={disabled || locating} value={value.latitude ?? ''} onChange={event => update({ latitude: event.target.value, longitude: value.longitude ?? '' })} /></label>
      <label>Longitude<input type="number" min="-180" max="180" step="any" disabled={disabled || locating} value={value.longitude ?? ''} onChange={event => update({ latitude: value.latitude ?? '', longitude: event.target.value })} /></label>
    </div></details>
  </section>;
}
