import { config } from '../config/env';

// Auth service with environment-based configuration
export const authService = {
  currentUser: null,
  callbacks: [],
  apiUrl: config.api.baseUrl || 'http://localhost:5000',

  // Sign up with MongoDB user creation
  async signUp(email, password, name) {
    try {
      const user = {
        uid: Date.now().toString(),
        email,
        displayName: name,
        createdAt: new Date().toISOString()
      };
      
      // Create user in MongoDB
      await this.createUserInDatabase(user);
      
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
      const user = {
        uid: Date.now().toString(),
        email,
        displayName: email.split('@')[0],
        lastLogin: new Date().toISOString()
      };
      
      // Create or update user in MongoDB
      await this.createUserInDatabase(user);
      
      localStorage.setItem('ucare_user', JSON.stringify(user));
      this.currentUser = user;
      this.notifyCallbacks(user);
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
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
        throw new Error(`Failed to create user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create user in database:', error);
      // Don't throw error - allow offline functionality
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
