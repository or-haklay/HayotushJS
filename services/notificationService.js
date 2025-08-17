import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import httpServices from "./httpServices";

// הגדרת איך ההתראות ייראו כשהאפליקציה פתוחה
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  // בקשת הרשאות
  async requestPermissions() {
    if (Device.isDevice) {
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
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      });
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
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log("Notification cancelled successfully");
    } catch (error) {
      console.error("Error cancelling notification:", error);
    }
  }

  // ביטול כל ההתראות
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("All notifications cancelled successfully");
    } catch (error) {
      console.error("Error cancelling all notifications:", error);
    }
  }
}

export default new NotificationService();
