export class PushNotificationService {
  constructor() {
    this.registration = null;
    this.permission = 'default';
    this.waterReminderTimeouts = [];
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
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      silent: false, // Enable sound
      tag: 'ucare-health',
      ...options
    };

    try {
      // Play notification sound
      this.playNotificationSound();

      // Try service worker notification first (works when app is closed)
      if (this.registration && this.registration.showNotification) {
        await this.registration.showNotification(title, defaultOptions);
      } else {
        // Fallback to regular notification
        const notification = new Notification(title, defaultOptions);
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  playNotificationSound() {
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }

  async scheduleWaterReminders(waterSettings) {
    if (!waterSettings || !waterSettings.enabled) return;

    const { reminderInterval = 2, startTime = '08:00', endTime = '22:00', dailyGoal = 8 } = waterSettings;
    
    // Clear existing water reminders
    this.clearWaterReminders();

    const now = new Date();
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const start = new Date();
    start.setHours(startHour, startMin, 0, 0);
    const end = new Date();
    end.setHours(endHour, endMin, 0, 0);

    // If start time has passed today, start from next reminder
    if (start <= now) {
      const intervalMs = reminderInterval * 60 * 60 * 1000;
      const nextReminder = new Date(Math.ceil(now.getTime() / intervalMs) * intervalMs);
      if (nextReminder.getHours() >= startHour && nextReminder.getHours() <= endHour) {
        start.setTime(nextReminder.getTime());
      }
    }

    // Schedule reminders every interval hours
    const intervalMs = reminderInterval * 60 * 60 * 1000;
    let currentTime = new Date(start);

    while (currentTime <= end) {
      const timeUntilReminder = currentTime.getTime() - Date.now();
      
      if (timeUntilReminder > 0) {
        const timeoutId = setTimeout(() => {
          this.sendNotification(
            '💧 Water Reminder',
            {
              body: `Time to drink water! Goal: ${dailyGoal} glasses per day`,
              tag: 'water-reminder',
              icon: '/icon.svg',
              requireInteraction: true
            }
          );
        }, timeUntilReminder);

        this.waterReminderTimeouts.push(timeoutId);
      }

      currentTime = new Date(currentTime.getTime() + intervalMs);
    }
  }

  clearWaterReminders() {
    if (this.waterReminderTimeouts) {
      this.waterReminderTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    }
    this.waterReminderTimeouts = [];
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
