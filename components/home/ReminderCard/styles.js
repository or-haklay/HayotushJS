import { SIZING, FONTS, getColors } from "../../../theme/theme";

export const createStyles = (isDark = false) => {
  const colors = getColors(isDark);

  return {
    reminderCard: {
      padding: SIZING.padding,
      borderRadius: SIZING.radius_lg,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SIZING.margin * 2,
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
    },
    reminderTextContainer: {
      flex: 1,
    },
    reminderText: {
      ...FONTS.body,
      fontFamily: "Rubik",
      fontSize: 16,
      color: colors.white,
    },
    reminderPetName: {
      ...FONTS.h3,
      color: colors.white,
      marginVertical: SIZING.base / 2,
    },
    reminderButton: {
      paddingVertical: SIZING.base,
      paddingHorizontal: SIZING.padding,
      borderRadius: SIZING.radius_md,
      elevation: 2,
      alignSelf: "flex-end",
      backgroundColor: colors.accent,
    },
    reminderButtonText: {
      ...FONTS.body,
      fontFamily: "Rubik",
      color: colors.primary,
      fontWeight: "bold",
    },
  };
};

// ברירת מחדל - מצב בהיר
export default createStyles(false);
