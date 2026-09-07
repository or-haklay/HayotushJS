import React, { useEffect, useState } from "react";
import {
  PaperProvider,
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme as DarkTheme,
} from "react-native-paper";
import { Stack, SplashScreen, Redirect, useRouter } from "expo-router";
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
import Constants from "expo-constants";

// מונע ממסך הפתיחה להסתתר אוטומטית
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isLoading, user } = useAuth();
  const { isDark } = useTheme();
  const { i18n } = useTranslation();
  const rtl = useRTL();
  const router = useRouter();

  const colors = getColors(isDark);
  
  // Consent management - רק אם המשתמש מחובר
  const { needsConsent, requiredDocuments, acceptConsent } = useConsentCheck(!!user);
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
      let unsubscribeFirebase = null;
      let unsubscribeFirebaseNotificationOpened = null;

      // Initialize Firebase first
      const initializeServices = async () => {
        try {
          await firebaseService.initialize();
        } catch (error) {
          console.error("Firebase initialization failed:", error.message);
        }
      };

      initializeServices();

      // Initialize notification handlers
      const setupNotificationHandlers = async () => {
        try {
          // אתחל handlers להתראות
          await notificationService.initializeHandlers();

          // Handler לטיפול בלחיצה על התראה (Expo notifications)
          const handleNotificationResponse = (response) => {
            const data = response.notification.request.content.data;
            handleNotificationNavigation(data);
          };

          // Handler להתראה שהתקבלה בקדמת הבמה (Expo notifications)
          const handleNotificationReceived = (notification) => {
            // כאן אפשר לעדכן UI, להציג toast, וכו'
          };

          // הגדרת listeners להתראות Expo
          notificationService.setupListeners(
            handleNotificationReceived,
            handleNotificationResponse
          );

          // הגדרת Firebase foreground handler
          unsubscribeFirebase = await firebaseService.setupForegroundHandler((remoteMessage) => {
            // ההתראה תוצג אוטומטית דרך firebaseService
          });

          // הגדרת Firebase notification opened handler
          unsubscribeFirebaseNotificationOpened = await firebaseService.setupNotificationOpenedHandler((remoteMessage) => {
            const data = remoteMessage.data || {};
            handleNotificationNavigation(data);
          });
        } catch (error) {
          console.error("Error setting up notification handlers:", error);
        }
      };

      // פונקציה לטיפול בניווט לפי data של התראה
      const handleNotificationNavigation = (data) => {
        if (!data) return;

        try {
          // דוגמאות לניווט לפי סוג התראה
          if (data.route) {
            router.push(data.route);
          } else if (data.petId) {
            router.push(`/pets/${data.petId}`);
          } else if (data.walkId) {
            router.push(`/walks/walk-details?walkId=${data.walkId}`);
          } else if (data.reminderId) {
            // ניווט לתזכורות
            if (data.petId) {
              router.push(`/pets/${data.petId}/reminders`);
            }
          } else if (data.notificationId) {
            // ניווט למסך התראות או התראה ספציפית
            // כאן אפשר להוסיף לוגיקה נוספת
          }
          // אם אין data ספציפי, פשוט נשארים במסך הנוכחי
        } catch (error) {
          console.error("Error navigating from notification:", error);
        }
      };

      // בקש הרשאות התראות אוטומטית בכל כניסה מחדש
      const requestNotificationPermissions = async () => {
        try {
          // תמיד מבקשים הרשאות (הפונקציה בודקת בעצמה אם צריך לבקש)
          const hasPermission = await notificationService.requestPermissions();
          
          if (hasPermission) {
            // הגדרת handlers לאחר קבלת הרשאות
            await setupNotificationHandlers();

            // נסה לקבל push token (קודם מנסה טעינה מקומית, אחרת מקבל חדש)
            // אם יש token מקומי, הוא יישתמש בו (אותו token למכשיר)
            // אם אין token מקומי, יקבל חדש וישמור מקומית
            const token = await notificationService.getPushToken();
            if (token) {
              // תמיד שולחים את ה-token לשרת (מעדכן את ה-token למשתמש הנוכחי)
              // Token נשמר מקומית אוטומטית ב-getPushToken()
              try {
                await notificationService.sendPushTokenToServer(token);
              } catch (error) {
                console.error("Failed to send push token to server:", error);
              }
            }
          } else {
            // אם המשתמש לא נתן הרשאה, נמחק את ה-push token שלו מהשרת
            // אבל נשאיר אותו מקומית (אולי משתמש אחר נתן הרשאה)
            try {
              await notificationService.sendPushTokenToServer(null);
            } catch (error) {
              console.error("Failed to remove push token:", error);
            }
          }
        } catch (error) {
          console.error("Notification permission error:", error);
        }
      };
      
      // הפעל מיידית כשהמשתמש מתחבר
      requestNotificationPermissions();

      // עדכן פעילות בכניסה
      notificationService.updateLastActivity();

      // עדכן כל 10 דקות בזמן שימוש
      const interval = setInterval(() => {
        notificationService.updateLastActivity();
      }, 10 * 60 * 1000);

      return () => {
        clearInterval(interval);
        // ניקוי listeners
        notificationService.removeListeners();
        if (unsubscribeFirebase) {
          unsubscribeFirebase();
        }
        if (unsubscribeFirebaseNotificationOpened) {
          unsubscribeFirebaseNotificationOpened();
        }
      };
    }
  }, [user, router]);

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
