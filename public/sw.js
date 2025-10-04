// Service Worker for Push Notifications
const CACHE_NAME = 'ucare-health-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data || {};
  
  // Handle different actions
  if (event.action === 'taken' && data.type === 'medication') {
    // Send message to app to mark medication as taken
    event.waitUntil(
      clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'MEDICATION_TAKEN',
            medicationId: data.medicationId
          });
        });
      })
    );
  } else if (event.action === 'snooze' && data.type === 'medication') {
    // Schedule snooze notification
    setTimeout(() => {
      self.registration.showNotification('💊 Medication Reminder (Snoozed)', {
        body: `Time to take your medication`,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [
          { action: 'taken', title: 'Mark as Taken' },
          { action: 'snooze', title: 'Remind in 15 min' }
        ],
        data: data
      });
    }, 15 * 60 * 1000); // 15 minutes
  }
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // If app is already open, focus it
      for (let client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // If app is not open, open it
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Handle push events (for future server-sent notifications)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New health reminder',
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    tag: 'ucare-health'
  };
  
  event.waitUntil(
    self.registration.showNotification('Ucare Health', options)
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'health-data-sync') {
    event.waitUntil(syncHealthData());
  }
});

async function syncHealthData() {
  // Sync health data when back online
}
