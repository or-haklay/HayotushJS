import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Alert } from "react-native";
import Constants from "expo-constants";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { COLORS, SIZING } from "../../theme/theme";

export default function GoogleAuthButton() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleSignInReady, setGoogleSignInReady] = useState(false);

  // Load Google Sign-In module dynamically
  useEffect(() => {
    let isMounted = true;
    
    const loadGoogleSignIn = async () => {
      try {
        let GoogleSignin;
        try {
          // Wrap in Promise.resolve to catch synchronous errors during module evaluation
          const module = await Promise.resolve().then(async () => {
            return await import("@react-native-google-signin/google-signin");
          });
          GoogleSignin = module?.GoogleSignin;
        } catch (importError) {
          // Handle the case where the module fails to initialize due to missing native module
          const errorMessage = importError?.message || '';
          const errorName = importError?.name || '';
          
          if (errorMessage.includes('TurboModuleRegistry') || 
              errorMessage.includes('RNGoogleSignin') ||
              errorMessage.includes('could not be found') ||
              errorName === 'Invariant Violation') {
            return; // Button will be hidden
          }
          throw importError;
        }
        
        if (!GoogleSignin) {
          return; // Button will be hidden
        }
        
        const webClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
        const iosClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

        if (webClientId && isMounted && GoogleSignin) {
          GoogleSignin.configure({
            webClientId: webClientId, // Required for server-side auth
            iosClientId: iosClientId, // Optional for iOS
            offlineAccess: true, // Required to get serverAuthCode
            forceCodeForRefreshToken: true, // Force to get fresh authorization code
            scopes: ['profile', 'email'],
          });
          setGoogleSignInReady(true);
        }
      } catch (error) {
        // Handle any other errors
        const errorMessage = error?.message || '';
        const errorName = error?.name || '';
        
        if (errorMessage.includes('TurboModuleRegistry') || 
            errorMessage.includes('RNGoogleSignin') ||
            errorMessage.includes('could not be found    ') ||
            errorName === 'Invariant Violation') {
          // Module not linked - silent fail
        } else {
          // Module not available - silent fail
        }
        // Module not available - button will be hidden
      }
    };

    loadGoogleSignIn();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      
      // Dynamically import GoogleSignin
      let GoogleSignin, statusCodes;
      try {
        // Wrap in Promise.resolve to catch synchronous errors during module evaluation
        const module = await Promise.resolve().then(async () => {
          return await import("@react-native-google-signin/google-signin");
        });
        GoogleSignin = module?.GoogleSignin;
        statusCodes = module?.statusCodes;
      } catch (importError) {
        // Handle the case where the module fails to initialize due to missing native module
        const errorMessage = importError?.message || '';
        const errorName = importError?.name || '';
        
        if (errorMessage.includes('TurboModuleRegistry') || 
            errorMessage.includes('RNGoogleSignin') ||
            errorMessage.includes('could not be found') ||
            errorName === 'Invariant Violation') {
          Alert.alert(
            "שגיאה", 
            "מודול Google Sign-In אינו מחובר.\nאנא בנה מחדש את האפליקציה:\nnpx expo run:android"
          );
          return;
        }
        throw importError;
      }
      
      if (!GoogleSignin) {
        Alert.alert("שגיאה", "מודול Google Sign-In לא זמין");
        return;
      }
      
      await GoogleSignin.hasPlayServices();
      
      // Sign out first to force account picker on next sign in
      // Try to check if signed in, and sign out if needed
      try {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          await GoogleSignin.signOut();
        }
      } catch (error) {
        // If isSignedIn is not available or throws error, just try signOut anyway
        try {
          await GoogleSignin.signOut();
        } catch (signOutError) {
          // Ignore signOut errors - might not be signed in
        }
      }
      
      // Sign in - this will now show account picker since we signed out
      const response = await GoogleSignin.signIn();

      // Get tokens
      const tokens = await GoogleSignin.getTokens();
      const idToken = response.idToken || tokens?.idToken;
      
      if (idToken) {
        const result = await loginWithGoogle({
          idToken,
        });

        if (result?.success) {
          router.replace("/(tabs)/home");
        }
      }
    } catch (error) {
      // Try to get statusCodes for error handling
      let statusCodes = null;
      try {
        const module = await Promise.resolve().then(async () => {
          return await import("@react-native-google-signin/google-signin");
        });
        statusCodes = module?.statusCodes;
      } catch {}

      if (statusCodes && error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled - no need to show error
        return;
      } else if (statusCodes && error.code === statusCodes.IN_PROGRESS) {
        Alert.alert("התחברות", "התחברות כבר מתבצעת...");
      } else if (statusCodes && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("שגיאה", "שירותי Google Play אינם זמינים");
      } else {
        // Check for DEVELOPER_ERROR
        const errorMessage = error.message || "";
        if (errorMessage.includes("DEVELOPER_ERROR")) {
          Alert.alert(
            "שגיאת התחברות",
            "שגיאת DEVELOPER_ERROR:\n\n" +
            "ה-SHA-1 fingerprint לא רשום ב-Google Cloud Console.\n\n" +
            "פתרון:\n" +
            "1. הרץ: .\\scripts\\get-debug-sha1.ps1\n" +
            "2. הוסף את ה-SHA-1 ל-Google Cloud Console\n" +
            "3. בנה מחדש: npm run android\n\n" +
            "למידע נוסף:\n" +
            "https://react-native-google-signin.github.io/docs/troubleshooting"
          );
        } else {
          Alert.alert("שגיאת התחברות", errorMessage || "אירעה שגיאה בהתחברות עם Google");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hide button if Google Sign-In is not ready
  if (!googleSignInReady) {
    return null;
  }

  return (
    <Button
      icon="google"
      mode="outlined"
      disabled={isSubmitting}
      loading={isSubmitting}
      onPress={handleGoogleSignIn}
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


