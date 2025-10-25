import { SIZING, FONTS, getColors } from "../../../theme/theme";
import { useTheme } from "../../../context/ThemeContext";

// פונקציה ליצירת styles דינמיים לפי מצב
export const createStyles = (isDark = false) => {
  const colors = getColors(isDark);

  return {
    petCard: {
      backgroundColor: colors.surface,
      borderRadius: SIZING.radius_md,
      padding: SIZING.padding,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: SIZING.margin * 2,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 2,
      width: "100%",
      marginRight: SIZING.margin,
    },
    petImage: {
      width: 70,
      height: 70,
      borderRadius: SIZING.radius_xl,
      marginRight: SIZING.margin,
    },
    petInfo: {
      flex: 1,
    },
    petName: {
      ...FONTS.h3,
      color: colors.text,
    },
    petType: {
      ...FONTS.body,
      color: colors.textSecondary,
    },
    chevron: {
      color: colors.textSecondary,
    },
  };
};

// ברירת מחדל - מצב בהיר
export default createStyles(false);
