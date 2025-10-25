import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { getColors } from "./theme";

// פונקציה ליצירת Paper Theme לפי מצב
export const getPaperTheme = (isDark = false) => {
  const colors = getColors(isDark);
  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      secondary: colors.accent,
      background: colors.background,
      surface: colors.surface,
      surfaceVariant: colors.card,
      error: colors.error,
      onSurface: colors.text,
      onBackground: colors.text,
      onSurfaceVariant: colors.textSecondary,
      outline: colors.border,
      outlineVariant: colors.border,
      // צבעים נוספים למצב חשוך
      ...(isDark && {
        surfaceContainer: colors.card,
        surfaceContainerHigh: colors.surface,
        surfaceContainerHighest: colors.surface,
        surfaceContainerLow: colors.background,
        surfaceContainerLowest: colors.background,
        onSurfaceVariant: colors.textSecondary,
        inverseSurface: colors.white,
        inverseOnSurface: colors.black,
        inversePrimary: colors.primary,
        shadow: colors.shadow,
        scrim: colors.shadow,
        surfaceTint: colors.primary,
      }),
    },
    roundness: 12,
  };
};

// ברירת מחדל - מצב בהיר
export const PAPER_THEME = getPaperTheme(false);
