self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/api/logo",
      badge: data.badge || "/api/logo",
      vibrate: [100, 50, 100],
      data: { url: data.url || "/" },
      requireInteraction: true,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  } catch {
    // ignore malformed payloads
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        const existing = windowClients.find((c) => c.url.includes(url) && "focus" in c);
        if (existing) return existing.focus();
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});
