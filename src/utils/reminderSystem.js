import { format, isAfter, isBefore, addMinutes, subHours, parseISO, isToday } from 'date-fns';
import { pushNotificationService } from '../services/pushNotificationService';

export class SmartReminderSystem {
  constructor() {
    this.reminders = [];
    this.callbacks = [];
    this.notificationPermission = false;
    this.pushService = pushNotificationService;
  }

  async initialize() {
    // Initialize push notifications
    const pushEnabled = await this.pushService.initialize();
    this.notificationPermission = pushEnabled;
    
    // Listen for messages from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'MEDICATION_TAKEN') {
          this.callbacks.forEach(callback => 
            callback({ 
              type: 'medication_taken', 
              medicationId: event.data.medicationId 
            })
          );
        }
      });
    }
    
    return pushEnabled;
  }

  addReminder(reminder) {
    this.reminders.push({
      ...reminder,
      id: Date.now() + Math.random(),
      created: new Date(),
      active: true
    });
  }

  async triggerReminder(reminder) {
    // Send push notification
    if (this.notificationPermission) {
      let title, body, actions = [];
      
      switch (reminder.type) {
        case 'medication':
          title = '💊 Medication Reminder';
          body = `Time to take ${reminder.medicationName || 'your medication'}`;
          actions = [
            { action: 'taken', title: 'Mark as Taken' },
            { action: 'snooze', title: 'Remind in 15 min' }
          ];
          break;
        case 'appointment':
          title = '📅 Appointment Reminder';
          body = `${reminder.appointmentType || 'Appointment'} with ${reminder.doctor} in 3 hours`;
          actions = [
            { action: 'view', title: 'View Details' },
            { action: 'dismiss', title: 'Dismiss' }
          ];
          break;
        default:
          title = '🏥 Health Reminder';
          body = reminder.message || 'Health reminder';
      }

      await this.pushService.sendNotification(title, {
        body,
        actions,
        data: { 
          type: reminder.type, 
          medicationId: reminder.medicationId,
          appointmentId: reminder.appointmentId
        },
        tag: `ucare-${reminder.type}-${reminder.id}`,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200]
      });
    }

    // Also trigger in-app callbacks
    this.callbacks.forEach(callback => callback(reminder));
  }

  checkReminders() {
    const now = new Date();
    const activeReminders = [];

    this.reminders.forEach(reminder => {
      if (!reminder.active) return;

      if (reminder.type === 'medication') {
        const medicationTime = this.getMedicationReminderTime(reminder);
        if (this.isTimeForReminder(now, medicationTime)) {
          activeReminders.push(reminder);
        }
      } else if (reminder.type === 'appointment') {
        const appointmentTime = this.getAppointmentReminderTime(reminder);
        if (this.isTimeForReminder(now, appointmentTime)) {
          activeReminders.push(reminder);
        }
      }
    });

    activeReminders.forEach(reminder => {
      this.triggerReminder(reminder);
      reminder.active = false;
    });

    return activeReminders;
  }

  getMedicationReminderTime(reminder) {
    const today = format(new Date(), 'yyyy-MM-dd');
    return new Date(`${today} ${reminder.time}`);
  }

  getAppointmentReminderTime(reminder) {
    const appointmentDateTime = new Date(`${reminder.date} ${reminder.time}`);
    return subHours(appointmentDateTime, 3);
  }

  isTimeForReminder(now, reminderTime) {
    const reminderWindow = addMinutes(reminderTime, 5);
    return isAfter(now, reminderTime) && isBefore(now, reminderWindow);
  }

  onReminder(callback) {
    this.callbacks.push(callback);
  }

  async startMonitoring() {
    await this.initialize();
    
    // Check every minute
    setInterval(() => {
      this.checkReminders();
    }, 60000);

    this.checkReminders();
  }

  // Schedule medication with push notification
  async scheduleDailyMedications(medications) {
    for (const med of medications) {
      if (!med.taken) {
        // Add to internal reminders
        this.addReminder({
          type: 'medication',
          title: `Take ${med.name}`,
          time: med.time,
          medicationId: med.id,
          medicationName: med.name,
          dosage: med.dosage,
          recurring: 'daily'
        });

        // Schedule push notification
        await this.pushService.scheduleMedicationNotification(med);
      }
    }
  }

  // Schedule appointment with push notification
  async scheduleAppointmentReminders(appointments) {
    for (const apt of appointments) {
      this.addReminder({
        type: 'appointment',
        title: `Appointment with ${apt.doctor}`,
        date: apt.date,
        time: apt.time,
        appointmentId: apt.id,
        doctor: apt.doctor,
        appointmentType: apt.type
      });

      // Schedule push notification
      await this.pushService.scheduleAppointmentNotification(apt);
    }
  }

  // Test notification
  async testNotification() {
    if (this.notificationPermission) {
      await this.pushService.sendNotification('🧪 Test Notification', {
        body: 'Push notifications are working correctly!',
        actions: [
          { action: 'ok', title: 'OK' }
        ]
      });
    }
  }
}

export const reminderSystem = new SmartReminderSystem();
