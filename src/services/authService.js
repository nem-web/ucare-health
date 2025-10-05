import { config } from '../config/env';

// Auth service with environment-based configuration
export const authService = {
  currentUser: null,
  callbacks: [],
  apiUrl: config.api.baseUrl || 'http://localhost:5000',

  // Sign up with MongoDB user creation
  async signUp(email, password, name) {
    try {
      // Check if user already exists
      const existingUser = await this.checkUserExists(email);
      if (existingUser) {
        return { success: false, error: 'User already exists. Please sign in instead.' };
      }

      const user = {
        uid: Date.now().toString(),
        email,
        displayName: name,
        createdAt: new Date().toISOString()
      };
      
      // Create user in MongoDB
      const result = await this.createUserInDatabase(user);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      
      localStorage.setItem('ucare_user', JSON.stringify(user));
      this.currentUser = user;
      this.notifyCallbacks(user);
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sign in and load user from MongoDB
  async signIn(email, password) {
    try {
      // Check if user exists
      const existingUser = await this.checkUserExists(email);
      if (!existingUser) {
        return { success: false, error: 'User not found. Please sign up first.' };
      }

      // Update last login
      const user = {
        ...existingUser,
        lastLogin: new Date().toISOString()
      };
      
      await this.updateUserLogin(user.uid);
      
      localStorage.setItem('ucare_user', JSON.stringify(user));
      this.currentUser = user;
      this.notifyCallbacks(user);
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Check if user exists by email
  async checkUserExists(email) {
    try {
      const response = await fetch(`${this.apiUrl}/api/users/check/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.exists ? result.user : null;
      }
      return null;
    } catch (error) {
      console.error('Failed to check user existence:', error);
      return null;
    }
  },

  // Update user login timestamp
  async updateUserLogin(userId) {
    try {
      await fetch(`${this.apiUrl}/api/users/${userId}/login`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastLogin: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to update user login:', error);
    }
  },

  // Create user in MongoDB database
  async createUserInDatabase(user) {
    try {
      const response = await fetch(`${this.apiUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt || new Date().toISOString(),
          lastLogin: user.lastLogin || new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to create user' };
      }

      return { success: true, data: await response.json() };
    } catch (error) {
      console.error('Failed to create user in database:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Sign out
  async signOut() {
    try {
      localStorage.removeItem('ucare_user');
      this.currentUser = null;
      this.notifyCallbacks(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    this.callbacks.push(callback);
    
    // Check for existing user on load
    const savedUser = localStorage.getItem('ucare_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      callback(this.currentUser);
    } else {
      callback(null);
    }

    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  },

  // Notify all callbacks
  notifyCallbacks(user) {
    this.callbacks.forEach(callback => callback(user));
  }
};
