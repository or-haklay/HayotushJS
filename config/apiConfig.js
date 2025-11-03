import Constants from "expo-constants";

/**
 * Get API base URL from environment configuration
 * Priority:
 * 1. EXPO_PUBLIC_API_URL from app.json (extra section)
 * 2. Fallback to production URL
 * 
 * For local development, set in app.json:
 * "extra": {
 *   "EXPO_PUBLIC_API_URL": "http://localhost:3000/api"
 * }
 * 
 * For production, set:
 * "extra": {
 *   "EXPO_PUBLIC_API_URL": "https://api.hayotush.com/api"
 * }
 */
export const getApiUrl = () => {
  const apiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
                 Constants.manifest?.extra?.EXPO_PUBLIC_API_URL ||
                 "https://api.hayotush.com/api";
  
  return apiUrl;
};

/**
 * API base URL - use this throughout the app
 */
export const API_URL = getApiUrl();

console.log("🔗 [API Config] API URL:", API_URL);

