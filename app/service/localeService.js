// services/localeService.js
import i18n from "../../services/i18n/index"; // עדכן את הנתיב בהתאם

export const getCurrentLanguage = () => i18n.language;

export const changeLanguage = (lang) => {
  return i18n.changeLanguage(lang);
};
