import { API_URL } from '../config.js';

export async function request(path, options = {}) {
  if (import.meta.env.VITE_GITHUB_PAGES === 'true') return (await import('./pages-demo.js')).demoRequest(path, options);
  const response = await fetch(`${API_URL}${path}`, { credentials: 'include', ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || 'Le serveur est indisponible.');
  return result;
}
export const write = (path, value, method = 'POST') => request(path, { method, body: JSON.stringify(value) });
export const assetUrl = path => path && API_URL.startsWith('http') && path.startsWith('/') ? new URL(path, API_URL).href : path;
const queryString = ({ lat, lng, page = 1, search = '' } = {}) => {
  const query = new URLSearchParams({ page: String(page), search });
  if (lat != null && lng != null) { query.set('lat', String(lat)); query.set('lng', String(lng)); }
  return query.toString();
};
const withImages = item => ({ ...item, image: assetUrl(item.image), pharmacie_image: assetUrl(item.pharmacie_image) });
const pageImages = data => ({ ...data, data: data.data.map(withImages) });
export async function listEstablishments(kind, params) { return pageImages(await request(`/${kind}?${queryString(params)}`)); }
export async function listMedicines(params) { return pageImages(await request(`/medicaments?${queryString(params)}`)); }
export async function getEstablishment(slug) { return withImages(await request(`/etablissements/${encodeURIComponent(slug)}`)); }
export async function getMedicine(slug) { return withImages(await request(`/medicaments/${encodeURIComponent(slug)}`)); }
export const getStats = () => request('/stats');
export const sendContactMessage = message => write('/contact', message);
export function fileData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ data: reader.result.split(',')[1] });
    reader.onerror = () => reject(new Error('Le fichier ne peut pas être lu.'));
    reader.readAsDataURL(file);
  });
}
export async function sendPrescription(form) {
  const image = await fileData(form.get('ordonnance'));
  return write('/prescriptions', { telephone: form.get('telephone'), adresse: form.get('adresse'), accept_contact: true, accept_substitution: form.get('accept_substitution') === '1', image });
}
