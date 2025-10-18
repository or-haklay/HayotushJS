import { useState, useCallback } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as Crypto from "expo-crypto";

WebBrowser.maybeCompleteAuthSession();

export function useIncrementalAuth() {
  const [grantedScopes, setGrantedScopes] = useState(new Set());
  const baseScopes = ["openid", "email", "profile"];

  const generateState = useCallback(async () => {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Math.random().toString(),
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );
  }, []);

  const requestAdditionalScopes = useCallback(
    async (additionalScopes) => {
      const isExpoGo = Constants.appOwnership === "expo";
      const scheme = Constants.expoConfig?.scheme ?? "hayotush";

      // Get appropriate client ID
      const clientId = isExpoGo
        ? Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID
        : Platform.OS === "ios"
        ? Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
        : Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

      // Generate secure state
      const state = await generateState();

      // Combine base scopes with additional scopes
      const allScopes = [...baseScopes, ...additionalScopes];

      const redirectUri = isExpoGo
        ? "https://auth.expo.dev/@orhaklay/hayotush"
        : `${scheme}://auth`;

      const [request, response, promptAsync] = Google.useAuthRequest({
        clientId,
        responseType: "code",
        usePKCE: true,
        state,
        scopes: allScopes,
        extraParams: {
          access_type: "offline",
          prompt: "consent", // Force consent for new scopes
          include_granted_scopes: "true", // Include previously granted scopes
        },
        redirectUri,
      });

      try {
        const result = await promptAsync({
          useProxy: isExpoGo,
          showInRecents: false,
          preferEphemeralSession: true,
        });

        if (result.type === "success") {
          // Update granted scopes
          const newScopes = new Set([...grantedScopes, ...additionalScopes]);
          setGrantedScopes(newScopes);
          return { success: true, scopes: additionalScopes };
        } else {
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error("Incremental auth error:", error);
        return { success: false, error: error.message };
      }
    },
    [grantedScopes, generateState]
  );

  const requestCalendarAccess = useCallback(async () => {
    const calendarScopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ];

    // Check if already granted
    const needsAccess = calendarScopes.filter(
      (scope) => !grantedScopes.has(scope)
    );

    if (needsAccess.length === 0) {
      return { success: true, alreadyGranted: true };
    }

    return await requestAdditionalScopes(needsAccess);
  }, [grantedScopes, requestAdditionalScopes]);

  const requestLocationAccess = useCallback(async () => {
    const locationScopes = [
      "https://www.googleapis.com/auth/userlocation.readonly",
    ];

    const needsAccess = locationScopes.filter(
      (scope) => !grantedScopes.has(scope)
    );

    if (needsAccess.length === 0) {
      return { success: true, alreadyGranted: true };
    }

    return await requestAdditionalScopes(needsAccess);
  }, [grantedScopes, requestAdditionalScopes]);

  const hasScope = useCallback(
    (scope) => {
      return grantedScopes.has(scope);
    },
    [grantedScopes]
  );

  const getGrantedScopes = useCallback(() => {
    return Array.from(grantedScopes);
  }, [grantedScopes]);

  const clearGrantedScopes = useCallback(() => {
    setGrantedScopes(new Set());
  }, []);

  return {
    requestAdditionalScopes,
    requestCalendarAccess,
    requestLocationAccess,
    hasScope,
    getGrantedScopes,
    clearGrantedScopes,
  };
}

