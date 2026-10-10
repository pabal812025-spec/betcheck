const CACHE_NAME = "matchia-installable-v1";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon.svg", "../css/style.css"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => { if(e.request.method!=="GET" || new URL(e.request.url).origin!==self.location.origin) return; e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).catch(()=>caches.match("./index.html")))); });
