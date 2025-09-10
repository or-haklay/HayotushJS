// app/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";
import Constants from "expo-constants";

import he from "./locales/he.json";
import en from "./locales/en.json";

// Determine if language should be RTL
const isRtlLanguage = (lang) => lang && lang.toLowerCase().startsWith("he");

// Ensure direction matches selected language, reload only when safe
let didForceReloadForDirection = false;
const ensureDirection = async (lang) => {
  const shouldBeRTL = isRtlLanguage(lang);
  if (I18nManager.isRTL !== shouldBeRTL) {
    const isExpoGo =
      Constants.executionEnvironment === "storeClient" ||
      Constants.appOwnership === "expo";

    // Always allow RTL, but avoid forceRTL (which reloads the app) in dev/Expo Go
    I18nManager.allowRTL(shouldBeRTL);
    if (!__DEV__ && !isExpoGo) {
      I18nManager.forceRTL(shouldBeRTL);
      if (!didForceReloadForDirection) {
        didForceReloadForDirection = true;
        try {
          await Updates.reloadAsync();
        } catch (e) {
          // ignore in case reload isn't available
        }
      }
    }
  }
};

// טעינת שפה שנשמרה או ברירת מחדל מהמכשיר
const loadLanguage = async () => {
  const savedLang = await AsyncStorage.getItem("appLanguage");
  return savedLang || Localization.locale?.split?.("-")[0] || "he";
};

loadLanguage().then(async (lang) => {
  await ensureDirection(lang);
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
  await ensureDirection(lang);
  i18n.changeLanguage(lang);
};

export default i18n;
