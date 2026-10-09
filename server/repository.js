import { randomUUID } from 'node:crypto';
import { PHARMACY_LIST, CLINIC_LIST, MEDICINE_LIST } from '../src/data/demo.js';

export function createRepository(db) {
  const insert = db.prepare('INSERT INTO records(kind,id,data) VALUES(?,?,?)');
  return {
    insert,
    list: async kind => (await db.prepare(`SELECT data FROM records WHERE kind=? ORDER BY ${db.kind === 'postgres' ? 'sequence' : 'rowid'}`).all(kind)).map(row => JSON.parse(row.data)),
    find: async (kind, id) => { const row = await db.prepare('SELECT data FROM records WHERE kind=? AND id=?').get(kind, id); return row ? JSON.parse(row.data) : null; },
    administrator: () => db.prepare('SELECT * FROM admins WHERE id=1').get(),
    async recordRequest(kind, data) {
      const id = randomUUID();
      await db.prepare('INSERT INTO requests(id,kind,data,created) VALUES(?,?,?,?)').run(id, kind, JSON.stringify(data), new Date().toISOString());
      return id;
    },
    async initializeCatalog() {
      await db.transaction(async () => {
        if (db.kind === 'postgres') await db.exec('SELECT pg_advisory_xact_lock(72431002)');
        if (await db.prepare('SELECT value FROM settings WHERE key=?').get('catalog_initialized')) return;
        if (process.env.SEED_DEMO !== 'false') {
          for (const item of PHARMACY_LIST) await insert.run('pharmacies', String(item.id), JSON.stringify({ ...item, id: String(item.id), image: '/img/pharmacies/pharmacie-demo.jpg', is_demo: true }));
          for (const item of CLINIC_LIST) await insert.run('cliniques', String(item.id), JSON.stringify({ ...item, id: String(item.id), image: '/img/cliniques/clinique-demo.jpg', is_demo: true }));
          for (const item of MEDICINE_LIST) await insert.run('medicaments', String(item.id), JSON.stringify({ id: String(item.id), designation: item.designation, slug: item.slug, forme: item.forme, prix_public: item.prix_public, quantite: item.quantite, pharmacie_id: String(PHARMACY_LIST.find(p => p.slug === item.pharmacie_slug).id), image: item.image, currency: '', is_demo: true }));
        }
        await db.prepare('INSERT INTO settings(key,value) VALUES(?,?)').run('catalog_initialized', 'true');
      });
    },
  };
}
