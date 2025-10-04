import { config } from '../config/env';

class MongoService {
  constructor() {
    this.dbName = config.mongodb?.dbName || 'ucare_health';
    this.baseUrl = 'https://data.mongodb-api.com/app/data-api/endpoint/data/v1';
  }

  // Generic MongoDB operation
  async executeOperation(operation, collection, data = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/action/${operation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.mongodb?.apiKey || ''
        },
        body: JSON.stringify({
          dataSource: 'Ucare',
          database: this.dbName,
          collection,
          ...data
        })
      });

      if (!response.ok) {
        throw new Error(`MongoDB operation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MongoDB operation error:', error);
      throw error;
    }
  }

  // User operations
  async createUser(userData) {
    return await this.executeOperation('insertOne', 'users', {
      document: {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  async getUser(userId) {
    const result = await this.executeOperation('findOne', 'users', {
      filter: { userId }
    });
    return result.document;
  }

  async updateUser(userId, userData) {
    return await this.executeOperation('updateOne', 'users', {
      filter: { userId },
      update: {
        $set: {
          ...userData,
          updatedAt: new Date()
        }
      }
    });
  }

  // Health data operations
  async saveHealthData(userId, healthData) {
    return await this.executeOperation('replaceOne', 'health_data', {
      filter: { userId },
      replacement: {
        userId,
        ...healthData,
        updatedAt: new Date()
      },
      upsert: true
    });
  }

  async getHealthData(userId) {
    const result = await this.executeOperation('findOne', 'health_data', {
      filter: { userId }
    });
    return result.document;
  }

  // Profile operations
  async saveProfile(userId, profileData) {
    return await this.executeOperation('replaceOne', 'profiles', {
      filter: { userId },
      replacement: {
        userId,
        ...profileData,
        updatedAt: new Date()
      },
      upsert: true
    });
  }

  async getProfile(userId) {
    const result = await this.executeOperation('findOne', 'profiles', {
      filter: { userId }
    });
    return result.document;
  }

  // Medications operations
  async saveMedications(userId, medications) {
    return await this.executeOperation('replaceOne', 'medications', {
      filter: { userId },
      replacement: {
        userId,
        medications,
        updatedAt: new Date()
      },
      upsert: true
    });
  }

  async getMedications(userId) {
    const result = await this.executeOperation('findOne', 'medications', {
      filter: { userId }
    });
    return result.document?.medications || [];
  }

  // Symptoms operations
  async saveSymptoms(userId, symptoms) {
    return await this.executeOperation('replaceOne', 'symptoms', {
      filter: { userId },
      replacement: {
        userId,
        symptoms,
        updatedAt: new Date()
      },
      upsert: true
    });
  }

  async getSymptoms(userId) {
    const result = await this.executeOperation('findOne', 'symptoms', {
      filter: { userId }
    });
    return result.document?.symptoms || [];
  }

  // Cycle data operations
  async saveCycleData(userId, cycleData) {
    return await this.executeOperation('replaceOne', 'cycle_data', {
      filter: { userId },
      replacement: {
        userId,
        ...cycleData,
        updatedAt: new Date()
      },
      upsert: true
    });
  }

  async getCycleData(userId) {
    const result = await this.executeOperation('findOne', 'cycle_data', {
      filter: { userId }
    });
    return result.document;
  }

  // Health metrics operations
  async saveHealthMetrics(userId, metrics) {
    return await this.executeOperation('replaceOne', 'health_metrics', {
      filter: { userId },
      replacement: {
        userId,
        ...metrics,
        updatedAt: new Date()
      },
      upsert: true
    });
  }

  async getHealthMetrics(userId) {
    const result = await this.executeOperation('findOne', 'health_metrics', {
      filter: { userId }
    });
    return result.document;
  }

  // Water settings operations
  async saveWaterSettings(userId, waterSettings) {
    return await this.executeOperation('replaceOne', 'water_settings', {
      filter: { userId },
      replacement: {
        userId,
        ...waterSettings,
        updatedAt: new Date()
      },
      upsert: true
    });
  }

  async getWaterSettings(userId) {
    const result = await this.executeOperation('findOne', 'water_settings', {
      filter: { userId }
    });
    return result.document;
  }
}

export const mongoService = new MongoService();
