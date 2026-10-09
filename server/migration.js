import { DatabaseSync } from 'node:sqlite';

const tables = {
  records: ['kind', 'id', 'data'],
  settings: ['key', 'value'],
  admins: ['id', 'email', 'salt', 'hash', 'nom', 'telephone', 'image'],
  requests: ['id', 'kind', 'data', 'created'],
  partners: ['id', 'email', 'responsable', 'salt', 'hash', 'status', 'profile', 'document', 'pharmacy_id', 'reason', 'created', 'updated'],
  locations: ['id', 'pays', 'ville', 'quartier'],
};

// The source is opened read-only. A failed import rolls back all target data.
// Sessions are deliberately not copied: the administrator signs in again.
export async function migrateSQLite(sourceFile, target, { checkOnly = false } = {}) {
  if (target.kind !== 'postgres') throw new Error('La destination doit être PostgreSQL.');
  const source = new DatabaseSync(sourceFile, { readOnly: true });
  let snapshot;
  try {
    source.exec('BEGIN');
    snapshot = Object.fromEntries(Object.entries(tables).map(([table, columns]) => [table, source.prepare('SELECT name FROM sqlite_master WHERE type=? AND name=?').get('table', table) ? source.prepare(`SELECT ${columns.join(',')} FROM ${table}${table === 'records' ? ' ORDER BY rowid' : ''}`).all() : []]));
    source.exec('COMMIT');
  } finally { source.close(); }
  const counts = Object.fromEntries(Object.entries(snapshot).map(([table, rows]) => [table, rows.length]));
  await target.transaction(async () => {
    await target.exec('SELECT pg_advisory_xact_lock(72431002)');
    for (const table of [...Object.keys(tables), 'sessions', 'partner_sessions']) {
      if (Number((await target.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get()).count)) throw new Error('La base PostgreSQL doit être vide. Aucune donnée existante n’a été remplacée.');
    }
    if (checkOnly) return;
    for (const [table, columns] of Object.entries(tables)) {
      const statement = target.prepare(`INSERT INTO ${table}(${columns.join(',')}) VALUES(${columns.map(() => '?').join(',')})`);
      for (const row of snapshot[table]) await statement.run(...columns.map(column => row[column]));
      const imported = await target.prepare(`SELECT ${columns.join(',')} FROM ${table}`).all();
      const encode = row => JSON.stringify(columns.map(column => row[column]));
      if (JSON.stringify(imported.map(encode).sort()) !== JSON.stringify(snapshot[table].map(encode).sort())) throw new Error(`Vérification de migration échouée : ${table}.`);
    }
    await target.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run('catalog_initialized', 'true');
  });
  return counts;
}
