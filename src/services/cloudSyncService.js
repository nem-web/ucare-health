import { config } from '../config/env';

class CloudSyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.currentUser = null;
    this.apiUrl = config.api.baseUrl || 'http://localhost:5000';
    this.offlineMode = false;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  // Sync all user data to cloud via backend API
  async syncToCloud(data) {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    // If offline or backend unavailable, store locally
    if (!this.isOnline || this.offlineMode) {
      localStorage.setItem('health_data', JSON.stringify(data));
      this.addToSyncQueue('syncAll', data);
      return { success: true, offline: true };
    }

    try {
      const userId = this.currentUser.uid;
      
      // Ensure user exists in database first
      await this.ensureUserExists();
      
      console.log('Syncing health data for user:', userId);
      console.log('Data being synced:', data);
      
      const response = await fetch(`${this.apiUrl}/api/health/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const result = await response.json();
      localStorage.setItem('health_data', JSON.stringify(data));
      localStorage.setItem('last_sync_time', new Date().toISOString());
      
      console.log('Data synced successfully to MongoDB');
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Cloud sync failed, switching to offline mode:', error);
      this.offlineMode = true;
      localStorage.setItem('health_data', JSON.stringify(data));
      this.addToSyncQueue('syncAll', data);
      return { success: true, offline: true };
    }
  }

  // Ensure user exists in database
  async ensureUserExists() {
    if (!this.currentUser) return;

    try {
      const response = await fetch(`${this.apiUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.currentUser.uid,
          email: this.currentUser.email,
          displayName: this.currentUser.displayName,
          lastLogin: new Date().toISOString()
        })
      });

      if (!response.ok) {
        console.warn('Failed to ensure user exists:', response.statusText);
      }
    } catch (error) {
      console.warn('Failed to ensure user exists:', error);
    }
  }

  // Load all user data from cloud via backend API
  async loadFromCloud() {
    if (!this.currentUser) {
      return this.getDefaultData();
    }

    // Try local data first
    const localData = this.getLocalData();
    
    if (!this.isOnline || this.offlineMode) {
      return localData;
    }

    try {
      const userId = this.currentUser.uid;
      
      // Ensure user exists in database
      await this.ensureUserExists();
      
      console.log('Loading health data for user:', userId);
      
      const response = await fetch(`${this.apiUrl}/api/health/${userId}`);
      
      if (response.status === 404) {
        console.log('No existing health data found for user, using defaults');
        // Initialize with default data for new user
        const defaultData = this.getDefaultData();
        await this.syncToCloud(defaultData);
        return defaultData;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }

      const cloudData = await response.json();
      console.log('Loaded health data from MongoDB:', cloudData);
      
      // Transform MongoDB data to frontend format
      const transformedData = {
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

      // Cache locally
      localStorage.setItem('health_data', JSON.stringify(transformedData));
      localStorage.setItem('last_sync_time', new Date().toISOString());
      
      return transformedData;
    } catch (error) {
      console.error('Failed to load from cloud, using local data:', error);
      this.offlineMode = true;
      return localData || this.getDefaultData();
    }
  }

  // Update specific data sections
  async updateProfile(profile) {
    if (!this.currentUser || !this.isOnline) {
      this.addToSyncQueue('updateProfile', profile);
      return;
    }

    try {
      const userId = this.currentUser.uid;
      
      const response = await fetch(`${this.apiUrl}/api/health/${userId}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        throw new Error(`Profile update failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Profile update failed:', error);
      this.addToSyncQueue('updateProfile', profile);
      throw error;
    }
  }

  async updateMedications(medications) {
    if (!this.currentUser || !this.isOnline) {
      this.addToSyncQueue('updateMedications', medications);
      return;
    }

    try {
      const userId = this.currentUser.uid;
      
      const response = await fetch(`${this.apiUrl}/api/health/${userId}/medications`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medications)
      });

      if (!response.ok) {
        throw new Error(`Medications update failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Medications update failed:', error);
      this.addToSyncQueue('updateMedications', medications);
      throw error;
    }
  }

  async updateCycleData(cycleData) {
    if (!this.currentUser || !this.isOnline) {
      this.addToSyncQueue('updateCycleData', cycleData);
      return;
    }

    try {
      const userId = this.currentUser.uid;
      
      const response = await fetch(`${this.apiUrl}/api/health/${userId}/cycle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cycleData)
      });

      if (!response.ok) {
        throw new Error(`Cycle data update failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Cycle data update failed:', error);
      this.addToSyncQueue('updateCycleData', cycleData);
      throw error;
    }
  }

  // Sync queue management
  addToSyncQueue(operation, data) {
    this.syncQueue.push({ operation, data, timestamp: Date.now() });
    
    // Limit queue size
    if (this.syncQueue.length > 50) {
      this.syncQueue = this.syncQueue.slice(-50);
    }
  }

  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const queue = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of queue) {
      try {
        if (item.operation === 'syncAll') {
          await this.syncToCloud(item.data);
        } else if (item.operation === 'updateProfile') {
          await this.updateProfile(item.data);
        } else if (item.operation === 'updateMedications') {
          await this.updateMedications(item.data);
        } else if (item.operation === 'updateCycleData') {
          await this.updateCycleData(item.data);
        }
      } catch (error) {
        console.error('Failed to process sync queue item:', error);
        // Re-add failed items to queue
        this.addToSyncQueue(item.operation, item.data);
      }
    }
  }

  // Fallback to local data
  getLocalData() {
    const savedData = localStorage.getItem('health_data');
    if (savedData) {
      return JSON.parse(savedData);
    }
    
    return this.getDefaultData();
  }

  // Default data structure
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

  // Check sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      lastSync: localStorage.getItem('last_sync_time'),
      apiUrl: this.apiUrl
    };
  }

  // Health check
  async checkConnection() {
    try {
      const response = await fetch(`${this.apiUrl}/api/health-check`);
      return await response.json();
    } catch (error) {
      return { status: 'ERROR', error: error.message };
    }
  }
}

export const cloudSyncService = new CloudSyncService();
