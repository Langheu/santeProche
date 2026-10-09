import { randomUUID, randomBytes, createHash, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { join, extname } from 'node:path';

const derive = promisify(scrypt);
const digest = value => createHash('sha256').update(value).digest('hex');
export function partnerRoutes({ db, list, find, validateRecord, body, json, fail, requireAdmin, saveImage, serveFile, storage, production }) {
  const attempts = new Map();
  const get = id => db.prepare('SELECT * FROM partners WHERE id=?').get(id);
  const safe = row => ({ id: row.id, email: row.email, responsable: row.responsable, status: row.status, reason: row.reason, pharmacy_id: row.pharmacy_id, profile: JSON.parse(row.profile), created: row.created, updated: row.updated });
  function limit(req, kind) {
    const now = Date.now(), key = `${req.socket.remoteAddress}:${kind}`;
    if (attempts.size > 1000) for (const [key, item] of attempts) if (item.until < now) attempts.delete(key);
    const item = attempts.get(key)?.until > now ? attempts.get(key) : { count: 0, until: now + 15 * 60 * 1000 };
    if (++item.count > (kind === 'register' ? 5 : 15)) fail(429, 'Trop de tentatives. Réessayez dans 15 minutes.');
    attempts.set(key, item);
  }
  const cookie = req => (req.headers.cookie || '').split(';').map(item => item.trim()).find(item => item.startsWith('sp_partner='))?.slice(11);
  function setCookie(res, token, age) { res.setHeader('Set-Cookie', `sp_partner=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${production ? '; Secure' : ''}`); }
  async function session(res, id) {
    const token = randomBytes(32).toString('hex');
    await db.prepare('DELETE FROM partner_sessions WHERE expires<?').run(Date.now());
    await db.prepare('INSERT INTO partner_sessions(token,partner_id,expires) VALUES(?,?,?)').run(digest(token), id, Date.now() + 8 * 60 * 60 * 1000);
    setCookie(res, token, 8 * 60 * 60);
  }
  async function current(req, required = true) {
    const token = cookie(req);
    const row = token ? await db.prepare('SELECT p.* FROM partners p JOIN partner_sessions s ON s.partner_id=p.id WHERE s.token=? AND s.expires>?').get(digest(token), Date.now()) : null;
    if (!row && required) fail(401, 'Connectez-vous à votre espace pharmacie.');
    return row;
  }
  function approved(row) { if (row.status !== 'approved') fail(403, 'Votre pharmacie doit être approuvée et active pour modifier ses données.'); }
  async function profile(input, existing) {
    const record = await validateRecord('pharmacies', { ...input, is_demo: false }, existing);
    if (!record.adresse || !record.ville || !record.pays || !record.telephone) fail(400, 'Nom, adresse, ville, pays et téléphone de la pharmacie sont obligatoires.');
    return record;
  }
  function image(input, folder) {
    if (typeof input?.data !== 'string' || input.data.length > 6 * 1024 * 1024 || Buffer.from(input.data, 'base64').length > 4 * 1024 * 1024) fail(400, 'Ajoutez une image JPG, PNG ou WEBP de 4 Mo maximum.');
    return saveImage(input, folder);
  }
  return async function handle(req, res, path, method) {
    if (!path.startsWith('/api/partner/') && !/^\/api\/admin\/partners(?:\/|$)/.test(path)) return false;
    if (path.startsWith('/api/admin/partners')) {
      await requireAdmin(req);
      if (path === '/api/admin/partners' && method === 'GET') { json(res, 200, (await db.prepare('SELECT * FROM partners ORDER BY created DESC').all()).map(safe)); return true; }
      const document = path.match(/^\/api\/admin\/partners\/([^/]+)\/document$/);
      if (document && method === 'GET') {
        const row = await get(document[1]); if (!row) fail(404, 'Demande introuvable.');
        serveFile(res, join(storage, 'partner-documents', row.document), `image/${extname(row.document) === '.jpg' ? 'jpeg' : extname(row.document).slice(1)}`); return true;
      }
      const review = path.match(/^\/api\/admin\/partners\/([^/]+)\/review$/);
      if (review && method === 'PUT') {
        const input = await body(req), reason = String(input.reason || '').trim().slice(0, 2000);
        if (!['approve', 'reject', 'suspend'].includes(input.action)) fail(400, 'Décision invalide.');
        if (input.action !== 'approve' && !reason) fail(400, 'Indiquez le motif de votre décision.');
        await db.transaction(async () => {
          const row = await db.prepare(`SELECT * FROM partners WHERE id=?${db.kind === 'postgres' ? ' FOR UPDATE' : ''}`).get(review[1]);
          if (!row) fail(404, 'Demande introuvable.');
          if (input.action === 'reject' && row.status !== 'pending' || input.action === 'suspend' && row.status !== 'approved' || input.action === 'approve' && !['pending', 'suspended'].includes(row.status)) fail(409, 'Le statut de cette demande a changé. Rechargez la liste.');
          let pharmacyId = row.pharmacy_id;
          if (input.action === 'approve' && !pharmacyId) {
            const draft = JSON.parse(row.profile), record = await profile(draft, draft);
            await db.prepare('INSERT INTO records(kind,id,data) VALUES(?,?,?)').run('pharmacies', record.id, JSON.stringify(record)); pharmacyId = record.id;
          }
          const status = { approve: 'approved', reject: 'rejected', suspend: 'suspended' }[input.action];
          await db.prepare('UPDATE partners SET status=?,reason=?,pharmacy_id=?,updated=? WHERE id=?').run(status, reason, pharmacyId, new Date().toISOString(), row.id);
        });
        json(res, 200, safe(await get(review[1]))); return true;
      }
      fail(404, 'Route introuvable.');
    }
    if (path === '/api/partner/register' && method === 'POST') {
      limit(req, 'register'); const input = await body(req);
      const email = String(input.email || '').trim().toLowerCase(), responsable = String(input.responsable || '').trim().slice(0, 200);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200 || !responsable || typeof input.password !== 'string' || input.password.length < 12 || input.password.length > 256 || input.password !== input.confirm_password || input.accept_review !== true) fail(400, 'Vérifiez votre email, le responsable, le consentement et les mots de passe (12 caractères minimum).');
      if (await db.prepare('SELECT id FROM partners WHERE email=?').get(email)) fail(409, 'Un compte existe déjà avec cet email. Connectez-vous.');
      const draft = await profile({ ...input.profile, image: null });
      const document = image(input.document, 'partner-documents');
      if (input.photo) draft.image = `/api/uploads/${image(input.photo, 'uploads')}`;
      const salt = randomBytes(16).toString('hex'), hash = (await derive(input.password, salt, 64)).toString('hex'), id = randomUUID(), now = new Date().toISOString();
      try { await db.prepare('INSERT INTO partners(id,email,responsable,salt,hash,status,profile,document,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id, email, responsable, salt, hash, 'pending', JSON.stringify(draft), document, now, now); }
      catch (error) { if (error.code === '23505' || error.code === 'ERR_SQLITE_ERROR' && /UNIQUE/.test(error.message)) fail(409, 'Un compte existe déjà avec cet email.'); throw error; }
      await session(res, id); json(res, 201, safe(await get(id))); return true;
    }
    if (path === '/api/partner/login' && method === 'POST') {
      limit(req, 'login'); const input = await body(req);
      const row = await db.prepare('SELECT * FROM partners WHERE email=?').get(String(input.email || '').trim().toLowerCase());
      if (typeof input.password !== 'string' || input.password.length > 256) fail(401, 'Identifiants incorrects.');
      const hash = await derive(input.password, row?.salt || 'missing-partner', 64);
      if (!row || !timingSafeEqual(hash, Buffer.from(row.hash, 'hex'))) fail(401, 'Identifiants incorrects.');
      await session(res, row.id); json(res, 200, safe(row)); return true;
    }
    if (path === '/api/partner/status' && method === 'GET') { const row = await current(req, false); json(res, 200, row ? safe(row) : null); return true; }
    if (path === '/api/partner/logout' && method === 'POST') { const token = cookie(req); if (token) await db.prepare('DELETE FROM partner_sessions WHERE token=?').run(digest(token)); setCookie(res, '', 0); json(res, 200, { success: true }); return true; }
    const row = await current(req);
    if (path === '/api/partner/document' && method === 'GET') { serveFile(res, join(storage, 'partner-documents', row.document), `image/${extname(row.document) === '.jpg' ? 'jpeg' : extname(row.document).slice(1)}`); return true; }
    if (path === '/api/partner/application' && method === 'PUT') {
      if (!['pending', 'rejected'].includes(row.status)) fail(403, 'Votre dossier ne peut pas être renvoyé dans ce statut.');
      const input = await body(req), draft = await profile(input.profile, JSON.parse(row.profile));
      const document = input.document ? image(input.document, 'partner-documents') : row.document;
      if (input.photo) draft.image = `/api/uploads/${image(input.photo, 'uploads')}`;
      await db.transaction(async () => {
        const currentRow = await db.prepare(`SELECT status FROM partners WHERE id=?${db.kind === 'postgres' ? ' FOR UPDATE' : ''}`).get(row.id);
        if (!['pending', 'rejected'].includes(currentRow.status)) fail(409, 'Votre statut a changé. Rechargez votre espace.');
        await db.prepare('UPDATE partners SET profile=?,document=?,status=?,reason=?,updated=? WHERE id=?').run(JSON.stringify(draft), document, 'pending', '', new Date().toISOString(), row.id);
      });
      json(res, 200, safe(await get(row.id))); return true;
    }
    if (path === '/api/partner/profile' && method === 'GET') { json(res, 200, row.pharmacy_id ? await find('pharmacies', row.pharmacy_id) : JSON.parse(row.profile)); return true; }
    approved(row);
    // Lock the account while writing: suspension and edits cannot pass each other.
    let response;
    const respond = (res, status, data) => { response = { status, data }; };
    await db.transaction(async () => {
      const active = await db.prepare(`SELECT * FROM partners WHERE id=?${db.kind === 'postgres' ? ' FOR UPDATE' : ''}`).get(row.id); approved(active);
      if (path === '/api/partner/upload' && method === 'POST') { respond(res, 201, { url: `/api/uploads/${image(await body(req), 'uploads')}` }); return; }
      if (path === '/api/partner/profile' && method === 'PUT') {
        const record = await profile(await body(req), await find('pharmacies', active.pharmacy_id));
        await db.prepare('UPDATE records SET data=? WHERE kind=? AND id=?').run(JSON.stringify(record), 'pharmacies', active.pharmacy_id);
        await db.prepare('UPDATE partners SET profile=?,updated=? WHERE id=?').run(JSON.stringify(record), new Date().toISOString(), active.id);
        respond(res, 200, record); return;
      }
      const match = path.match(/^\/api\/partner\/medicaments(?:\/([^/]+))?$/);
      if (!match) fail(404, 'Route introuvable.');
      const id = match[1];
      if (method === 'GET' && !id) { respond(res, 200, (await list('medicaments')).filter(item => item.pharmacie_id === active.pharmacy_id)); return; }
      const existing = id ? await find('medicaments', id) : null;
      if (id && (!existing || existing.pharmacie_id !== active.pharmacy_id)) fail(404, 'Médicament introuvable dans votre pharmacie.');
      if (method === 'POST' && !id || method === 'PUT' && id) {
        const record = await validateRecord('medicaments', { ...await body(req), pharmacie_id: active.pharmacy_id, is_demo: false }, existing);
        if (existing) await db.prepare('UPDATE records SET data=? WHERE kind=? AND id=?').run(JSON.stringify(record), 'medicaments', id);
        else await db.prepare('INSERT INTO records(kind,id,data) VALUES(?,?,?)').run('medicaments', record.id, JSON.stringify(record));
        respond(res, existing ? 200 : 201, record); return;
      }
      if (method === 'DELETE' && id) { await db.prepare('DELETE FROM records WHERE kind=? AND id=?').run('medicaments', id); respond(res, 200, { success: true }); return; }
      fail(405, 'Méthode non autorisée.');
    });
    json(res, response.status, response.data);
    return true;
  };
}
