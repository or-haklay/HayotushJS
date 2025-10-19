import React, { useEffect } from "react";
import {
  PaperProvider,
  MD3LightTheme as DefaultTheme,
} from "react-native-paper";
import { Stack, SplashScreen } from "expo-router";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import { COLORS, SIZING } from "../theme/theme";
import { useFonts } from "expo-font";
import "../services/i18n"; // Import i18n configuration
import ToastProvider from "../context/ToastContext";
import notificationService from "../services/notificationService";

// מונע ממסך הפתיחה להסתתר אוטומטית
SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  roundness: SIZING.radius_sm,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.white,
  },
};

export default function RootLayout() {
  const { isLoading, user } = useAuth();

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

  // עדכון פעילות משתמש
  useEffect(() => {
    if (user) {
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
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <ToastProvider>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </ToastProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
