import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export function buildPwa(directory, base = '/') {
  const manifest = { id: base, name: 'SantéProche', short_name: 'SantéProche', lang: 'fr', description: 'Trouvez un médicament, une pharmacie ou une clinique près de vous.', start_url: base, scope: base, display: 'standalone', background_color: '#ffffff', theme_color: '#008000', icons: [
    { src: `${base}pwa/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: `${base}pwa/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: `${base}pwa/icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ] };
  writeFileSync(join(directory, 'manifest.webmanifest'), JSON.stringify(manifest));
  const files = ['index.html', 'offline.html', 'manifest.webmanifest', 'favicon.svg', 'pwa/icon-192.png', 'pwa/icon-512.png', 'pwa/icon-maskable-512.png', 'pwa/apple-touch-icon.png', ...readdirSync(join(directory, 'assets')).filter(name => /\.(js|css)$/.test(name)).map(name => `assets/${name}`)];
  const hash = createHash('sha256'); files.forEach(file => hash.update(readFileSync(join(directory, file))));
  const prefix = `santeproche-${base.replace(/\W/g, '_')}-`, cache = prefix + hash.digest('hex').slice(0, 16);
  writeFileSync(join(directory, 'sw.js'), `
const CACHE=${JSON.stringify(cache)}, PREFIX=${JSON.stringify(prefix)}, BASE=${JSON.stringify(base)}, FILES=${JSON.stringify(files.map(file => base + file))};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES))));
self.addEventListener('activate', event => event.waitUntil((async()=>{
  for(const name of await caches.keys()) if(name.startsWith(PREFIX) && name!==CACHE) await caches.delete(name);
  await self.clients.claim();
})()));
self.addEventListener('message', event => { if(event.data?.type==='SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const url=new URL(event.request.url);
  if(event.request.method!=='GET' || url.origin!==self.location.origin || !url.pathname.startsWith(BASE) || url.pathname.startsWith(BASE+'api/')) return;
  if(event.request.mode==='navigate') event.respondWith((async()=>{
    try { return await fetch(event.request); }
    catch { const cache=await caches.open(CACHE); return await cache.match(BASE+(url.pathname.startsWith(BASE+'admin') ? 'offline.html' : 'index.html')); }
  })());
  else if(FILES.includes(url.pathname)) event.respondWith(caches.open(CACHE).then(async cache => await cache.match(url.pathname) || fetch(event.request)));
});
`);
}
