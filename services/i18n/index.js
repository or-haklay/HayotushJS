// app/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import he from "./locales/he.json";
import en from "./locales/en.json";

// טעינת שפה שנשמרה או ברירת מחדל מהמכשיר
const loadLanguage = async () => {
  const savedLang = await AsyncStorage.getItem("appLanguage");
  return savedLang || Localization.locale?.split?.("-")[0] || "he";
};

loadLanguage().then((lang) => {
  i18n.use(initReactI18next).init({
    compatibilityJSON: "v3",
    lng: lang,
    fallbackLng: "he",
    resources: {
      he: { translation: he },
      en: { translation: en },
    },
    interpolation: { escapeValue: false },
  });
});

export const setLanguage = async (lang) => {
  await AsyncStorage.setItem("appLanguage", lang);
  i18n.changeLanguage(lang);
};

export default i18n;
