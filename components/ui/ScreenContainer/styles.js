import { getColors } from "../../../theme/theme";

export const createStyles = (isDark = false) => {
  const colors = getColors(isDark);

  return {
    safeContainer: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  };
};

// ברירת מחדל - מצב בהיר
export default createStyles(false);
