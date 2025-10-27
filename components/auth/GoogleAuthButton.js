import React from "react";
import { Platform, StyleSheet, Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import Constants from "expo-constants";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { COLORS, SIZING } from "../../theme/theme";
import * as Crypto from "expo-crypto";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuthButton() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();

  // Detect Expo Go vs. real build
  const isExpoGo = Constants.appOwnership === "expo";
  const scheme = Constants.expoConfig?.scheme ?? "hayotush";

  // Generate secure state parameter for CSRF protection
  const [state, setState] = React.useState(null);

  // Use HTTPS redirect URI for OAuth (required by Google)
  const redirectUri = "https://api.hayotush.com/api/auth/google/callback";

  // Debug: Log the redirectUri being used (temporarily enabled for debugging)
  console.log("🔧 OAuth Config:", {
    isExpoGo,
    scheme,
    redirectUri,
  });

  // Google client IDs from app config (see app.json in step 2)
  const expoClientId =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID ??
    Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const androidClientId =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const iosClientId =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const webClientId =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  console.log("🔧 Client IDs:", {
    expoClientId: expoClientId,
    androidClientId: androidClientId,
    iosClientId: iosClientId,
    webClientId: webClientId,
  });

  // Generate secure state parameter on component mount
  React.useEffect(() => {
    const generateState = async () => {
      const randomState = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString(),
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );
      setState(randomState);
    };
    generateState();
  }, []);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId, // חשוב בפרוקסי
    androidClientId: androidClientId, // נדרש עבור Android
    iosClientId: iosClientId, // נדרש עבור iOS
    webClientId: webClientId, // נדרש עבור Web
    usePKCE: true,
    state: state, // CSRF protection
    scopes: ["openid", "email", "profile"],
    // Secure parameters
    extraParams: {
      access_type: "offline",
      prompt: "select_account", // Force account selection
      include_granted_scopes: "true", // Enable incremental auth
    },
    redirectUri,
  });

  React.useEffect(() => {
    (async () => {
      if (response?.type === "success") {
        const { code, state: returnedState } = response.params;

        console.log("🔍 OAuth Response params:", {
          code: code ? code.substring(0, 20) + "..." : "missing",
          state: returnedState
            ? returnedState.substring(0, 20) + "..."
            : "missing",
          full_response_params: response.params,
        });

        // Verify state parameter to prevent CSRF attacks
        if (state && returnedState !== state) {
          console.error("❌ State parameter mismatch - possible CSRF attack");
          return;
        }

        // Pick the exact clientId that initiated the flow, so the backend can use the matching OAuth client
        const activeClientId = isExpoGo
          ? expoClientId
          : Platform.OS === "ios"
          ? iosClientId || webClientId
          : androidClientId || webClientId; // Use proper Android client ID

        // Force redirectUri to be sure it's sent
        const finalRedirectUri =
          redirectUri || "https://api.hayotush.com/api/auth/google/callback";

        console.log("🔍 About to send to loginWithGoogle:", {
          code: code ? code.substring(0, 20) + "..." : "missing",
          redirectUri: finalRedirectUri,
          clientId: activeClientId,
          platform: Platform.OS,
          state: returnedState
            ? returnedState.substring(0, 20) + "..."
            : "missing",
        });

        try {
          const result = await loginWithGoogle({
            code,
            redirectUri: finalRedirectUri,
            clientId: activeClientId,
            platform: Platform.OS,
            state: returnedState, // Include state for backend verification
            // No codeVerifier - PKCE is disabled
          });

          if (result?.success) {
            router.replace("/(tabs)/home");
          }
        } catch (e) {
          console.error("❌ Google OAuth exchange failed:", e);
        }
      } else if (response?.type === "error") {
        console.error("❌ Google OAuth error:", response.error);

        // Handle specific certificate errors
        if (
          response.error?.includes("certificate") ||
          response.error?.includes("SSL") ||
          response.error?.includes("NETWORK_ERROR")
        ) {
          console.log("🔒 Certificate/Network error detected");
          // You could show a user-friendly message here
          // Alert.alert("בעיית חיבור", "יש בעיה עם התעודה. נסה שוב או השתמש באימות רגיל");
        }
      } else if (response?.type === "cancel") {
        console.log("🚫 Google OAuth cancelled");
      }
    })();
  }, [response, state]);

  // hide the button if clientId for current platform is missing
  const missingId =
    (isExpoGo && !expoClientId) ||
    (!isExpoGo &&
      ((Platform.OS === "android" && !androidClientId && !webClientId) ||
        (Platform.OS === "ios" && !iosClientId && !webClientId)));

  if (missingId) {
    // console.error("Missing Google clientId for current platform");
    return null;
  }

  const handlePress = async () => {
    // console.log("📱 About to open OAuth with:");
    // console.log("  redirectUri:", redirectUri);
    // console.log(
    //   "  activeClientId:",
    //   isExpoGo
    //     ? expoClientId
    //     : Platform.OS === "ios"
    //     ? iosClientId
    //     : androidClientId
    // );
    // console.log("  useProxy: true");

    try {
      // Use secure authentication flow
      await promptAsync({
        useProxy: false, // Don't use proxy
        showInRecents: false, // Don't show in recent apps for security
        preferEphemeralSession: true, // Don't persist session
        // Additional security options
        additionalParameters: {
          hd: "hayotush.com", // Restrict to your domain (if applicable)
        },
      });
    } catch (error) {
      console.error("OAuth error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      // Handle certificate/SSL errors specifically
      if (
        error.message?.includes("certificate") ||
        error.message?.includes("SSL") ||
        error.message?.includes("NETWORK_ERROR")
      ) {
        console.log("🔒 Certificate error in promptAsync");
        // You could show a user message here or try alternative approach
      }
    }
  };

  return (
    <Button
      icon="google"
      mode="outlined"
      disabled={!request}
      onPress={handlePress}
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
