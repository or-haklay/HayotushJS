import axios from "axios";
import config from "../config.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Alert } from "react-native";

const TOKEN_KEY = "token";
const API_URL = config.URL;

console.log("🌐 HTTP Services initialized with API_URL:", API_URL);

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common["Content-Type"] = "application/json";

// --- Request Interceptor ---
axios.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers["authorization"] = token;
      console.log("🔑 Request with token:", token.substring(0, 20) + "...");
    } else {
      console.log("⚠️ Request without token");
    }

    console.log("📤 Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      params: config.params,
    });

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
axios.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error("❌ Response error:", {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });

    const status = error.response?.status;

    if (status === 401) {
      Alert.alert(
        "Session Expired",
        "Your session has expired. Please log in again."
      );

      await AsyncStorage.removeItem(TOKEN_KEY);
      router.replace("/(auth)/login");
    }

    return Promise.reject(error);
  }
);

const httpServices = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
  patch: axios.patch,
  defaults: axios.defaults,
};

export default httpServices;
