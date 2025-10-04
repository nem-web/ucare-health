export class PushNotificationService {
  constructor() {
    this.registration = null;
    this.permission = 'default';
  }

  async initialize() {
    // Check if service worker and notifications are supported
    if ('serviceWorker' in navigator && 'Notification' in window) {
      try {
        // Register service worker
        this.registration = await navigator.serviceWorker.register('/sw.js');

        // Request notification permission
        this.permission = await Notification.requestPermission();
        
        return this.permission === 'granted';
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  async sendNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    const defaultOptions = {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      tag: 'ucare-health',
      ...options
    };

    try {
      // Try service worker notification first (works when app is closed)
      if (this.registration && this.registration.showNotification) {
        await this.registration.showNotification(title, defaultOptions);
      } else {
        // Fallback to regular notification
        new Notification(title, defaultOptions);
      }
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  async scheduleMedicationNotification(medication) {
    const now = new Date();
    const [hours, minutes] = medication.time.split(':');
    const medicationTime = new Date();
    medicationTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // If time has passed today, schedule for tomorrow
    if (medicationTime <= now) {
      medicationTime.setDate(medicationTime.getDate() + 1);
    }

    const delay = medicationTime.getTime() - now.getTime();

    setTimeout(() => {
      this.sendNotification(`💊 Medication Reminder`, {
        body: `Time to take ${medication.name} (${medication.dosage})`,
        actions: [
          { action: 'taken', title: 'Mark as Taken' },
          { action: 'snooze', title: 'Remind in 15 min' }
        ],
        data: { type: 'medication', medicationId: medication.id }
      });
    }, delay);

    return medicationTime;
  }

  async scheduleAppointmentNotification(appointment) {
    const appointmentTime = new Date(`${appointment.date} ${appointment.time}`);
    const reminderTime = new Date(appointmentTime.getTime() - (3 * 60 * 60 * 1000)); // 3 hours before
    const now = new Date();

    if (reminderTime > now) {
      const delay = reminderTime.getTime() - now.getTime();

      setTimeout(() => {
        this.sendNotification(`📅 Appointment Reminder`, {
          body: `${appointment.type} with ${appointment.doctor} in 3 hours`,
          actions: [
            { action: 'view', title: 'View Details' },
            { action: 'dismiss', title: 'Dismiss' }
          ],
          data: { type: 'appointment', appointmentId: appointment.id }
        });
      }, delay);

      return reminderTime;
    }
    return null;
  }

  // Handle notification clicks
  handleNotificationClick(event) {
    event.notification.close();
    
    const data = event.notification.data;
    
    if (data.type === 'medication' && event.action === 'taken') {
      // Mark medication as taken
      window.postMessage({ 
        type: 'MEDICATION_TAKEN', 
        medicationId: data.medicationId 
      });
    } else if (data.type === 'medication' && event.action === 'snooze') {
      // Snooze for 15 minutes
      setTimeout(() => {
        this.sendNotification(`💊 Medication Reminder (Snoozed)`, {
          body: event.notification.body,
          data: data
        });
      }, 15 * 60 * 1000);
    }

    // Focus the app window
    if (clients && clients.openWindow) {
      clients.openWindow('/');
    }
  }
}

export const pushNotificationService = new PushNotificationService();
