import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

export const postgresBinary = name => {
  const directory = process.env.PG_BIN || (process.platform === 'win32' ? 'C:/Program Files/PostgreSQL/18/bin' : '');
  return directory ? join(directory, `${name}${process.platform === 'win32' ? '.exe' : ''}`) : name;
};
export const runPostgres = (name, args) => new Promise((resolve, reject) => {
  const child = spawn(postgresBinary(name), args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', data => { output += data; }); child.stderr.on('data', data => { output += data; });
  child.on('error', reject);
  child.on('exit', code => {
    child.stdout.destroy(); child.stderr.destroy(); child.unref();
    if (code === 0) resolve(); else reject(new Error(`${name} : ${output}`));
  });
});

export async function ensureLocalPostgres(directory) {
  if (process.env.LOCAL_POSTGRES !== 'true') return;
  const cluster = join(directory, 'postgres');
  const configFile = join(directory, 'local-postgres.json');
  if (!existsSync(configFile)) throw new Error('PostgreSQL local non préparé. Lancez npm run db:local.');
  const { port } = JSON.parse(readFileSync(configFile, 'utf8'));
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Port PostgreSQL local invalide.');
  let running = false;
  try { await runPostgres('pg_ctl', ['-D', cluster, 'status']); running = true; } catch { /* The dedicated cluster is stopped. */ }
  // Crash recovery can take several minutes on a slow disk. A running process
  // does not mean PostgreSQL is ready to accept connections yet.
  if (!running) await runPostgres('pg_ctl', ['-D', cluster, '-l', join(directory, 'postgres.log'), '-o', `-h 127.0.0.1 -p ${port}`, '-w', '-t', '300', 'start']);
  const deadline = Date.now() + 300000;
  while (Date.now() < deadline) {
    try { await runPostgres('pg_isready', ['-h', '127.0.0.1', '-p', String(port), '-t', '2']); return; } catch { /* Recovery is still in progress. */ }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('PostgreSQL local ne répond pas encore. Vérifiez server/storage/postgres.log puis relancez le serveur.');
}
