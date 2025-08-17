import { MD3LightTheme as DefaultTheme } from "react-native-paper";
import { COLORS } from "./theme";

export const PAPER_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.white,
    error: COLORS.error,
    onSurface: COLORS.black,
    outline: COLORS.neutral,
  },
  roundness: 12,
};
