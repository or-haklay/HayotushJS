import React, { useEffect, useState } from "react";
import {
  PaperProvider,
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme as DarkTheme,
} from "react-native-paper";
import { Stack, SplashScreen, Redirect } from "expo-router";
import { View, I18nManager } from "react-native";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import { COLORS, SIZING, getColors } from "../theme/theme";
import { useFonts } from "expo-font";
import "../services/i18n"; // Import i18n configuration
import ToastProvider from "../context/ToastContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { WalkProvider } from "../context/WalkContext";
import notificationService from "../services/notificationService";
import firebaseService from "../services/firebaseService";
import { useTranslation } from "react-i18next";
import { useRTL } from "../hooks/useRTL";
import ConsentUpdateModal from "../components/modals/ConsentUpdateModal";
import useConsentCheck from "../hooks/useConsentCheck";
import { consentEvents } from "../services/httpServices";

// מונע ממסך הפתיחה להסתתר אוטומטית
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isLoading, user } = useAuth();
  const { isDark } = useTheme();
  const { i18n } = useTranslation();
  const rtl = useRTL();

  const colors = getColors(isDark);
  
  // Consent management
  const { needsConsent, requiredDocuments, acceptConsent } = useConsentCheck();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentLoading, setConsentLoading] = useState(false);
  const [modalDocuments, setModalDocuments] = useState(null);

  // Handle consent requirement from API interceptor
  useEffect(() => {
    const handleConsentRequired = (data) => {
      setModalDocuments(data.requiredDocuments);
      setShowConsentModal(true);
    };

    consentEvents.on("consentRequired", handleConsentRequired);

    return () => {
      consentEvents.off("consentRequired", handleConsentRequired);
    };
  }, []);

  // Check consent status on mount if user is logged in
  useEffect(() => {
    if (user && needsConsent) {
      setModalDocuments(requiredDocuments);
      setShowConsentModal(true);
    }
  }, [user, needsConsent, requiredDocuments]);

  const handleAcceptConsent = async (versions) => {
    try {
      setConsentLoading(true);
      await acceptConsent(versions);
      setShowConsentModal(false);
    } catch (error) {
      console.error("Error accepting consent:", error);
      alert("שגיאה באישור התנאים. אנא נסה שוב.");
    } finally {
      setConsentLoading(false);
    }
  };

  // Ensure RTL is applied at root level
  useEffect(() => {
    const isRTL = i18n.language?.toLowerCase().startsWith("he");
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }
  }, [i18n.language]);

  const theme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    roundness: SIZING.radius_sm,
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      secondary: colors.accent,
      background: colors.background,
      surface: colors.surface,
      onSurface: colors.text,
      onBackground: colors.text,
    },
  };

  const [fontsLoaded, fontError] = useFonts({
    Rubik: require("../assets/fonts/Rubik.ttf"),
    Heebo: require("../assets/fonts/Heebo.ttf"),
    NotoSansHebrew: require("../assets/fonts/NotoSansHebrew.ttf"),
  });

  useEffect(() => {
    if (!isLoading && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, fontsLoaded, fontError]);

  // עדכון פעילות משתמש ובקשת הרשאות התראות
  useEffect(() => {
    if (user) {
      // Initialize Firebase first
      const initializeServices = async () => {
        try {
          console.log("🔥 Initializing Firebase...");
          await firebaseService.initialize();
        } catch (error) {
          console.log("🔥 Firebase initialization failed:", error.message);
        }
      };

      initializeServices();

      // בקש הרשאות התראות אוטומטית אחרי התחברות
      const requestNotificationPermissions = async () => {
        try {
          console.log("🔔 Requesting notification permissions...");
          const hasPermission = await notificationService.requestPermissions();
          if (hasPermission) {
            console.log("✅ Notification permissions granted");
            const token = await notificationService.getPushToken();
            if (token) {
              console.log("📱 Push token received:", token);
              // שליחת ה-token לשרת
              try {
                await notificationService.sendPushTokenToServer(token);
                console.log("✅ Push token sent to server successfully");
              } catch (error) {
                console.error("❌ Failed to send push token to server:", error);
              }
            } else {
              console.log("⚠️ No push token received (might be Expo Go or emulator)");
            }
          } else {
            console.log("❌ Notification permissions denied");
          }
        } catch (error) {
          console.error("🔔 Notification permission error:", error);
        }
      };
      
      requestNotificationPermissions();

      // עדכן פעילות בכניסה
      notificationService.updateLastActivity();

      // עדכן כל 10 דקות בזמן שימוש
      const interval = setInterval(() => {
        notificationService.updateLastActivity();
      }, 10 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [user]);

  if (isLoading || (!fontsLoaded && !fontError)) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <PaperProvider theme={theme}>
        <ToastProvider>
          <WalkProvider>
            <View style={{ flex: 1, direction: rtl.direction }}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background, direction: rtl.direction },
                }}
              >
              {user ? (
                // User is authenticated - show main app
                <>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="pets" />
                  <Stack.Screen name="walks" />
                  <Stack.Screen name="welcome" />
                </>
              ) : (
                // User is not authenticated - show auth screens
                <>
                  <Stack.Screen name="welcome" />
                  <Stack.Screen name="(auth)" />
                </>
              )}
              </Stack>
              
              {/* Consent Update Modal */}
              <ConsentUpdateModal
                visible={showConsentModal}
                onAccept={handleAcceptConsent}
                requiredDocuments={modalDocuments}
                loading={consentLoading}
              />
            </View>
          </WalkProvider>
        </ToastProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
