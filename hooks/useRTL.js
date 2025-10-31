import { useMemo, useEffect } from "react";
import { I18nManager } from "react-native";
import { useTranslation } from "react-i18next";

/**
 * Hook to get RTL/LTR direction utilities based on current app language
 * @returns {Object} Object with isRTL, direction, textAlign, flexDirection, writingDirection
 */
export const useRTL = () => {
  const { i18n } = useTranslation();
  const language = i18n?.language || "he";

  // Ensure I18nManager is set correctly
  useEffect(() => {
    const shouldBeRTL = language?.toLowerCase().startsWith("he");
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    }
  }, [language]);

  return useMemo(() => {
    // Check both I18nManager and language code
    const isRTL = I18nManager.isRTL || language?.toLowerCase().startsWith("he");
    
    return {
      isRTL,
      direction: isRTL ? "rtl" : "ltr",
      textAlign: isRTL ? "right" : "left",
      flexDirection: isRTL ? "row-reverse" : "row",
      writingDirection: isRTL ? "rtl" : "ltr",
      // For column layouts, we still use "column" regardless of RTL
      flexDirectionColumn: "column",
    };
  }, [language]);
};


