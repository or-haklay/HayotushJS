import { SIZING, FONTS, getColors } from "../../../theme/theme";

export const createStyles = (isDark = false) => {
  const colors = getColors(isDark);

  return {
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: SIZING.padding,
      paddingVertical: SIZING.base,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    backButton: {
      marginRight: SIZING.base,
      color: colors.textSecondary,
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    logoImage: {
      width: 40,
      height: 40,
    },
    logoText: {
      ...FONTS.h3,
      fontFamily: "Rubik",
      color: colors.text,
      marginLeft: SIZING.base,
    },
    title: {
      ...FONTS.h2,
      color: colors.text,
      flex: 1,
    },
    rightIcon: {
      color: colors.accent,
    },
  };
};

// ברירת מחדל - מצב בהיר
export default createStyles(false);
