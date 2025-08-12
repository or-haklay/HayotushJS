import React from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { Button } from "react-native-paper";
import authService from "../../services/authService";

WebBrowser.maybeCompleteAuthSession();

const googleDiscovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
};

export default function GoogleAuthButton() {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  // 👇 קבע מפורשות את ה-Expo Proxy שלך (כבר רשמת אותו בגוגל)
  const redirectUri = "https://auth.expo.io/@orhaklay/hayotush";

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      scopes: ["openid", "email", "profile"],
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
          await authService.oauthLogin("google", {
            code,
            codeVerifier: request?.codeVerifier,
            redirectUri: "https://auth.expo.io/@orhaklay/hayotush",
            clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // לא חובה, עוזר ללוגים
          });
          // router.replace("/(tabs)/home")
        } catch (e) {
          console.log("Google OAuth failed", e?.response?.data || e.message);
        }
      }
    })();
  }, [response]);
  console.log({
    clientId,
    codeVerifierExists: !!request?.codeVerifier,
    redirectUri,
  });

  return (
    <Button
      icon="google"
      mode="outlined"
      disabled={!request}
      onPress={() => promptAsync({ useProxy: true })} // חשוב להשאיר useProxy כאן
    >
      Continue with Google
    </Button>
  );
}
