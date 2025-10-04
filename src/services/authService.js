import { config } from '../config/env';

// Auth service with environment-based configuration
export const authService = {
  currentUser: null,
  callbacks: [],

  // Mock sign up (replace with Firebase when configured)
  async signUp(email, password, name) {
    try {
      const user = {
        uid: Date.now().toString(),
        email,
        displayName: name,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('ucare_user', JSON.stringify(user));
      this.currentUser = user;
      this.notifyCallbacks(user);
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Mock sign in (replace with Firebase when configured)
  async signIn(email, password) {
    try {
      const user = {
        uid: Date.now().toString(),
        email,
        displayName: email.split('@')[0],
        lastLogin: new Date().toISOString()
      };
      
      localStorage.setItem('ucare_user', JSON.stringify(user));
      this.currentUser = user;
      this.notifyCallbacks(user);
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
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
