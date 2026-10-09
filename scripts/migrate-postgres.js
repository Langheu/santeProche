import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { openDatabase } from '../server/database.js';
import { migrateSQLite } from '../server/migration.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (existsSync(join(root, '.env'))) process.loadEnvFile(join(root, '.env'));
const directory = resolve(process.env.DATA_DIR || join(root, 'server/storage'));
const source = process.env.SQLITE_SOURCE || join(directory, 'santeproche.sqlite');
let target;
try {
  if (!process.env.DATABASE_URL) throw new Error('Configurez DATABASE_URL dans .env pour désigner une base PostgreSQL vide.');
  if (!existsSync(source)) throw new Error('Base SQLite source introuvable.');
  target = await openDatabase({ directory });
  const checkOnly = process.argv.includes('--check');
  const counts = await migrateSQLite(source, target, { checkOnly });
  console.log(JSON.stringify({ mode: checkOnly ? 'verification' : 'migration', counts, sourcePreserved: true, sessionsCopied: false }));
} catch (error) {
  // Database errors may contain connection details. Never log a connection URL.
  console.error(error.code ? `PostgreSQL : erreur ${error.code}. Vérifiez la connexion et les permissions.` : error.message);
  process.exitCode = 1;
} finally { await target?.close(); }
