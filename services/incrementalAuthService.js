import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as Crypto from "expo-crypto";

WebBrowser.maybeCompleteAuthSession();

class IncrementalAuthService {
  constructor() {
    this.grantedScopes = new Set();
    this.baseScopes = ["openid", "email", "profile"];
  }

  // Get current granted scopes
  getGrantedScopes() {
    return Array.from(this.grantedScopes);
  }

  // Check if a scope is already granted
  hasScope(scope) {
    return this.grantedScopes.has(scope);
  }

  // Request additional scopes incrementally
  async requestAdditionalScopes(additionalScopes) {
    const isExpoGo = Constants.appOwnership === "expo";
    const scheme = Constants.expoConfig?.scheme ?? "hayotush";

    // Get appropriate client ID
    const clientId = isExpoGo
      ? Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID
      : Platform.OS === "ios"
      ? Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
      : Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

    // Generate secure state
    const state = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Math.random().toString(),
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );

    // Combine base scopes with additional scopes
    const allScopes = [...this.baseScopes, ...additionalScopes];

    const redirectUri = isExpoGo
      ? "https://auth.expo.dev/@orhaklay/hayotush"
      : `${scheme}://auth`;

    // Note: This is a simplified version for service usage
    // In a real implementation, you would need to handle the auth request differently
    // since useAuthRequest is a React hook and can't be used in a service class

    try {
      // For now, return a placeholder response
      // You'll need to implement this properly based on your app's architecture
      console.log("Incremental auth requested for scopes:", additionalScopes);
      return {
        success: true,
        scopes: additionalScopes,
        message: "Implementation needed",
      };
    } catch (error) {
      console.error("Incremental auth error:", error);
      return { success: false, error: error.message };
    }
  }

  // Request location access
  async requestLocationAccess() {
    const locationScopes = [
      "https://www.googleapis.com/auth/userlocation.readonly",
    ];

    const needsAccess = locationScopes.filter((scope) => !this.hasScope(scope));

    if (needsAccess.length === 0) {
      return { success: true, alreadyGranted: true };
    }

    return await this.requestAdditionalScopes(needsAccess);
  }

  // Clear granted scopes (for logout)
  clearGrantedScopes() {
    this.grantedScopes.clear();
  }
}

export default new IncrementalAuthService();
