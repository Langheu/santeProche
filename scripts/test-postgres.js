import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, realpathSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { createServer } from 'node:net';
import pg from 'pg';

// Start a disposable cluster, never connect to the developer's existing service.
const directory = mkdtempSync(join(tmpdir(), 'santeproche-pg-test-'));
const binaries = process.env.PG_BIN || (process.platform === 'win32' ? 'C:/Program Files/PostgreSQL/18/bin' : '');
const executable = name => binaries ? join(binaries, `${name}${process.platform === 'win32' ? '.exe' : ''}`) : name;
const run = (file, args, env = process.env, display = false) => new Promise((done, reject) => {
  const child = spawn(file, args, { env, windowsHide: true, stdio: display ? 'inherit' : 'pipe' });
  let output = '';
  child.stdout?.on('data', data => { output += data; }); child.stderr?.on('data', data => { output += data; });
  child.on('error', reject); child.on('exit', code => code === 0 ? done() : reject(new Error(`${file} : ${output || `code ${code}`}`)));
});
let started = false;
try {
  await run(executable('initdb'), ['-D', directory, '-A', 'trust', '-U', 'test_admin', '--encoding=UTF8', '--locale=C']);
  const socket = createServer(); await new Promise(done => socket.listen(0, '127.0.0.1', done));
  const port = socket.address().port; await new Promise(done => socket.close(done));
  await run(executable('pg_ctl'), ['-D', directory, '-l', join(directory, 'postgres.log'), '-o', `-h 127.0.0.1 -p ${port}`, '-w', '-t', '30', 'start']); started = true;
  const client = new pg.Client({ connectionString: `postgresql://test_admin@127.0.0.1:${port}/postgres` });
  await client.connect();
  const name = `santeproche_test_${Date.now()}`;
  try { await client.query(`CREATE DATABASE ${name}`); } finally { await client.end(); }
  await run(process.execPath, ['--test', 'server/backend.test.js', 'server/database.test.js', 'server/partners.test.js'], { ...process.env, TEST_DATABASE_URL: `postgresql://test_admin@127.0.0.1:${port}/${name}` }, true);
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally {
  if (started) await run(executable('pg_ctl'), ['-D', directory, '-m', 'fast', '-w', 'stop']);
  // Verify the absolute temporary target before recursive cleanup on Windows.
  if (existsSync(directory)) {
    const target = realpathSync(directory), parent = realpathSync(tmpdir());
    if (!target.startsWith(parent + sep) || !resolve(directory).includes('santeproche-pg-test-')) throw new Error('Chemin de nettoyage invalide.');
    rmSync(target, { recursive: true, force: true });
  }
}
