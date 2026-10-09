import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:net';
import pg from 'pg';
import { runPostgres, ensureLocalPostgres } from '../server/local-postgres.js';
import { openDatabase } from '../server/database.js';
import { migrateSQLite } from '../server/migration.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envFile = join(root, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);
const directory = resolve(process.env.DATA_DIR || join(root, 'server/storage'));
const cluster = join(directory, 'postgres');
const configFile = join(directory, 'local-postgres.json');
let target;
try {
  if (process.env.DATABASE_URL && process.env.LOCAL_POSTGRES !== 'true') throw new Error('Une connexion PostgreSQL est déjà configurée. Utilisez npm run db:migrate pour cette destination.');
  if (existsSync(configFile)) {
    await ensureLocalPostgres(directory);
    console.log('La base PostgreSQL locale est déjà configurée.');
  } else {
    // Stop the backend before importing so no SQLite writes can be missed.
    const probe = createServer();
    await new Promise((done, reject) => { probe.once('error', reject); probe.listen(Number(process.env.PORT || 3001), '127.0.0.1', done); });
    await new Promise(done => probe.close(done));
    const socket = createServer(); await new Promise(done => socket.listen(0, '127.0.0.1', done));
    const port = socket.address().port; await new Promise(done => socket.close(done));
    mkdirSync(directory, { recursive: true });
    if (existsSync(cluster)) throw new Error('Un dossier PostgreSQL existe déjà sans configuration. Vérifiez-le avant de recommencer.');
    const password = randomBytes(32).toString('hex');
    const pwFile = join(directory, 'postgres-password.tmp');
    writeFileSync(pwFile, password, { mode: 0o600, flag: 'wx' });
    try { await runPostgres('initdb', ['-D', cluster, '-A', 'scram-sha-256', '-U', 'santeproche', '--pwfile', pwFile, '--encoding=UTF8', '--locale=C']); }
    finally { unlinkSync(pwFile); }
    await runPostgres('pg_ctl', ['-D', cluster, '-l', join(directory, 'postgres.log'), '-o', `-h 127.0.0.1 -p ${port}`, '-w', '-t', '30', 'start']);
    const url = `postgresql://santeproche:${password}@127.0.0.1:${port}/santeproche`;
    const admin = new pg.Client({ connectionString: url.replace(/\/santeproche$/, '/postgres') });
    await admin.connect();
    try { await admin.query('CREATE DATABASE santeproche'); } finally { await admin.end(); }
    target = await openDatabase({ directory, url });
    const source = join(directory, 'santeproche.sqlite');
    const counts = existsSync(source) ? await migrateSQLite(source, target) : {};
    await target.close(); target = null;
    let contents = existsSync(envFile) ? readFileSync(envFile, 'utf8') : '';
    for (const [name, value] of Object.entries({ DATABASE_URL: url, LOCAL_POSTGRES: 'true' })) {
      const pattern = new RegExp(`^${name}=.*$`, 'm');
      contents = pattern.test(contents) ? contents.replace(pattern, `${name}=${value}`) : `${contents.trimEnd()}\n${name}=${value}\n`;
    }
    writeFileSync(envFile, contents, { mode: 0o600 });
    writeFileSync(configFile, JSON.stringify({ port, database: 'santeproche' }), { mode: 0o600 });
    console.log(JSON.stringify({ configured: 'postgres', counts, sqlitePreserved: true, filesPreserved: true }));
  }
} catch (error) {
  console.error(error.code === 'EADDRINUSE' ? 'Arrêtez le backend avant de migrer (port occupé).' : error.code ? `Configuration PostgreSQL : erreur ${error.code}.` : error.message);
  process.exitCode = 1;
} finally { await target?.close(); }
