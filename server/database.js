import { DatabaseSync } from 'node:sqlite';
import { AsyncLocalStorage } from 'node:async_hooks';
import { join } from 'node:path';
import pg from 'pg';

// Each transaction owns its connection. SQLite operations are queued while a
// transaction is active so another HTTP request cannot join that transaction.
export async function openDatabase({ directory, url = process.env.DATABASE_URL, poolSize = process.env.DB_POOL_SIZE || 10 }) {
  const kind = url ? 'postgres' : 'sqlite';
  const context = new AsyncLocalStorage();
  const max = Number(poolSize);
  if (!Number.isInteger(max) || max < 1 || max > 100) throw new Error('DB_POOL_SIZE doit être compris entre 1 et 100.');
  const connection = url ? new pg.Pool({ connectionString: url, max, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000 }) : new DatabaseSync(join(directory, 'santeproche.sqlite'));
  if (url) connection.on('error', () => console.error('Connexion PostgreSQL interrompue.'));
  else connection.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  let tail = Promise.resolve();
  const queued = async task => {
    const previous = tail;
    let release;
    tail = new Promise(resolve => { release = resolve; });
    await previous;
    try { return await task(); } finally { release(); }
  };
  const query = async (sql, params = [], operation = 'all') => {
    const execute = async () => {
      if (kind === 'sqlite') {
        if (operation === 'exec') return connection.exec(sql);
        return connection.prepare(sql)[operation](...params);
      }
      let index = 0;
      const result = await (context.getStore()?.client || connection).query(sql.replace(/\?/g, () => `$${++index}`), params);
      return operation === 'get' ? result.rows[0] : operation === 'run' ? { changes: result.rowCount } : result.rows;
    };
    return kind === 'sqlite' && !context.getStore() ? queued(execute) : execute();
  };
  const database = {
    kind,
    prepare: sql => ({ all: (...params) => query(sql, params), get: (...params) => query(sql, params, 'get'), run: (...params) => query(sql, params, 'run') }),
    exec: sql => query(sql, [], 'exec'),
    async transaction(task) {
      if (context.getStore()) throw new Error('Transaction imbriquée non autorisée.');
      const execute = async () => {
        const client = kind === 'postgres' ? await connection.connect() : null;
        return context.run({ client }, async () => {
          try {
            await database.exec('BEGIN');
            const result = await task();
            await database.exec('COMMIT');
            return result;
          } catch (error) { await database.exec('ROLLBACK'); throw error; }
          finally { client?.release(); }
        });
      };
      return kind === 'sqlite' ? queued(execute) : execute();
    },
    close: () => kind === 'postgres' ? connection.end() : queued(() => connection.close()),
  };
  try { await initializeSchema(database); } catch (error) { await database.close(); throw error; }
  return database;
}

async function initializeSchema(db) {
  await db.transaction(async () => {
    if (db.kind === 'postgres') await db.exec('SELECT pg_advisory_xact_lock(72431001)');
    await db.exec(`
      CREATE TABLE IF NOT EXISTS records (${db.kind === 'postgres' ? 'sequence BIGSERIAL UNIQUE,' : ''} kind TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY(kind,id));
      CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY CHECK(id=1), email TEXT NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, expires BIGINT NOT NULL);
      CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, kind TEXT NOT NULL, data TEXT NOT NULL, created TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions(expires);
      CREATE INDEX IF NOT EXISTS requests_created_idx ON requests(created);
    `);
    const columns = db.kind === 'sqlite' ? await db.prepare('PRAGMA table_info(admins)').all() : await db.prepare("SELECT column_name AS name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='admins'").all();
    for (const field of ['nom', 'telephone', 'image']) if (!columns.some(column => column.name === field)) await db.exec(`ALTER TABLE admins ADD COLUMN ${field} TEXT NOT NULL DEFAULT ''`);
    await db.prepare('INSERT INTO schema_migrations(version,applied) VALUES(?,?) ON CONFLICT(version) DO NOTHING').run(1, new Date().toISOString());
  });
}
