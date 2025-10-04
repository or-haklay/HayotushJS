import React from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { Button } from "react-native-paper";
import { StyleSheet } from "react-native";
import Constants from "expo-constants";
import authService from "../../services/authService";
import { COLORS, SIZING } from "../../theme/theme";

WebBrowser.maybeCompleteAuthSession();

const googleDiscovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
};

export default function GoogleAuthButton() {
  const clientId =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  // 👇 קבע מפורשות את ה-Expo Proxy שלך (כבר רשמת אותו בגוגל)
  const redirectUri = "https://auth.expo.io/@orhaklay/hayotush";

  // Debug information
  console.log("🔧 Google OAuth Config:", {
    clientId: clientId ? `${clientId.slice(0, 20)}...` : "NOT FOUND",
    redirectUri,
    hasExpoConfig: !!Constants.expoConfig?.extra,
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      scopes: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/calendar", // גישה ליומן
        "https://www.googleapis.com/auth/calendar.events", // יצירת/עדכון/מחיקת אירועים
      ],
      redirectUri,
      responseType: "code",
      usePKCE: true,
    },
    googleDiscovery
  );

  React.useEffect(() => {
    (async () => {
      if (response?.type === "success") {
        const { code } = response.params;
        try {
          console.log("🔄 Google OAuth success, exchanging code for token...");
          await authService.oauthLogin("google", {
            code,
            codeVerifier: request?.codeVerifier,
            redirectUri: "https://auth.expo.io/@orhaklay/hayotush",
            clientId:
              Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
          });
          console.log("✅ Google OAuth completed successfully");
          // router.replace("/(tabs)/home")
        } catch (e) {
          console.error("❌ Google OAuth error:", e);
        }
      } else if (response?.type === "error") {
        console.error("❌ Google OAuth error:", response.error);
      } else if (response?.type === "cancel") {
        console.log("🚫 Google OAuth cancelled by user");
      }
    })();
  }, [response]);

  if (!clientId) {
    console.error("Google Client ID not found!");
    return null;
  }

  return (
    <Button
      icon="google"
      mode="outlined"
      disabled={!request}
      onPress={() => promptAsync({ useProxy: true })} // חשוב להשאיר useProxy כאן
      style={styles.googleButton}
      labelStyle={styles.googleButtonLabel}
      contentStyle={styles.googleButtonContent}
    >
      התחבר עם גוגל
    </Button>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    marginHorizontal: SIZING.margin + SIZING.base,
    marginVertical: SIZING.base,
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: SIZING.radius_md,
    backgroundColor: COLORS.white,
    paddingVertical: SIZING.base - 4,
    zIndex: 10,
    elevation: 3,
  },
  googleButtonLabel: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: "500",
  },
  googleButtonContent: {
    paddingVertical: SIZING.base - 4,
  },
});
