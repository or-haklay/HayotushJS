import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../hooks/useAuth";

export default function AuthCallback() {
  const router = useRouter();
  const { code, state, error, code_verifier } = useLocalSearchParams();
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (error) {
          console.error("Auth error:", error);
          router.replace("/(auth)/login");
          return;
        }

        if (code) {
          console.log("🔍 Auth callback params:", {
            code: code ? code.substring(0, 20) + "..." : "missing",
            state: state ? state.substring(0, 20) + "..." : "missing",
            code_verifier: code_verifier
              ? code_verifier.substring(0, 20) + "..."
              : "missing",
            code_verifier_length: code_verifier ? code_verifier.length : 0,
            all_params: { code, state, error, code_verifier },
          });

          // Call the login function with the code
          await loginWithGoogle({ code, state, codeVerifier: code_verifier });

          // Redirect to home after successful login
          router.replace("/(tabs)/home");
        } else {
          console.error("No authorization code received");
          router.replace("/(auth)/login");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        router.replace("/(auth)/login");
      }
    };

    handleAuthCallback();
  }, [code, state, error, loginWithGoogle, router]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 16, fontSize: 16 }}>מתחבר...</Text>
    </View>
  );
}
