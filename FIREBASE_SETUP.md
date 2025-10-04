# Firebase Setup for Cloud Storage & Authentication

## 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name: `ucare-health`
4. Enable Google Analytics (optional)
5. Create project

## 2. Enable Authentication
1. Go to Authentication > Sign-in method
2. Enable "Email/Password" provider
3. Save changes

## 3. Create Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select location closest to your users
5. Create database

## 4. Enable Storage
1. Go to Storage
2. Click "Get started"
3. Choose "Start in test mode"
4. Select same location as Firestore
5. Done

## 5. Get Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click "Web" icon (</>)
4. Register app name: `ucare-health-web`
5. Copy the config object

## 6. Update Firebase Config
Replace the config in `/src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 7. Security Rules (Production)

### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /healthData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 8. Install Dependencies
```bash
npm install firebase
```

## 9. Features Enabled
- ✅ **User Authentication**: Email/password login
- ✅ **Cloud Database**: Firestore for health records
- ✅ **File Storage**: Firebase Storage for images
- ✅ **Real-time Sync**: Cross-device data synchronization
- ✅ **Security**: User-specific data access
- ✅ **Offline Support**: Firebase offline persistence

## 10. Usage
1. Users sign up/login with email/password
2. All health data syncs to cloud automatically
3. Images uploaded to Firebase Storage
4. Access from any device with same credentials
5. Data persists across devices and sessions

Your health records are now stored securely in the cloud and accessible from anywhere!
