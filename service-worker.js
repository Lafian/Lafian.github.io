console.debug("[ServiceWorker] Initializing");

let config = {};

self.addEventListener('install', function (e) {
    console.debug('[ServiceWorker] Installing offline worker');
    e.waitUntil(
        fetch("./package_cf0430897bb54ae616b9dd72823fa1c3daf1549c/uno-config.js")
            .then(r => r.text()
                .then(configStr => {
                    eval(configStr);
                    caches.open('package_cf0430897bb54ae616b9dd72823fa1c3daf1549c').then(function (cache) {
                        console.debug('[ServiceWorker] Caching app binaries and content');
                        return cache.addAll(config.offline_files);
                    });
                }
                )
            )
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    event.respondWith(async function () {
        try {
            // Network first mode to get fresh content every time, then fallback to
            // cache content if needed.
            return await fetch(event.request);
        } catch (err) {
            return caches.match(event.request).then(response => {
                return response || fetch(event.request);
            });
        }
    }());
});


// managed