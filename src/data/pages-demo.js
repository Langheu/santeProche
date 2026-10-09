import { PHARMACY_LIST, CLINIC_LIST, MEDICINE_LIST } from './demo.js';
import { openingStatus, withDistance, paginate, searchItems } from '../../server/catalog.js';
import { classicIntent, validateIntent, searchCatalog } from '../../server/assistant.js';

const asset = path => path?.startsWith(import.meta.env.BASE_URL) ? path : path?.startsWith('/') && !path.startsWith('//') ? import.meta.env.BASE_URL + path.slice(1) : path;
const pharmacies = PHARMACY_LIST.map(p => ({ ...p, image: asset('/img/pharmacies/pharmacie-demo.jpg'), is_demo: true }));
const cliniques = CLINIC_LIST.map(p => ({ ...p, image: asset('/img/cliniques/clinique-demo.jpg'), is_demo: true }));
const medicaments = MEDICINE_LIST.map(m => {
  const p = pharmacies.find(p => p.slug === m.pharmacie_slug);
  return { ...p, ...m, pharmacie_id: p?.id, telephone: p?.telephone, adresse: p?.adresse, ville: p?.ville, latitude: p?.latitude, longitude: p?.longitude, pharmacie_image: p?.image, image: asset(m.image), currency: '', is_demo: true };
});
export async function demoRequest(path, options = {}) {
  const url = new URL(path, 'https://demo.invalid'), route = url.pathname, query = url.searchParams;
  const method = options.method || 'GET';
  if (route === '/assistant/status') return { configured: false };
  if (route === '/assistant/search' && method === 'POST') {
    const input = JSON.parse(options.body || '{}');
    if (input.image) throw new Error('L’analyse des photos nécessite le backend IA, absent de cette démonstration.');
    const intent = input.intent ? validateIntent(input.intent) : classicIntent(input.message || '', input.previous);
    if (input.city != null) intent.city = String(input.city);
    return { mode: 'classic', intent, confirmation: false, ...searchCatalog(intent, { pharmacies, cliniques, medicaments }, { lat: input.lat, lng: input.lng }) };
  }
  if (route === '/auth/status') return { setupRequired: false, authenticated: false };
  if (method !== 'GET') throw new Error('Cette démonstration GitHub ne dispose pas de backend. Les envois et les modifications ne sont pas disponibles.');
  if (route === '/stats') return { pharmacies: pharmacies.length, cliniques: cliniques.length, medicaments: new Set(medicaments.map(m => m.slug)).size, garde: pharmacies.filter(p => p.garde).length };
  const collections = { '/pharmacies': pharmacies, '/cliniques': cliniques, '/pharmacies-garde': pharmacies.filter(p => p.garde), '/medicaments': medicaments.filter(m => m.quantite > 0) };
  if (collections[route]) return paginate(withDistance(searchItems(collections[route], query.get('search'), route === '/medicaments' ? ['designation', 'pharmacie'] : ['nom', 'ville', 'adresse', 'description']), query.get('lat'), query.get('lng')), query);
  const detail = route.match(/^\/(etablissements|medicaments)\/([^/]+)$/);
  if (detail) {
    const slug = decodeURIComponent(detail[2]);
    if (detail[1] === 'etablissements') { const record = [...pharmacies, ...cliniques].find(p => p.slug === slug); if (record) return { ...record, ...openingStatus(record) }; }
    else { const offers = medicaments.filter(m => m.slug === slug && m.quantite > 0); if (offers.length) return { ...offers[0], pharmacies: offers.map(m => ({ ...pharmacies.find(p => p.slug === m.pharmacie_slug), ...openingStatus(m), prix_public: m.prix_public, quantite: m.quantite, currency: m.currency })) }; }
    throw new Error('Fiche introuvable.');
  }
  throw new Error('Ce service nécessite le backend, absent de la démonstration GitHub.');
}
