import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { openDatabase } from './database.js';
import { migrateSQLite } from './migration.js';

test('SQLite : annulation et isolation des transactions simultanées', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'santeproche-db-test-'));
  const db = await openDatabase({ directory, url: '' });
  try {
    let entered, release;
    const inside = new Promise(resolve => { entered = resolve; });
    const pause = new Promise(resolve => { release = resolve; });
    const rollback = db.transaction(async () => {
      await db.prepare('INSERT INTO settings(key,value) VALUES(?,?)').run('temporary', 'value');
      entered(); await pause; throw new Error('cancel');
    });
    const rejected = assert.rejects(rollback, /cancel/);
    await inside;
    const outside = db.prepare('INSERT INTO settings(key,value) VALUES(?,?)').run('retained', 'value');
    release(); await rejected; await outside;
    assert.equal(await db.prepare('SELECT * FROM settings WHERE key=?').get('temporary'), undefined);
    assert.equal((await db.prepare('SELECT * FROM settings WHERE key=?').get('retained')).value, 'value');
  } finally { await db.close(); rmSync(directory, { recursive: true, force: true }); }
});

test('PostgreSQL : migration fidèle, refus d’écrasement et transactions indépendantes', { skip: !process.env.TEST_DATABASE_URL }, async () => {
  const url = new URL(process.env.TEST_DATABASE_URL);
  assert.match(url.pathname, /^\/santeproche_test_[a-z0-9_]+$/);
  const schema = `migration_${randomUUID().replaceAll('-', '')}`;
  const client = new pg.Client({ connectionString: url.href });
  await client.connect(); await client.query(`CREATE SCHEMA ${schema}`);
  url.searchParams.set('options', `-c search_path=${schema}`);
  const directory = mkdtempSync(join(tmpdir(), 'santeproche-migrate-test-'));
  let source, target;
  try {
    source = await openDatabase({ directory, url: '' });
    await source.prepare('INSERT INTO records(kind,id,data) VALUES(?,?,?)').run('pharmacies', 'kept-id', JSON.stringify({ id: 'kept-id', nom: 'Pharmacie à conserver' }));
    await source.prepare('INSERT INTO admins(id,email,salt,hash,nom) VALUES(1,?,?,?,?)').run('test@example.test', 'salt', 'original-hash', 'Administrateur');
    await source.prepare('INSERT INTO sessions(token,expires) VALUES(?,?)').run('old-session', Date.now() + 60000);
    await source.prepare('INSERT INTO requests(id,kind,data,created) VALUES(?,?,?,?)').run('request-id', 'prescription', JSON.stringify({ filename: 'private.png' }), new Date().toISOString());
    await source.prepare('INSERT INTO partners(id,email,responsable,salt,hash,status,profile,document,pharmacy_id,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run('partner-id', 'pharmacy@example.test', 'Responsable', 'salt', 'partner-hash', 'approved', JSON.stringify({ nom: 'Pharmacie à conserver' }), 'private-document.png', 'kept-id', '2026-01-01', '2026-01-01');
    target = await openDatabase({ directory, url: url.href });
    assert.equal((await migrateSQLite(join(directory, 'santeproche.sqlite'), target, { checkOnly: true })).records, 1);
    assert.equal((await target.prepare('SELECT COUNT(*) AS count FROM records').get()).count, '0');
    await migrateSQLite(join(directory, 'santeproche.sqlite'), target);
    assert.equal((await target.prepare('SELECT hash FROM admins').get()).hash, 'original-hash');
    assert.equal((await target.prepare('SELECT id FROM records').get()).id, 'kept-id');
    assert.equal((await target.prepare('SELECT hash FROM partners').get()).hash, 'partner-hash');
    assert.equal((await target.prepare('SELECT pharmacy_id FROM partners').get()).pharmacy_id, 'kept-id');
    assert.equal((await target.prepare('SELECT COUNT(*) AS count FROM sessions').get()).count, '0');
    await assert.rejects(migrateSQLite(join(directory, 'santeproche.sqlite'), target), /doit être vide/);
    assert.equal((await source.prepare('SELECT COUNT(*) AS count FROM records').get()).count, 1);
    let entered, release;
    const inside = new Promise(resolve => { entered = resolve; });
    const pause = new Promise(resolve => { release = resolve; });
    const first = target.transaction(async () => { await target.prepare('INSERT INTO settings(key,value) VALUES(?,?)').run('cancelled', 'value'); entered(); await pause; throw new Error('cancel'); });
    const rejected = assert.rejects(first, /cancel/);
    await inside;
    await target.transaction(async () => { await target.prepare('INSERT INTO settings(key,value) VALUES(?,?)').run('committed', 'value'); });
    release(); await rejected;
    assert.equal(await target.prepare('SELECT * FROM settings WHERE key=?').get('cancelled'), undefined);
    assert.equal((await target.prepare('SELECT * FROM settings WHERE key=?').get('committed')).value, 'value');
  } finally {
    await source?.close(); await target?.close();
    await client.query(`DROP SCHEMA ${schema} CASCADE`); await client.end();
    rmSync(directory, { recursive: true, force: true });
  }
});
