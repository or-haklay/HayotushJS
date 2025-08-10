import axios from "axios";
import config from "../config.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Alert } from "react-native";

const TOKEN_KEY = "token";

axios.defaults.baseURL = config.URL;
axios.defaults.headers.common["Content-Type"] = "application/json";

// --- Request Interceptor ---
axios.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers["authorization"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor ---
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
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
};

export default httpServices;
