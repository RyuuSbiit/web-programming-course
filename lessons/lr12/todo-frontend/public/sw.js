"use strict";
(() => {
  // src/sw.ts
  var sw = self;
  var CACHE_NAME = "todo-pwa-v1";
  var APP_SHELL = [
    "/",
    "/index.html",
    "/offline.html",
    "/manifest.webmanifest",
    "/icons/icon-192.svg",
    "/icons/icon-512.svg"
  ];
  sw.addEventListener("install", (event) => {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(APP_SHELL);
        await sw.skipWaiting();
      })()
    );
  });
  sw.addEventListener("activate", (event) => {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
        await sw.clients.claim();
      })()
    );
  });
  sw.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
      return;
    }
    const url = new URL(event.request.url);
    if (url.origin !== sw.location.origin) {
      return;
    }
    if (event.request.mode === "navigate") {
      event.respondWith(
        (async () => {
          try {
            const response = await fetch(event.request);
            const cache = await caches.open(CACHE_NAME);
            await cache.put("/index.html", response.clone());
            return response;
          } catch {
            const cache = await caches.open(CACHE_NAME);
            return await cache.match("/index.html") ?? await cache.match("/offline.html") ?? new Response("Offline", { status: 503 });
          }
        })()
      );
      return;
    }
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(event.request);
        try {
          const fresh = await fetch(event.request);
          if (fresh.ok && (url.pathname.startsWith("/assets/") || APP_SHELL.includes(url.pathname))) {
            await cache.put(event.request, fresh.clone());
          }
          return fresh;
        } catch {
          return cached ?? new Response("Offline", { status: 503 });
        }
      })()
    );
  });
})();
