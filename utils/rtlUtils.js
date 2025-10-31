import { I18nManager } from "react-native";
import i18n from "../services/i18n";

/**
 * Get current RTL state based on I18nManager or language
 * @returns {boolean} True if RTL, false if LTR
 */
export const getIsRTL = () => {
  const language = i18n.language;
  return I18nManager.isRTL || language?.toLowerCase().startsWith("he");
};

/**
 * Get direction value ("rtl" or "ltr")
 * @returns {string} "rtl" or "ltr"
 */
export const getDirection = () => {
  return getIsRTL() ? "rtl" : "ltr";
};

/**
 * Get text align value ("right" or "left")
 * @returns {string} "right" or "left"
 */
export const getTextAlign = () => {
  return getIsRTL() ? "right" : "left";
};

/**
 * Get flex direction for row layouts ("row-reverse" or "row")
 * @returns {string} "row-reverse" or "row"
 */
export const getFlexDirection = () => {
  return getIsRTL() ? "row-reverse" : "row";
};

/**
 * Get writing direction value ("rtl" or "ltr")
 * @returns {string} "rtl" or "ltr"
 */
export const getWritingDirection = () => {
  return getIsRTL() ? "rtl" : "ltr";
};


