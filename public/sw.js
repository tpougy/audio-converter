/**
 * Service Worker for Opus to MP3 PWA
 * Handles caching, offline support, and Web Share Target
 */

const CACHE_NAME = 'opus2mp3-v1';
const SHARED_FILES_CACHE = 'shared-files';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/styles/custom.css',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
];

const EXTERNAL_ASSETS = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css',
];

const FFMPEG_ASSETS = [
  'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
  'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn('Failed to cache some static assets:', error);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== SHARED_FILES_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method === 'POST' && url.searchParams.has('share-target')) {
    event.respondWith(handleShareTarget(event.request));
    return;
  }

  if (event.request.method !== 'GET') {
    return;
  }

  const isExternal = EXTERNAL_ASSETS.some((asset) =>
    event.request.url.startsWith(asset.split('?')[0])
  );

  const isFFmpeg = FFMPEG_ASSETS.some((asset) =>
    event.request.url.startsWith(asset.split('?')[0])
  );

  if (isExternal || isFFmpeg) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(networkFirst(event.request));
});

async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const audioFiles = formData.getAll('audio');

    if (audioFiles.length > 0) {
      const file = audioFiles[0];

      if (file instanceof File) {
        const cache = await caches.open(SHARED_FILES_CACHE);

        const response = new Response(file, {
          headers: {
            'Content-Type': file.type || 'audio/opus',
            'X-File-Name': file.name,
          },
        });

        await cache.put('shared-audio-file', response);
      }
    }

    return Response.redirect('/?receiving-file-share=true', 303);
  } catch (error) {
    console.error('Error handling share target:', error);
    return Response.redirect('/', 303);
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache first fetch failed:', error);
    throw error;
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    if (request.destination === 'document') {
      const indexCache = await caches.match('/index.html');
      if (indexCache) {
        return indexCache;
      }
    }

    throw error;
  }
}
