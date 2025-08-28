import axios from "axios";
import config from "../config.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Alert } from "react-native";

const TOKEN_KEY = "token";
const API_URL = config.URL;

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.timeout = 30000; // 30 seconds timeout
axios.defaults.retry = 3; // retry 3 times

// --- Request Interceptor ---
axios.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers["authorization"] = token;
      // Token added to headers
    } else {
      // No token found in AsyncStorage
    }

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

const httpServices = {
  get: (url, config) => retryRequest(() => axios.get(url, config)),
  post: (url, data, config) =>
    retryRequest(() => axios.post(url, data, config)),
  put: (url, data, config) => retryRequest(() => axios.put(url, data, config)),
  delete: (url, config) => retryRequest(() => axios.delete(url, config)),
  patch: (url, data, config) =>
    retryRequest(() => axios.patch(url, data, config)),
  defaults: axios.defaults,
};

export default httpServices;
