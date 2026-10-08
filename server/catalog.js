export const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
export const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const slugify = value => normalize(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function openingStatus(item, now = new Date()) {
  const day = DAYS[now.getDay()];
  const opened = item[`${day}_ouvert`];
  const open = item[`${day}_heure_ouverture`];
  const close = item[`${day}_heure_fermeture`];
  if (opened == null || (opened && (!open || !close))) return { statusText: 'Horaires non renseignés', statusBadge: '', statusSubText: '' };
  const minutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
  const time = now.getHours() * 60 + now.getMinutes();
  const isOpen = opened && (minutes(close) < minutes(open) ? time >= minutes(open) || time < minutes(close) : time >= minutes(open) && time < minutes(close));
  if (isOpen) return { statusText: 'Ouvert', statusBadge: 'text-success', statusSubText: `Ferme à ${close.slice(0, 5)}` };
  return { statusText: 'Fermé', statusBadge: 'text-danger', statusSubText: opened && time < minutes(open) ? `Ouvre à ${open.slice(0, 5)}` : 'Fermé pour aujourd’hui' };
}

export function hasCoordinates(item) {
  return item.latitude != null && item.longitude != null && Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude));
}

export function withDistance(list, lat, lng) {
  const located = lat != null && lng != null && lat !== '' && lng !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
  const rad = d => Number(d) * Math.PI / 180;
  return list.map(item => {
    const status = openingStatus(item);
    if (!located || !hasCoordinates(item)) return { ...item, ...status, distance: null, distanceMeters: null };
    const a = Math.sin(rad(item.latitude - lat) / 2) ** 2 + Math.cos(rad(lat)) * Math.cos(rad(item.latitude)) * Math.sin(rad(item.longitude - lng) / 2) ** 2;
    const d = 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
    return { ...item, ...status, distanceMeters: d, distance: d < 1000 ? `${Math.round(d)} m` : `${(d / 1000).toFixed(1).replace('.', ',')} km` };
  }).sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
}

export function paginate(list, query) {
  const per = 12;
  const last = Math.max(1, Math.ceil(list.length / per));
  const page = Math.min(last, Math.max(1, Number.parseInt(query.get('page'), 10) || 1));
  return { data: list.slice((page - 1) * per, page * per), current_page: page, last_page: last, total: list.length, per_page: per };
}

export function searchItems(list, term, fields) {
  const query = normalize(term).trim();
  return list.filter(item => !query || fields.some(field => normalize(item[field]).includes(query)));
}
