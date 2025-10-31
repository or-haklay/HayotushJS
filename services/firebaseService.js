import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Firebase initialization service
class FirebaseService {
  constructor() {
    this.isInitialized = false;
    this.firebaseApp = null;
  }

  // Initialize Firebase
  async initialize() {
    try {
      // שיפור זיהוי Expo Go
      const isExpoGo = 
        Constants.executionEnvironment === 'storeClient' || 
        Constants.appOwnership === 'expo' ||
        !Constants.appOwnership || // גם אם אין ownership, זה כנראה Expo Go
        (__DEV__ && Constants.executionEnvironment !== 'standalone'); // בפיתוח שלא standalone
      
      if (isExpoGo) {
        console.log('🔥 Skipping Firebase initialization in Expo Go');
        return false;
      }

      // בדיקה אם המודול זמין לפני שימוש
      try {
        const firebaseApp = require('@react-native-firebase/app');
        if (!firebaseApp || !firebaseApp.default) {
          console.log('🔥 Firebase module not available');
          return false;
        }
      } catch (moduleError) {
        console.log('🔥 Firebase module not found:', moduleError.message);
        return false;
      }

      // Dynamic import to avoid errors in Expo Go
      const { initializeApp, getApps } = await import('@react-native-firebase/app');
      
      // Check if Firebase is already initialized
      const apps = getApps();
      if (apps.length > 0) {
        console.log('🔥 Firebase already initialized');
        this.firebaseApp = apps[0];
        this.isInitialized = true;
        return true;
      }

      // Initialize Firebase with default configuration
      this.firebaseApp = initializeApp();
      this.isInitialized = true;
      
      console.log('🔥 Firebase initialized successfully');
      return true;
    } catch (error) {
      console.error('🔥 Firebase initialization error:', error);
      this.isInitialized = false;
      return false;
    }
  }

  // Get Firebase app instance
  getApp() {
    return this.firebaseApp;
  }

  // Check if Firebase is initialized
  isFirebaseInitialized() {
    return this.isInitialized && this.firebaseApp !== null;
  }

  // Initialize Firebase Messaging
  async initializeMessaging() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.isInitialized) {
        console.log('🔥 Firebase not initialized, skipping messaging setup');
        return null;
      }

      const { getMessaging } = await import('@react-native-firebase/messaging');
      const messaging = getMessaging();
      
      console.log('🔥 Firebase Messaging initialized');
      return messaging;
    } catch (error) {
      console.error('🔥 Firebase Messaging initialization error:', error);
      return null;
    }
  }

  // Get FCM token
  async getFCMToken() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.isInitialized) {
        console.log('🔥 Firebase not initialized, cannot get FCM token');
        return null;
      }

      const { getMessaging, getToken } = await import('@react-native-firebase/messaging');
      const messaging = getMessaging();
      const token = await getToken(messaging);
      
      console.log('🔥 FCM Token:', token);
      return token;
    } catch (error) {
      console.error('🔥 Error getting FCM token:', error);
      return null;
    }
  }
}

export default new FirebaseService();
