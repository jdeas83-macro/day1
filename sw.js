const CACHE_NAME = 'day1-v1';
const APP_FILES = ["./", "./settings.html", "./manifest.json", "./cardio.html", "./history.html", "./workouts.html", "./index.html", "./food-library.html", "./css/style.css", "./js/storage.js", "./js/foods.js", "./js/dashboard.js", "./js/history.js", "./js/training-store.js", "./js/workouts.js", "./js/cardio.js", "./js/app.js", "./js/settings.js", "./icons/apple-touch-icon.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/logo.svg"];
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('macrotrack-')||k.startsWith('day1-'))&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
