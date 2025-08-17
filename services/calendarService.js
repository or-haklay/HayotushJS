// services/calendarService.js
// Google Calendar integration service

import httpServices from "./httpServices";
import config from "../config.json";

const BASE_URL = config.URL;

class CalendarService {
  // בדיקת גישה ליומן
  async checkAccess() {
    try {
      const response = await httpServices.get(`${BASE_URL}/calendar/access`);
      return response.data;
    } catch (error) {
      console.error("Calendar access check failed:", error);
      throw error;
    }
  }

  // הפעלת יומן גוגל
  async enable(accessToken, refreshToken, expiry) {
    try {
      const response = await httpServices.post(`${BASE_URL}/calendar/enable`, {
        accessToken,
        refreshToken,
        expiry,
      });
      return response.data;
    } catch (error) {
      console.error("Enable Google Calendar failed:", error);
      throw error;
    }
  }

  // ביטול יומן גוגל
  async disable() {
    try {
      const response = await httpServices.post(`${BASE_URL}/calendar/disable`);
      return response.data;
    } catch (error) {
      console.error("Disable Google Calendar failed:", error);
      throw error;
    }
  }

  // סנכרון תזכורות קיימות
  async syncReminders() {
    try {
      const response = await httpServices.post(`${BASE_URL}/calendar/sync`);
      return response.data;
    } catch (error) {
      console.error("Sync reminders failed:", error);
      throw error;
    }
  }
}

export default new CalendarService();
