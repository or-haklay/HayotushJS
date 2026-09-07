import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Alert } from "react-native";
import { EventEmitter } from "events";
import { API_URL } from "../config/apiConfig";

// Create event emitter for consent updates
export const consentEvents = new EventEmitter();

const TOKEN_KEY = "token";

// Create axios instance instead of modifying defaults
const httpServices = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// --- Request Interceptor ---
httpServices.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers["authorization"] = `Bearer ${token}`;
      // Token added to headers
    } else {
      // No token found in AsyncStorage
    }


    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
httpServices.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Log error details for debugging
    const errorDetails = {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
      code: error.code,
    };

    console.error("Response error:", errorDetails);

    const status = error.response?.status;

    if (status === 401) {
      // בדיקה אם זה route שצפוי להחזיר 401 אם המשתמש לא מחובר (לא נציג error)
      const isExpected401 = error.config?.url?.includes("/legal/consent-status") ||
                            error.config?.url?.includes("/auth/") ||
                            error.config?.url?.includes("/users/login") ||
                            error.config?.url?.includes("/users/register");
      
      if (!isExpected401) {
        // בדיקה אם אנחנו כבר במסך התחברות
        const currentRoute = router.canGoBack() ? "unknown" : "login";

        Alert.alert("הפגישה פגה תוקף", "הפגישה שלך פגה תוקף. אנא התחבר שוב.", [
          {
            text: "התחבר",
            onPress: async () => {
              await AsyncStorage.removeItem(TOKEN_KEY);
              router.replace("/(auth)/login");
            },
          },
        ]);
      } else {
        // זה route שצפוי להחזיר 401 אם המשתמש לא מחובר - לא נציג error
        // פשוט נדחה את ה-error בשקט
      }
    } else if (status === 403 && error.response?.data?.error === "CONSENT_REQUIRED") {
      // Emit event to show consent modal
      consentEvents.emit("consentRequired", {
        requiredDocuments: error.response?.data?.requiredDocuments,
      });
      
      // Don't show alert, let the modal handle it
    } else if (status === 500) {
      console.error("Server error:", error.response?.data);
    } else if (status === 404) {
      console.error("Not found:", error.config?.url);
    } else if (!error.response) {
      console.error("Network error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Retry logic for network errors
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (
      retries > 0 &&
      (error.message === "Network Error" || error.code === "ECONNABORTED")
    ) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

const httpServicesInstance = {
  get: (url, config) => retryRequest(() => httpServices.get(url, config)),
  post: (url, data, config) =>
    retryRequest(() => httpServices.post(url, data, config)),
  put: (url, data, config) =>
    retryRequest(() => httpServices.put(url, data, config)),
  delete: (url, config) => retryRequest(() => httpServices.delete(url, config)),
  patch: (url, data, config) =>
    retryRequest(() => httpServices.patch(url, data, config)),
  defaults: httpServices.defaults,
};

export default httpServicesInstance;
