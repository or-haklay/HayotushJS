import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/apiConfig";

const API_BASE_URL = API_URL;

const socialService = {
  // Get current social connections status
  getConnections: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/social-connections`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching social connections:", error);
      throw error;
    }
  },
};

export default socialService;
