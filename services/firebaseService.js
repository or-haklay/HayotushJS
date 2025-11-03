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
      // זיהוי נכון של Expo Go
      // ב-Expo Go: executionEnvironment === 'storeClient'
      // ב-development build: executionEnvironment !== 'storeClient'
      const isExpoGo = Constants?.executionEnvironment === 'storeClient';
      
      if (isExpoGo) {
        console.log('🔥 Skipping Firebase initialization in Expo Go');
        return false;
      }

      // בדיקה אם המודול זמין לפני שימוש
      try {
        const firebaseApp = require('@react-native-firebase/app');
        if (!firebaseApp || !firebaseApp.default) {
          console.log('🔥🔥🔥 Firebase module not available (no default export)');
          return false;
        }
        console.log('🔥 Firebase module found');
      } catch (moduleError) {
        console.error('🔥🔥🔥 Firebase module not found:', moduleError.message);
        console.error('🔥 Error details:', moduleError);
        return false;
      }

      // Dynamic import to avoid errors in Expo Go
      console.log('🔥 Attempting to import Firebase modules...');
      const { initializeApp, getApps } = await import('@react-native-firebase/app');
      console.log('🔥 Firebase modules imported successfully');
      
      // Check if Firebase is already initialized
      const apps = getApps();
      if (apps.length > 0) {
        console.log('🔥🔥🔥 Firebase already initialized (found', apps.length, 'apps)');
        this.firebaseApp = apps[0];
        this.isInitialized = true;
        return true;
      }

      // Initialize Firebase with default configuration
      console.log('🔥 Attempting to initialize Firebase with default configuration...');
      this.firebaseApp = initializeApp();
      this.isInitialized = true;
      
      console.log('🔥🔥🔥 Firebase initialized successfully!');
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

      // Use modular API
      const { getApp } = await import('@react-native-firebase/app');
      const { getMessaging, getToken } = await import('@react-native-firebase/messaging');
      
      const app = getApp();
      const messaging = getMessaging(app);
      const token = await getToken(messaging);
      
      console.log('🔥 FCM Token:', token);
      return token;
    } catch (error) {
      console.error('🔥 Error getting FCM token:', error);
      // Fallback to legacy API
      try {
        const messaging = await import('@react-native-firebase/messaging');
        const token = await messaging.default().getToken();
        console.log('🔥 FCM Token (legacy API):', token);
        return token;
      } catch (fallbackError) {
        console.error('🔥 Fallback also failed:', fallbackError);
        return null;
      }
    }
  }

  // Setup foreground message handler
  async setupForegroundHandler(onMessage) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.isInitialized) {
        console.log('🔥 Firebase not initialized, skipping foreground handler setup');
        return null;
      }

      // Use modular API
      const { getApp } = await import('@react-native-firebase/app');
      const { getMessaging, onMessage: onMessageModular } = await import('@react-native-firebase/messaging');
      
      const app = getApp();
      const messaging = getMessaging(app);
      
      const unsubscribe = onMessageModular(messaging, async remoteMessage => {
        console.log('🔔🔔🔔 A new FCM message arrived in foreground!', remoteMessage);
        console.log('🔔 FCM notification data:', remoteMessage.data);
        console.log('🔔 FCM notification title:', remoteMessage.notification?.title);
        console.log('🔔 FCM notification body:', remoteMessage.notification?.body);
        
        // הצגת התראה גם ב-foreground (Expo notifications)
        try {
          const { Notifications } = await import('expo-notifications');
          await Notifications.scheduleNotificationAsync({
            content: {
              title: remoteMessage.notification?.title || 'התראה חדשה',
              body: remoteMessage.notification?.body || remoteMessage.data?.body || '',
              data: remoteMessage.data || {},
              sound: 'hayotush_notification.mp3',
            },
            trigger: null, // הצג מיידית
          });
          console.log('✅ Local notification displayed for FCM message');
        } catch (notifError) {
          console.error('❌ Failed to display local notification:', notifError.message);
        }
        
        if (onMessage) {
          onMessage(remoteMessage);
        }
      });

      console.log('🔥 Firebase foreground message handler setup completed');
      return unsubscribe;
    } catch (error) {
      console.error('🔥 Error setting up foreground handler:', error);
      // Fallback to legacy API if modular doesn't work
      try {
        const messaging = await import('@react-native-firebase/messaging');
        const unsubscribe = messaging.default().onMessage(async remoteMessage => {
          console.log('🔔 A new FCM message arrived (legacy API)!', remoteMessage);
          if (onMessage) {
            onMessage(remoteMessage);
          }
        });
        return unsubscribe;
      } catch (fallbackError) {
        console.error('🔥 Fallback also failed:', fallbackError);
        return null;
      }
    }
  }

  // Setup notification opened app handler (when user taps notification)
  async setupNotificationOpenedHandler(onNotificationOpened) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.isInitialized) {
        console.log('🔥 Firebase not initialized, skipping notification opened handler setup');
        return null;
      }

      // Use modular API
      const { getApp } = await import('@react-native-firebase/app');
      const { 
        getMessaging, 
        getInitialNotification,
        onNotificationOpenedApp 
      } = await import('@react-native-firebase/messaging');
      
      const app = getApp();
      const messaging = getMessaging(app);
      
      // Check if app was opened from a notification
      getInitialNotification(messaging).then(remoteMessage => {
        if (remoteMessage) {
          console.log('🔔 Notification caused app to open:', remoteMessage);
          if (onNotificationOpened) {
            onNotificationOpened(remoteMessage);
          }
        }
      });

      // Listen for notification opened when app is running
      const unsubscribe = onNotificationOpenedApp(messaging, remoteMessage => {
        console.log('🔔 Notification caused app to open from background state:', remoteMessage);
        if (onNotificationOpened) {
          onNotificationOpened(remoteMessage);
        }
      });

      console.log('🔥 Firebase notification opened handler setup completed');
      return unsubscribe;
    } catch (error) {
      console.error('🔥 Error setting up notification opened handler:', error);
      // Fallback to legacy API if modular doesn't work
      try {
        const messaging = await import('@react-native-firebase/messaging');
        
        messaging.default().getInitialNotification().then(remoteMessage => {
          if (remoteMessage) {
            console.log('🔔 Notification caused app to open (legacy API):', remoteMessage);
            if (onNotificationOpened) {
              onNotificationOpened(remoteMessage);
            }
          }
        });

        const unsubscribe = messaging.default().onNotificationOpenedApp(remoteMessage => {
          console.log('🔔 Notification caused app to open from background (legacy API):', remoteMessage);
          if (onNotificationOpened) {
            onNotificationOpened(remoteMessage);
          }
        });
        return unsubscribe;
      } catch (fallbackError) {
        console.error('🔥 Fallback also failed:', fallbackError);
        return null;
      }
    }
  }
}

export default new FirebaseService();
