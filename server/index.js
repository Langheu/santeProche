import { createServer } from 'node:http';
import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase } from './database.js';
import { createRepository } from './repository.js';
import { ensureLocalPostgres } from './local-postgres.js';
import { DAYS, slugify, openingStatus, withDistance, paginate, searchItems } from './catalog.js';
import { aiConfigured, interpret, validateIntent, searchCatalog } from './assistant.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (process.env.NODE_ENV !== 'test' && existsSync(join(root, '.env'))) process.loadEnvFile(join(root, '.env'));
const storage = resolve(process.env.DATA_DIR || join(root, 'server', 'storage'));
mkdirSync(join(storage, 'uploads'), { recursive: true });
mkdirSync(join(storage, 'prescriptions'), { recursive: true });
await ensureLocalPostgres(storage);
const db = await openDatabase({ directory: storage });
const { insert, list, find, administrator, recordRequest, initializeCatalog } = createRepository(db);
await initializeCatalog();
const hashToken = token => createHash('sha256').update(token).digest('hex');
const deriveKey = promisify(scrypt);
const loginAttempts = new Map();
const assistantAttempts = new Map();
let aiDay = { day: '', count: 0, active: 0 };
const MAX_BODY = 16 * 1024 * 1024;
const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '127.0.0.1';
const production = process.env.NODE_ENV === 'production';

function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(value));
}
function fail(status, message) { const error = new Error(message); error.status = status; throw error; }
async function body(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) fail(415, 'Le contenu doit être au format JSON.');
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > MAX_BODY) fail(413, 'Fichier trop volumineux.'); chunks.push(chunk); }
  try { const value = JSON.parse(Buffer.concat(chunks).toString('utf8')); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(); return value; }
  catch { fail(400, 'Données invalides.'); }
}
function cookieToken(req) { return (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('sp_session='))?.slice(11); }
async function authorized(req) {
  const token = cookieToken(req);
  if (!token) return false;
  const session = await db.prepare('SELECT expires FROM sessions WHERE token=?').get(hashToken(token));
  return session && session.expires > Date.now();
}
async function requireAdmin(req) { if (!await authorized(req)) fail(401, 'Connectez-vous à l’administration.'); }
const publicProfile = admin => ({ nom: admin.nom, email: admin.email, telephone: admin.telephone, image: admin.image });
async function verifyCurrentPassword(req, password, admin) {
  const key = `${req.socket.remoteAddress}:profile`;
  let attempt = loginAttempts.get(key);
  if (!attempt || attempt.until < Date.now()) attempt = { count: 0, until: Date.now() + 15 * 60 * 1000 };
  if (attempt.count >= 10) fail(429, 'Trop de tentatives. Réessayez dans 15 minutes.');
  attempt.count++; loginAttempts.set(key, attempt);
  if (typeof password !== 'string' || password.length > 256) fail(400, 'Saisissez votre mot de passe actuel.');
  const hash = await deriveKey(password, admin.salt, 64);
  if (!timingSafeEqual(hash, Buffer.from(admin.hash, 'hex'))) fail(400, 'Le mot de passe actuel est incorrect.');
  await requireAdmin(req);
  if ((await administrator()).hash !== admin.hash) fail(409, 'Votre accès a changé. Rechargez la page.');
  loginAttempts.delete(key);
}
function sessionCookie(res, value, seconds) { res.setHeader('Set-Cookie', `sp_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${seconds}${production ? '; Secure' : ''}`); }
async function establishSession(res) {
  const token = randomBytes(32).toString('hex');
  await db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());
  await db.prepare('INSERT INTO sessions(token,expires) VALUES(?,?)').run(hashToken(token), Date.now() + 8 * 60 * 60 * 1000);
  sessionCookie(res, token, 8 * 60 * 60);
}
const text = (value, max = 500) => String(value ?? '').trim().slice(0, max);
const normalizeEmail = value => text(value, 200).toLowerCase();
function email(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function numeric(value, min, max, label, optional = false) {
  if (optional && (value == null || value === '')) return null;
  const n = Number(value); if (value == null || value === '' || !Number.isFinite(n) || n < min || n > max) fail(400, `${label} invalide.`); return n;
}
function imageUrl(value) {
  const url = text(value, 2000);
  if (url && !/^\/(?!\/)/.test(url) && !/^https?:\/\//i.test(url)) fail(400, 'URL d’image invalide.');
  return url || null;
}
async function validateRecord(kind, input, existing) {
  const record = { id: existing?.id || randomUUID(), is_demo: Boolean(input.is_demo) };
  if (kind === 'medicaments') {
    record.designation = text(input.designation, 200); if (!record.designation) fail(400, 'Le nom du médicament est obligatoire.');
    record.slug = slugify(record.designation); if (!record.slug) fail(400, 'Nom du médicament invalide.');
    record.pharmacie_id = text(input.pharmacie_id, 100); if (!await find('pharmacies', record.pharmacie_id)) fail(400, 'Choisissez une pharmacie existante.');
    record.forme = text(input.forme, 300);
    record.prix_public = numeric(input.prix_public, 0, 1e12, 'Prix');
    record.quantite = numeric(input.quantite, 0, 1e9, 'Quantité');
    if (!Number.isInteger(record.quantite)) fail(400, 'La quantité doit être entière.');
    record.currency = text(input.currency, 3).toUpperCase(); if (!/^[A-Z]{3}$/.test(record.currency)) fail(400, 'Renseignez une devise valide à trois lettres.');
  } else {
    record.nom = text(input.nom, 200); if (!record.nom) fail(400, 'Le nom de l’établissement est obligatoire.');
    record.slug = existing?.slug || `${slugify(record.nom) || 'etablissement'}-${record.id.slice(0, 8)}`;
    record.type_etablissement = kind === 'cliniques' ? 'clinique' : 'pharmacie';
    for (const key of ['adresse', 'ville', 'pays', 'description']) record[key] = text(input[key], key === 'description' ? 5000 : 500);
    record.telephone = text(input.telephone, 40);
    if (record.telephone && !/^(?:\+|00)?[\d\s().-]{7,40}$/.test(record.telephone)) fail(400, 'Téléphone invalide.');
    record.email = text(input.email, 200); if (record.email && !email(record.email)) fail(400, 'Email invalide.');
    record.latitude = numeric(input.latitude, -90, 90, 'Latitude', true);
    record.longitude = numeric(input.longitude, -180, 180, 'Longitude', true);
    if ((record.latitude == null) !== (record.longitude == null)) fail(400, 'Renseignez les deux coordonnées ou laissez-les vides.');
    record.garde = Boolean(input.garde);
    for (const day of DAYS) {
      const opened = input[`${day}_ouvert`]; record[`${day}_ouvert`] = opened == null ? null : Boolean(opened);
      for (const field of ['ouverture', 'fermeture']) {
        const value = text(input[`${day}_heure_${field}`], 8);
        if (value && !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)) fail(400, `Horaire de ${day} invalide.`);
        record[`${day}_heure_${field}`] = value || null;
      }
      if (opened && (!record[`${day}_heure_ouverture`] || !record[`${day}_heure_fermeture`])) fail(400, `Renseignez les horaires de ${day}.`);
    }
  }
  record.image = imageUrl(input.image);
  return record;
}
function hydrateMedicine(item, pharmacy) {
  if (!pharmacy) return null;
  return { ...pharmacy, ...item, pharmacie: pharmacy.nom, pharmacie_slug: pharmacy.slug, pharmacie_image: pharmacy.image, telephone: pharmacy.telephone, adresse: pharmacy.adresse, ville: pharmacy.ville, latitude: pharmacy.latitude, longitude: pharmacy.longitude };
}
async function hydrateMedicines(items) {
  const pharmacies = new Map((await list('pharmacies')).map(item => [item.id, item]));
  return items.map(item => hydrateMedicine(item, pharmacies.get(item.pharmacie_id))).filter(Boolean);
}
function saveImage(input, directory) {
  const data = input?.data; if (typeof data !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(data)) fail(400, 'Fichier image invalide.');
  const buffer = Buffer.from(data, 'base64'); if (!buffer.length || buffer.length > 10 * 1024 * 1024) fail(413, 'L’image doit faire moins de 10 Mo.');
  let extension;
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) extension = 'jpg';
  else if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) extension = 'png';
  else if (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') extension = 'webp';
  else fail(400, 'Formats acceptés : JPG, PNG, WEBP.');
  const filename = `${randomUUID()}.${extension}`;
  writeFileSync(join(storage, directory, filename), buffer, { flag: 'wx' });
  return filename;
}
function serveFile(res, filename, type) {
  if (!existsSync(filename)) fail(404, 'Fichier introuvable.');
  res.writeHead(200, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, max-age=3600' }); res.end(readFileSync(filename));
}
export const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost'); const path = url.pathname; const method = req.method;
    const origin = req.headers.origin;
    const sameOrigin = origin && new URL(origin).host === req.headers.host;
    const developmentOrigins = !production && ['http://localhost:5173', 'http://127.0.0.1:5173'].includes(origin);
    const allowedOrigin = !origin || sameOrigin || developmentOrigins || origin === process.env.APP_ORIGIN;
    if (origin && allowedOrigin) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Access-Control-Allow-Credentials', 'true'); res.setHeader('Vary', 'Origin'); }
    if (!allowedOrigin && method !== 'GET') fail(403, 'Origine non autorisée.');
    if (method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE', 'Access-Control-Allow-Headers': 'Content-Type' }); res.end(); return; }

    if (path === '/api/health') return json(res, 200, { status: 'ok' });
    if (path === '/api/assistant/status' && method === 'GET') return json(res, 200, { configured: aiConfigured() });
    if (path === '/api/assistant/search' && method === 'POST') {
      const input = await body(req);
      const message = text(input.message, 1500);
      if (!message && !input.image && !input.intent) fail(400, 'Saisissez votre recherche.');
      const location = { lat: numeric(input.lat, -90, 90, 'Latitude', true), lng: numeric(input.lng, -180, 180, 'Longitude', true) };
      if ((location.lat == null) !== (location.lng == null)) fail(400, 'Position incomplète.');
      const key = req.socket.remoteAddress; const now = Date.now();
      if (assistantAttempts.size > 1000) for (const [ip, attempt] of assistantAttempts) if (attempt.until < now) assistantAttempts.delete(ip);
      const attempt = assistantAttempts.get(key)?.until > now ? assistantAttempts.get(key) : { until: now + 60 * 60 * 1000, ai: 0, all: 0 };
      if (++attempt.all > 150) fail(429, 'Trop de recherches. Réessayez plus tard.');
      assistantAttempts.set(key, attempt);
      let parsed;
      if (input.intent) parsed = { intent: validateIntent(input.intent), mode: 'confirmed', confirmation: false };
      else {
        const useAI = aiConfigured();
        if (useAI) {
          const day = new Date().toISOString().slice(0, 10);
          if (aiDay.day !== day) aiDay = { day, count: 0, active: aiDay.active };
          const configuredLimit = Number(process.env.AI_DAILY_LIMIT ?? 200);
          const dailyLimit = Number.isFinite(configuredLimit) ? Math.max(0, configuredLimit) : 200;
          if (attempt.ai >= 30 || aiDay.count >= dailyLimit || aiDay.active >= 4) fail(429, 'La limite d’analyses IA est atteinte. Utilisez la recherche classique ou réessayez plus tard.');
          attempt.ai++; aiDay.count++; aiDay.active++;
        }
        try { parsed = await interpret({ ...input, message, previous: input.previous ? validateIntent(input.previous) : null }); }
        finally { if (useAI) aiDay.active--; }
      }
      if (input.city != null) parsed.intent.city = text(input.city, 150);
      if (parsed.confirmation) return json(res, 200, { ...parsed, results: [], total: 0, message: 'Vérifiez le nom, le dosage et la présentation avant de rechercher.' });
      const catalog = { pharmacies: await list('pharmacies'), cliniques: await list('cliniques'), medicaments: await hydrateMedicines(await list('medicaments')) };
      return json(res, 200, { ...parsed, ...searchCatalog(parsed.intent, catalog, location) });
    }
    if (path === '/api/auth/status' && method === 'GET') return json(res, 200, { setupRequired: !(await administrator()), authenticated: Boolean(await authorized(req)) });
    if (path === '/api/auth/setup' && method === 'POST') {
      if ((await administrator())) fail(409, 'Un administrateur existe déjà.');
      const local = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
      if (!local || !['localhost', '127.0.0.1'].includes((req.headers.host || '').split(':')[0])) fail(403, 'La création initiale doit se faire sur cet ordinateur.');
      const input = await body(req); const userEmail = normalizeEmail(input.email);
      if (!email(userEmail) || typeof input.password !== 'string' || input.password.length < 12 || input.password.length > 256) fail(400, 'Email valide et mot de passe de 12 caractères minimum requis.');
      const salt = randomBytes(16).toString('hex'); const hash = (await deriveKey(input.password, salt, 64)).toString('hex');
      if ((await administrator())) fail(409, 'Un administrateur existe déjà.');
      await db.prepare('INSERT INTO admins(id,email,salt,hash) VALUES(1,?,?,?)').run(userEmail, salt, hash); await establishSession(res); return json(res, 201, { success: true });
    }
    if (path === '/api/auth/login' && method === 'POST') {
      const key = req.socket.remoteAddress; const now = Date.now(); let attempt = loginAttempts.get(key);
      if (!attempt || attempt.until < now) attempt = { count: 0, until: now + 15 * 60 * 1000 };
      if (attempt.count >= 10) fail(429, 'Trop de tentatives. Réessayez dans 15 minutes.');
      attempt.count++; loginAttempts.set(key, attempt);
      const input = await body(req); const admin = (await administrator()); const userEmail = normalizeEmail(input.email);
      if (typeof input.password !== 'string' || input.password.length > 256) fail(401, 'Identifiants incorrects.');
      const hash = await deriveKey(input.password, admin?.salt || 'missing-user', 64);
      if (!admin || normalizeEmail(admin.email) !== userEmail || !timingSafeEqual(hash, Buffer.from(admin.hash, 'hex'))) fail(401, 'Identifiants incorrects.');
      loginAttempts.delete(key); await establishSession(res); return json(res, 200, { success: true });
    }
    if (path === '/api/auth/logout' && method === 'POST') { const token = cookieToken(req); if (token) await db.prepare('DELETE FROM sessions WHERE token=?').run(hashToken(token)); sessionCookie(res, '', 0); return json(res, 200, { success: true }); }

    if (path === '/api/stats' && method === 'GET') return json(res, 200, { pharmacies: (await list('pharmacies')).length, cliniques: (await list('cliniques')).length, medicaments: new Set((await list('medicaments')).map(m => m.slug)).size, garde: (await list('pharmacies')).filter(p => p.garde).length });
    if (['/api/pharmacies', '/api/cliniques', '/api/pharmacies-garde', '/api/medicaments'].includes(path) && method === 'GET') {
      const kind = path.split('/').pop(); let items = kind === 'medicaments' ? await hydrateMedicines((await list(kind)).filter(item => item.quantite > 0)) : await list(kind === 'pharmacies-garde' ? 'pharmacies' : kind);
      if (kind === 'pharmacies-garde') items = items.filter(item => item.garde);
      items = searchItems(items, url.searchParams.get('search'), kind === 'medicaments' ? ['designation', 'pharmacie'] : ['nom', 'adresse', 'ville', 'description']);
      return json(res, 200, paginate(withDistance(items, url.searchParams.get('lat'), url.searchParams.get('lng')), url.searchParams));
    }
    const detail = path.match(/^\/api\/(etablissements|medicaments)\/([^/]+)$/);
    if (detail && method === 'GET') {
      const slug = decodeURIComponent(detail[2]);
      if (detail[1] === 'etablissements') { const item = [...await list('pharmacies'), ...await list('cliniques')].find(p => p.slug === slug); if (!item) fail(404, 'Établissement introuvable.'); return json(res, 200, { ...item, ...openingStatus(item) }); }
      const offers = await hydrateMedicines((await list('medicaments')).filter(m => m.slug === slug && m.quantite > 0));
      if (!offers.length) fail(404, 'Médicament introuvable.');
      return json(res, 200, { designation: offers[0].designation, forme: offers[0].forme, image: offers[0].image, slug, pharmacies: await Promise.all(offers.map(async o => ({ ...await find('pharmacies', o.pharmacie_id), ...openingStatus(o), prix_public: o.prix_public, quantite: o.quantite, currency: o.currency }))) });
    }
    if (path === '/api/contact' && method === 'POST') {
      const input = await body(req); const message = Object.fromEntries(['nom', 'email', 'sujet', 'message'].map(key => [key, text(input[key], key === 'message' ? 10000 : 200)]));
      if (Object.values(message).some(value => !value) || !email(message.email)) fail(400, 'Remplissez les champs et saisissez un email valide.');
      return json(res, 201, { success: true, id: await recordRequest('contact', message) });
    }
    if (path === '/api/prescriptions' && method === 'POST') {
      const input = await body(req); const phone = text(input.telephone, 40);
      if (!/^\+?\d{7,15}$/.test(phone) || !input.accept_contact) fail(400, 'Téléphone valide et consentement requis.');
      const filename = saveImage(input.image, 'prescriptions');
      return json(res, 201, { success: true, id: await recordRequest('prescription', { telephone: phone, adresse: text(input.adresse), accept_substitution: Boolean(input.accept_substitution), filename }) });
    }
    const upload = path.match(/^\/api\/uploads\/([a-f\d-]+\.(jpg|png|webp))$/);
    if (upload && method === 'GET') return serveFile(res, join(storage, 'uploads', upload[1]), `image/${upload[2] === 'jpg' ? 'jpeg' : upload[2]}`);

    if (path.startsWith('/api/admin/')) {
      await requireAdmin(req);
      if (path === '/api/admin/profile' && method === 'GET') return json(res, 200, publicProfile((await administrator())));
      if (path === '/api/admin/profile' && method === 'PUT') {
        const input = await body(req); const admin = (await administrator());
        const userEmail = normalizeEmail(input.email);
        if (!email(userEmail)) fail(400, 'Saisissez un email valide.');
        const phone = text(input.telephone, 40);
        if (phone && !/^(?:\+|00)?[\d\s().-]{7,40}$/.test(phone)) fail(400, 'Téléphone invalide.');
        const image = imageUrl(input.image) || '';
        if (userEmail !== normalizeEmail(admin.email)) await verifyCurrentPassword(req, input.current_password, admin);
        await requireAdmin(req);
        await db.prepare('UPDATE admins SET nom=?,email=?,telephone=?,image=? WHERE id=1').run(text(input.nom, 200), userEmail, phone, image);
        return json(res, 200, publicProfile((await administrator())));
      }
      if (path === '/api/admin/profile/password' && method === 'PUT') {
        const input = await body(req); const admin = (await administrator());
        if (typeof input.new_password !== 'string' || input.new_password.length < 12 || input.new_password.length > 256) fail(400, 'Le nouveau mot de passe doit contenir entre 12 et 256 caractères.');
        if (input.new_password !== input.confirm_password) fail(400, 'Les deux nouveaux mots de passe ne correspondent pas.');
        await verifyCurrentPassword(req, input.current_password, admin);
        const salt = randomBytes(16).toString('hex');
        const hash = (await deriveKey(input.new_password, salt, 64)).toString('hex');
        await requireAdmin(req);
        await db.transaction(async () => {
          const current = await db.prepare(`SELECT hash FROM admins WHERE id=1${db.kind === 'postgres' ? ' FOR UPDATE' : ''}`).get();
          if (current.hash !== admin.hash) fail(409, 'Votre accès a changé. Rechargez la page.');
          await db.prepare('UPDATE admins SET salt=?,hash=? WHERE id=1').run(salt, hash);
          await db.exec('DELETE FROM sessions'); await establishSession(res);
        });
        return json(res, 200, { success: true });
      }
      if (path === '/api/admin/upload' && method === 'POST') { const filename = saveImage(await body(req), 'uploads'); return json(res, 201, { url: `/api/uploads/${filename}` }); }
      if (path === '/api/admin/requests' && method === 'GET') return json(res, 200, (await db.prepare('SELECT * FROM requests ORDER BY created DESC').all()).map(row => ({ ...row, data: JSON.parse(row.data) })));
      const prescription = path.match(/^\/api\/admin\/prescriptions\/([^/]+)\/image$/);
      if (prescription && method === 'GET') { const row = await db.prepare('SELECT data FROM requests WHERE id=? AND kind=?').get(prescription[1], 'prescription'); if (!row) fail(404, 'Ordonnance introuvable.'); const file = JSON.parse(row.data).filename; return serveFile(res, join(storage, 'prescriptions', file), `image/${extname(file) === '.jpg' ? 'jpeg' : extname(file).slice(1)}`); }
      const match = path.match(/^\/api\/admin\/(pharmacies|cliniques|medicaments)(?:\/([^/]+))?$/);
      if (!match) fail(404, 'Route introuvable.'); const [, kind, id] = match;
      if (method === 'GET' && !id) return json(res, 200, await list(kind));
      if (method === 'POST' && !id || method === 'PUT' && id) {
        const existing = id ? await find(kind, id) : null; if (id && !existing) fail(404, 'Fiche introuvable.');
        const record = await validateRecord(kind, await body(req), existing);
        if (existing) await db.prepare('UPDATE records SET data=? WHERE kind=? AND id=?').run(JSON.stringify(record), kind, id);
        else await insert.run(kind, record.id, JSON.stringify(record));
        return json(res, existing ? 200 : 201, record);
      }
      if (method === 'DELETE' && id) {
        if (!await find(kind, id)) fail(404, 'Fiche introuvable.');
        if (kind === 'pharmacies' && (await list('medicaments')).some(m => m.pharmacie_id === id)) fail(409, 'Supprimez ou réaffectez les offres de cette pharmacie avant de la supprimer.');
        await db.prepare('DELETE FROM records WHERE kind=? AND id=?').run(kind, id); return json(res, 200, { success: true });
      }
      fail(405, 'Méthode non autorisée.');
    }
    // Sert également la version compilée pour un lancement avec npm start.
    if (method === 'GET' && !path.startsWith('/api/')) {
      const dist = join(root, 'dist'); const requested = resolve(dist, '.' + decodeURIComponent(path));
      if (requested !== dist && !requested.startsWith(dist + '/')) {
        // Les séparateurs Windows sont pris en compte par resolve et dirname.
        if (!requested.startsWith(dist + '\\')) fail(403, 'Chemin invalide.');
      }
      const file = extname(requested) ? requested : join(dist, 'index.html');
      const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon' };
      return serveFile(res, file, types[extname(file)] || 'application/octet-stream');
    }
    fail(404, 'Route introuvable.');
  } catch (error) {
    if (res.headersSent) { res.end(); return; }
    json(res, error.status || 500, { error: error.status ? error.message : 'Une erreur est survenue sur le serveur.' });
    if (!error.status) console.error(error);
  }
});

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) server.listen(PORT, HOST, () => console.log(`SantéProche : http://${HOST}:${PORT} · Administration : /admin`));
export { db };
