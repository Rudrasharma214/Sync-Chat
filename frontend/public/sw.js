/* global clients */

self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Sync Chat", body: event.data.text() };
  }

  const senderName = typeof payload.sender === "string" ? payload.sender.trim() : "";
  const title = senderName || payload.title || "Sync Chat";
  const options = {
    body: payload.body || (senderName ? "Sent you a message" : "You have a new message."),
    icon: "/avatar.png",
    badge: "/avatar.png",
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/chat";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return null;
    })
  );
});
