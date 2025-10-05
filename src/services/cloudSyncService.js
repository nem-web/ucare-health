import { config } from '../config/env';

class CloudSyncService {
  constructor() {
    this.currentUser = null;
    this.apiUrl = config.api.baseUrl || 'http://localhost:5000';
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  // Save data to cloud
  async saveToCloud(data) {
    if (!this.currentUser || !this.currentUser.uid) {
      console.log('No valid user, cannot save to cloud');
      return { success: false, error: 'No user logged in' };
    }

    try {
      const userId = this.currentUser.uid;
      console.log('Saving data for user ID:', userId);
      
      const response = await fetch(`${this.apiUrl}/api/health/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to save to cloud:', error);
      return { success: false, error: error.message };
    }
  }

  // Load data from cloud
  async loadFromCloud() {
    if (!this.currentUser || !this.currentUser.uid) {
      console.log('No valid user, returning default data');
      return this.getDefaultData();
    }

    try {
      const userId = this.currentUser.uid;
      console.log('Loading data for user ID:', userId);
      
      const response = await fetch(`${this.apiUrl}/api/health/${userId}`);
      
      if (response.status === 404) {
        // No data found, return defaults
        return this.getDefaultData();
      }
      
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }

      const cloudData = await response.json();
      
      // Transform data
      return {
        profile: cloudData.profile || {},
        medications: cloudData.medications || [],
        symptoms: cloudData.symptoms || [],
        appointments: cloudData.appointments || [],
        prescriptions: cloudData.prescriptions || [],
        cycleData: cloudData.cycleData || {},
        metrics: cloudData.metrics || { logs: [], averages: { sleep: 0, nutrition: 0, exercise: 0 } },
        waterSettings: cloudData.waterSettings || { enabled: true, dailyGoal: 8, reminderInterval: 2 },
        phi: cloudData.phi || { 
          current: 78, 
          trend: [72, 74, 76, 75, 77, 79, 78], 
          categories: { physical: 82, mental: 75, sleep: 80, nutrition: 74 } 
        },
        waterLog: cloudData.waterLog || {}
      };
    } catch (error) {
      console.error('Failed to load from cloud:', error);
      return this.getDefaultData();
    }
  }

  // Default data
  getDefaultData() {
    return {
      profile: {},
      medications: [],
      symptoms: [],
      appointments: [],
      prescriptions: [],
      cycleData: {},
      metrics: { 
        logs: [], 
        averages: { sleep: 0, nutrition: 0, exercise: 0 } 
      },
      waterSettings: {
        enabled: true,
        dailyGoal: 8,
        reminderInterval: 2,
        startTime: '08:00',
        endTime: '22:00'
      },
      phi: { 
        current: 78, 
        trend: [72, 74, 76, 75, 77, 79, 78], 
        categories: { physical: 82, mental: 75, sleep: 80, nutrition: 74 } 
      },
      waterLog: {}
    };
  }
}

export const cloudSyncService = new CloudSyncService();
