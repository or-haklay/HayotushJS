import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import httpServices from "./httpServices";
import firebaseService from "./firebaseService";

// טוען את המודול של התראות רק כשצריך (כדי להימנע משגיאות ב-Expo Go)
let notificationsModule = null;
async function getNotificationsModule() {
  if (!notificationsModule) {
    notificationsModule = await import("expo-notifications");
  }
  return notificationsModule;
}

class NotificationService {
  // בקשת הרשאות
  async requestPermissions() {
    try {
      const Notifications = await getNotificationsModule();
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  // קבלת token להתראות
  async getPushToken() {
    try {
      // שיפור זיהוי Expo Go
      const isExpoGo =
        Constants.executionEnvironment === "storeClient" ||
        Constants.appOwnership === "expo" ||
        !Constants.appOwnership;

      if (isExpoGo) {
        console.log(
          "Skipping push token fetch in Expo Go (use a development build)."
        );
        return null;
      }

      // Initialize Firebase first (עם טיפול נכון בשגיאות)
      const firebaseInitResult = await firebaseService.initialize();
      
      // רק אם Firebase אותחל בהצלחה, נסה לקבל FCM token
      if (firebaseInitResult && firebaseService.isFirebaseInitialized()) {
        try {
          const fcmToken = await firebaseService.getFCMToken();
          if (fcmToken) {
            console.log("✅ Successfully got FCM token:", fcmToken);
            return fcmToken;
          }
        } catch (fcmError) {
          console.log("⚠️ FCM token failed, trying Expo push token:", fcmError.message);
        }
      }

      // Fallback to Expo push token
      const projectId =
        (Constants.expoConfig &&
          Constants.expoConfig.extra &&
          Constants.expoConfig.extra.eas &&
          Constants.expoConfig.extra.eas.projectId) ||
        (Constants.easConfig && Constants.easConfig.projectId);

      if (!projectId) {
        console.warn(
          "EAS projectId not found; cannot fetch Expo push token right now."
        );
        return null;
      }

      const Notifications = await getNotificationsModule();
      
      const token = await Notifications.getExpoPushTokenAsync({ 
        projectId,
        applicationId: Constants.expoConfig?.android?.package || Constants.expoConfig?.ios?.bundleIdentifier
      });
      
      console.log("✅ Successfully got Expo push token:", token.data);
      return token.data;
    } catch (error) {
      console.error("❌ Error getting push token:", error);
      
      // אם זה Firebase error, נסה ללא Firebase
      if (error.message && error.message.includes("Firebase")) {
        console.log("🔄 Firebase error detected, trying alternative method...");
        try {
          const Notifications = await getNotificationsModule();
          const projectId = Constants.expoConfig?.extra?.eas?.projectId;
          if (projectId) {
            const token = await Notifications.getExpoPushTokenAsync({ projectId });
            console.log("✅ Got push token without Firebase:", token.data);
            return token.data;
          }
        } catch (fallbackError) {
          console.error("❌ Fallback method also failed:", fallbackError);
        }
      }
      
      return null;
    }
  }

  // קבלת כל ההתראות של המשתמש
  async getUserNotifications() {
    try {
      const response = await httpServices.get("/notifications");
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
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
      console.log("Local notification scheduled successfully");
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
      console.log("Notification cancelled successfully");
    } catch (error) {
      console.error("Error cancelling notification:", error);
    }
  }

  // ביטול כל ההתראות
  async cancelAllNotifications() {
    try {
      const Notifications = await getNotificationsModule();
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("All notifications cancelled successfully");
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

  // שליחת push token לשרת
  async sendPushTokenToServer(pushToken) {
    try {
      const response = await httpServices.post("/users/push-token", {
        pushToken: pushToken,
        platform: Platform.OS, // 'ios' או 'android'
        deviceId: Device.osInternalBuildId || 'unknown'
      });
      console.log("✅ Push token sent to server successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Error sending push token to server:", error);
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
