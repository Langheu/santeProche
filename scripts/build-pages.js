import { build } from 'vite';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
process.env.VITE_GITHUB_PAGES = 'true';
const base = '/santeProche/';
await build({ base, build: { outDir: 'dist-pages' } });
function patch(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) patch(path);
    else if (/\.(js|html|css)$/.test(entry.name)) {
      const text = readFileSync(path, 'utf8').replace(/(["'])\/(img|media|assets\/images|favicon\.svg)(?=[/"'?])/g, `$1${base}$2`).replace(/url\((["']?)\/(img|media|assets\/images)\//g, `url($1${base}$2/`);
      writeFileSync(path, text);
    }
  }
}
patch('dist-pages');
writeFileSync('dist-pages/.nojekyll', '');
