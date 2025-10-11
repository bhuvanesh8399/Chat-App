// Firebase SW – optional basic handler
self.addEventListener('push', function (event) {
  try {
    const data = event.data?.json() || {};
    const title = data?.notification?.title || 'New message';
    const body = data?.notification?.body || '';
    const icon = data?.notification?.icon || '/favicon.ico';

    event.waitUntil(
      self.registration.showNotification(title, { body, icon })
    );
  } catch (e) {
    // ignore
  }
});
