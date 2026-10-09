
const CACHE="santeproche-_santeProche_-e70db9279ad703a3", PREFIX="santeproche-_santeProche_-", BASE="/santeProche/", FILES=["/santeProche/index.html","/santeProche/offline.html","/santeProche/manifest.webmanifest","/santeProche/favicon.svg","/santeProche/pwa/icon-192.png","/santeProche/pwa/icon-512.png","/santeProche/pwa/icon-maskable-512.png","/santeProche/pwa/apple-touch-icon.png","/santeProche/assets/index-BkLqAOxL.js","/santeProche/assets/index-D18Y6W6p.css","/santeProche/assets/pages-demo-UCvqzmN8.js"];
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
