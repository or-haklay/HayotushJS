import * as Device from "expo-device";
import Constants from "expo-constants";
import httpServices from "./httpServices";

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
    if (Device.isDevice) {
      const Notifications = await getNotificationsModule();
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
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
    } else {
      console.log("Must use physical device for Push Notifications");
      return false;
    }
  }

  // קבלת token להתראות
  async getPushToken() {
    try {
      // אל תנסה לקבל token ב-Expo Go (store client) — זה אינו נתמך ויגרום לשגיאה
      const isExpoGo =
        Constants.executionEnvironment === "storeClient" ||
        Constants.appOwnership === "expo";
      if (isExpoGo) {
        console.log(
          "Skipping push token fetch in Expo Go (use a development build)."
        );
        return null;
      }

      // איתור projectId בצורה בטוחה (תומך גם ב-dev build וגם ב-production)
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
      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      return token.data;
    } catch (error) {
      console.error("Error getting push token:", error);
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
}

export default new NotificationService();
