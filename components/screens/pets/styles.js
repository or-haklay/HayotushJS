import { StyleSheet } from "react-native";
import { COLORS, SIZING, FONTS } from "../../../theme/theme";

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SIZING.padding,
    backgroundColor: COLORS.background,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.neutral,
    marginBottom: SIZING.margin,
  },
  input: {
    marginBottom: SIZING.base,
  },
  button: {
    marginTop: SIZING.margin,
    backgroundColor: COLORS.dark,
  },
});
