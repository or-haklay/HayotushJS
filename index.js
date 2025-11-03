// Background message handler for Firebase Cloud Messaging
// This file must be at the root level for React Native Firebase to register it
// Note: This handler only works in development/production builds, not in Expo Go

try {
  const messaging = require('@react-native-firebase/messaging').default;
  
  // Register background handler
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('🔔 Message handled in the background!', remoteMessage);
    
    // You can handle background notifications here
    // For example, update local database, show local notification, etc.
    // Note: You cannot access React components or navigation here
    
    // Example: Update local storage, show local notification via expo-notifications, etc.
    
    return Promise.resolve();
  });
} catch (error) {
  // Firebase messaging might not be available (e.g., in Expo Go)
  console.log('⚠️ Firebase background handler not available:', error.message);
}

// Note: This handler runs when the app is in the background or closed
// For foreground messages, see notificationService.js and app/_layout.jsx

