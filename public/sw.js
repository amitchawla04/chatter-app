/**
 * Chatter service worker — push notifications + offline shell cache.
 *
 * Scope: minimal. We don't aggressively cache (Next.js handles that),
 * but we do register for push so we can notify users on:
 *  - New pass received
 *  - Whisper they vouched on hits a milestone
 *  - LIVE event begins on a topic they tuned in to
 *
 * NEVER notify on engagement metrics (echo counts on others' whispers,
 * follower count, "trending" — per Pact 14, no performance pressure pushed).
 */

const CACHE_NAME = "chatter-v1";
const ESSENTIAL = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ESSENTIAL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "chatter.", body: event.data.text() };
  }

  const {
    title = "chatter.",
    body = "",
    url = "/home",
    tag,
    icon = "/apple-icon",
    badge = "/icon",
  } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag, // Coalesces multiple notifications of same kind
      data: { url },
      requireInteraction: false,
      silent: false,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/home";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.endsWith(url) && "focus" in client) return client.focus();
      }
      // Otherwise open new
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    }),
  );
});

// Pass-through for any fetch — let the network handle it.
// We don't intercept Next.js routes (it handles its own caching strategy).
self.addEventListener("fetch", (event) => {
  // No-op pass-through. Future: cache static assets only.
  // Avoiding aggressive caching since we want fresh whisper data.
});
