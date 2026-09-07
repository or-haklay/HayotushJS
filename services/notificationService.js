import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import httpServices from "./httpServices";
import firebaseService from "./firebaseService";

const PUSH_TOKEN_KEY = "device_push_token"; // מפתח לאחסון מקומי של push token

// טוען את המודול של התראות רק כשצריך (כדי להימנע משגיאות ב-Expo Go)
let notificationsModule = null;
async function getNotificationsModule() {
  if (!notificationsModule) {
    notificationsModule = await import("expo-notifications");
  }
  return notificationsModule;
}

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
  }

  // אתחול notification handlers ו-listeners
  async initializeHandlers() {
    if (this.isInitialized) {
      return;
    }

    try {
      const Notifications = await getNotificationsModule();

      // הגדרת handler לטיפול בהתראות בקדמת הבמה
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      this.isInitialized = true;
    } catch (error) {
      console.error("Error initializing notification handlers:", error);
    }
  }

  // רישום listeners להתראות
  setupListeners(onNotificationReceived, onNotificationResponse) {
    if (this.notificationListener || this.responseListener) {
      // כבר רשומים, נסיים את הקודמים
      this.removeListeners();
    }

    getNotificationsModule().then((Notifications) => {
      if (onNotificationReceived) {
        this.notificationListener = Notifications.addNotificationReceivedListener(
          onNotificationReceived
        );
      }

      if (onNotificationResponse) {
        this.responseListener = Notifications.addNotificationResponseReceivedListener(
          onNotificationResponse
        );
      }

    }).catch((error) => {
      console.error("❌ Error setting up notification listeners:", error);
    });
  }

  // הסרת listeners
  removeListeners() {
    if (this.notificationListener) {
      // In expo-notifications, the subscription object has a remove() method
      if (typeof this.notificationListener.remove === 'function') {
        this.notificationListener.remove();
      }
      this.notificationListener = null;
    }

    if (this.responseListener) {
      try {
        // In expo-notifications, the subscription object has a remove() method
        if (typeof this.responseListener.remove === 'function') {
          this.responseListener.remove();
        }
      } catch (error) {
        // Silent fail for listener removal
      }
      this.responseListener = null;
    }
  }

  // הגדרת ערוץ התראות ב-Android
  async setupAndroidChannel() {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      const Notifications = await getNotificationsModule();
      await Notifications.setNotificationChannelAsync('default', {
        name: 'התראות חדשות',
        description: 'התראות מהאפליקציה',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        sound: 'hayotush_notification.mp3',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });
    } catch (error) {
      console.error("Error setting up Android notification channel:", error);
    }
  }

  // בקשת הרשאות - תמיד בודקת ומבקשת הרשאות בכל כניסה מחדש
  async requestPermissions() {
    try {
      const Notifications = await getNotificationsModule();
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // תמיד מבקשים הרשאה אם אין הרשאה או אם זה בפעם הראשונה
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        return false;
      }

      // הגדרת ערוץ Android לאחר קבלת הרשאות
      if (Platform.OS === 'android') {
        await this.setupAndroidChannel();
      }
      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  // שמירת push token מקומית
  async savePushTokenLocally(token) {
    try {
      if (token) {
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
      } else {
        await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
      }
    } catch (error) {
      console.error("Error saving push token locally:", error);
    }
  }

  // טעינת push token מקומי
  async getLocalPushToken() {
    try {
      const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error("Error loading local push token:", error);
      return null;
    }
  }

  // קבלת token להתראות - קודם מנסה טעינה מקומית, אחרת מקבל חדש
  async getPushToken(forceNew = false) {
    try {
      // קודם נסה לטעון token מקומי - אבל רק אם זה FCM token (לא Expo token)
      // אם יש Expo token מקומי, ננסה לקבל FCM token חדש
      if (!forceNew) {
        const localToken = await this.getLocalPushToken();
        if (localToken) {
          // אם זה FCM token (לא Expo token), נשתמש בו
          if (!localToken.startsWith("ExponentPushToken")) {
            return localToken;
          }
          // ממשיך לנסות לקבל FCM token חדש
        }
      }

      // זיהוי נכון של Expo Go
      // ב-Expo Go: executionEnvironment === "storeClient"
      // ב-development build: executionEnvironment === "standalone" או משהו אחר
      let isExpoGo = false;
      try {
        // Expo Go מוגדר כ-storeClient
        isExpoGo = Constants?.executionEnvironment === "storeClient";
        
        // Additional check: אם יש native modules, זה לא Expo Go
        // (אבל לא נבדוק את זה כדי לא ליצור שגיאות)
        // ב-development build, executionEnvironment לא יהיה "storeClient"
      } catch (constantsError) {
        // אם Constants לא זמין, נמשיך (לא Expo Go)
      }

      if (isExpoGo) {
        return null;
      }

      // Initialize Firebase first (עם טיפול נכון בשגיאות) - תמיד מנסים FCM token קודם
      const firebaseInitResult = await firebaseService.initialize();
      
      // רק אם Firebase אותחל בהצלחה, נסה לקבל FCM token (מועדף על Expo Push Token)
      if (firebaseInitResult && firebaseService.isFirebaseInitialized()) {
        try {
          const fcmToken = await firebaseService.getFCMToken();
          if (fcmToken) {
            // שמור מקומית (תמיד מעדכן ל-FCM token אם אפשר)
            await this.savePushTokenLocally(fcmToken);
            return fcmToken;
          }
        } catch (fcmError) {
          console.error("FCM token error:", fcmError.message);
        }
      }

      // Fallback to Expo push token (עם טיפול בטוח ב-Constants)
      let projectId = null;
      let applicationId = null;
      
      try {
        projectId =
          (Constants?.expoConfig &&
            Constants.expoConfig.extra &&
            Constants.expoConfig.extra.eas &&
            Constants.expoConfig.extra.eas.projectId) ||
          (Constants?.easConfig && Constants.easConfig.projectId);
        
        applicationId = Constants?.expoConfig?.android?.package || Constants?.expoConfig?.ios?.bundleIdentifier;
      } catch (constantsError) {
        // Constants not available
      }

      if (!projectId) {
        return null;
      }

      const Notifications = await getNotificationsModule();
      
      const token = await Notifications.getExpoPushTokenAsync({ 
        projectId,
        applicationId
      });
      
      const tokenData = token.data;
      
      // שמור מקומית
      await this.savePushTokenLocally(tokenData);
      
      return tokenData;
    } catch (error) {
      console.error("Error getting push token:", error);
      
      // אם זה Firebase error, נסה ללא Firebase
      if (error.message && error.message.includes("Firebase")) {
        try {
          const Notifications = await getNotificationsModule();
          let projectId = null;
          try {
            projectId = Constants?.expoConfig?.extra?.eas?.projectId;
          } catch (constantsError) {
            // Constants not available
          }
          if (projectId) {
            const token = await Notifications.getExpoPushTokenAsync({ projectId });
            const tokenData = token.data;
            // שמור מקומית
            await this.savePushTokenLocally(tokenData);
            return tokenData;
          }
        } catch (fallbackError) {
          console.error("Fallback method failed:", fallbackError);
        }
      }
      
      return null;
    }
  }

  // קבלת כל ההתראות של המשתמש
  async getUserNotifications() {
    try {
      const response = await httpServices.get("/notifications");
      
      // השרת מחזיר { notifications: [...], totalPages, currentPage, total }
      const data = response?.data || response;
      
      // אם יש notifications בתוך data, נחזיר את זה
      if (data && data.notifications && Array.isArray(data.notifications)) {
        return { notifications: data.notifications };
      }
      
      // אם data הוא מערך ישירות, נחזיר אותו
      if (Array.isArray(data)) {
        return { notifications: data };
      }
      
      // אחרת נחזיר רשימה ריקה
      return { notifications: [] };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return { notifications: [] };
    }
  }

  // סימון התראה כנקראה
  async markAsRead(notificationId) {
    try {
      const response = await httpServices.patch(
        `/notifications/${notificationId}/read`
      );
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return null;
    }
  }

  // מחיקת התראה
  async deleteNotification(notificationId) {
    try {
      const response = await httpServices.delete(
        `/notifications/${notificationId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return null;
    }
  }

  // סימון כל ההתראות כנקראו
  async markAllAsRead() {
    try {
      const response = await httpServices.patch("/notifications/mark-all-read");
      return response.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return null;
    }
  }

  // שליחת התראה מקומית
  async scheduleLocalNotification(title, body, trigger) {
    try {
      const Notifications = await getNotificationsModule();
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger,
      });
    } catch (error) {
      console.error("Error scheduling local notification:", error);
    }
  }

  // שליחת התראה לתזכורת
  async scheduleReminderNotification(reminder) {
    const trigger = new Date(reminder.date);

    await this.scheduleLocalNotification(
      `תזכורת: ${reminder.title}`,
      reminder.description || "זמן לתזכורת שלך!",
      { date: trigger }
    );
  }

  // ביטול התראה
  async cancelNotification(notificationId) {
    try {
      const Notifications = await getNotificationsModule();
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error("Error cancelling notification:", error);
    }
  }

  // ביטול כל ההתראות
  async cancelAllNotifications() {
    try {
      const Notifications = await getNotificationsModule();
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error cancelling all notifications:", error);
    }
  }

  // עדכון פעילות אחרונה
  async updateLastActivity() {
    try {
      await httpServices.post("/users/activity");
    } catch (error) {
      console.log("Failed to update activity");
    }
  }

  // שליחת push token לשרת (או מחיקתו אם null)
  async sendPushTokenToServer(pushToken) {
    try {
      const response = await httpServices.post("/users/push-token", {
        pushToken: pushToken, // יכול להיות null למחיקה
        pushNotificationsEnabled: pushToken ? true : false, // אם אין token, false
        platform: Platform.OS, // 'ios' או 'android'
        deviceId: Device.osInternalBuildId || 'unknown'
      });
      console.log(pushToken 
        ? "✅ Push token sent to server successfully" 
        : "✅ Push token removed from server successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Error sending/removing push token to server:", error);
      throw error;
    }
  }

  // עדכון push token בשרת (כשהמשתמש מתחבר מחדש)
  async updatePushToken() {
    try {
      const token = await this.getPushToken();
      if (token) {
        await this.sendPushTokenToServer(token);
        return token;
      }
      return null;
    } catch (error) {
      console.error("❌ Error updating push token:", error);
      return null;
    }
  }
}

export default new NotificationService();
