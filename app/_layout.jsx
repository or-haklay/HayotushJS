import React, { useEffect } from "react";
import {
  PaperProvider,
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme as DarkTheme,
} from "react-native-paper";
import { Stack, SplashScreen, Redirect } from "expo-router";
import { View } from "react-native";
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
import notificationService from "../services/notificationService";

// מונע ממסך הפתיחה להסתתר אוטומטית
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isLoading, user } = useAuth();
  const { isDark } = useTheme();

  const colors = getColors(isDark);

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
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <PaperProvider theme={theme}>
        <ToastProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            {user ? (
              // User is authenticated - show main app
              <>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="pets" />
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
