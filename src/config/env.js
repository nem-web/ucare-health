// Environment configuration
export const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Ucare Health Tracker',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173'
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
    key: import.meta.env.VITE_API_KEY || '',
    useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true'
  },
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
  },
  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || ''
  },
  notifications: {
    vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};

// Validate required environment variables in production
if (config.isProduction) {
  const requiredVars = [
    'VITE_APP_URL'
  ];
  
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
  }
}
