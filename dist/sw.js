/**
 * Service Worker for Opus to MP3 PWA
 * - Offline support
 * - Asset caching
 * - Web Share Target handling
 */

const BASE_PATH = "/audio-converter";
const CACHE_NAME = "opus2mp3-v1";
const SHARED_FILES_CACHE = "shared-files";

/* Assets do próprio app (sempre no subpath) */
const STATIC_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/assets/styles/custom.css`,
  `${BASE_PATH}/assets/icons/icon-192.png`,
  `${BASE_PATH}/assets/icons/icon-512.png`,
];

/* Assets externos */
const EXTERNAL_ASSETS = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css",
];

/* FFmpeg.wasm */
const FFMPEG_ASSETS = [
  "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js",
  "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm",
];

/* =======================
   INSTALL
======================= */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn("Failed to cache static assets:", error);
      })
    )
  );

  self.skipWaiting();
});

/* =======================
   ACTIVATE
======================= */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (name) => name !== CACHE_NAME && name !== SHARED_FILES_CACHE
            )
            .map((name) => caches.delete(name))
        )
      )
  );

  self.clients.claim();
});

/* =======================
   FETCH
======================= */
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  /* ---- Share Target POST ---- */
  if (
    request.method === "POST" &&
    url.pathname === `${BASE_PATH}/` &&
    url.searchParams.has("share-target")
  ) {
    event.respondWith(handleShareTarget(event));
    return;
  }

  if (request.method !== "GET") return;

  /* ---- Assets externos ---- */
  if (
    EXTERNAL_ASSETS.some((asset) => request.url.startsWith(asset)) ||
    FFMPEG_ASSETS.some((asset) => request.url.startsWith(asset))
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  /* ---- Navegação e assets do app ---- */
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

/* =======================
   SHARE TARGET HANDLER
======================= */
async function handleShareTarget(event) {
  try {
    const formData = await event.request.formData();
    const audioFiles = formData.getAll("audio");

    if (audioFiles.length > 0) {
      const file = audioFiles[0];

      if (file instanceof File) {
        const cache = await caches.open(SHARED_FILES_CACHE);

        await cache.put(
          "shared-audio-file",
          new Response(file, {
            headers: {
              "Content-Type": file.type || "audio/opus",
              "X-File-Name": file.name,
            },
          })
        );
      }
    }

    /* Redirect SEMPRE dentro do scope */
    return Response.redirect(`${BASE_PATH}/?receiving-file-share=true`, 303);
  } catch (error) {
    console.error("Error handling share target:", error);
    return Response.redirect(`${BASE_PATH}/`, 303);
  }
}

/* =======================
   CACHE STRATEGIES
======================= */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;

    /* Fallback offline para SPA */
    if (request.destination === "document") {
      const indexCache = await caches.match(`${BASE_PATH}/index.html`);
      if (indexCache) return indexCache;
    }

    throw error;
  }
}
