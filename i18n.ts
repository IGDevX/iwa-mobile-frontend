import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Platform } from "react-native";

import en from "./locales/en.json";
import fr from "./locales/fr.json";

const LANGUAGE_KEY = "appLanguage";

// detect device language
const deviceLanguage = Localization.getLocales()[0].languageCode;

// Helper function to safely get stored language
const getStoredLanguage = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    // Use localStorage for web
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(LANGUAGE_KEY);
    }
    return null;
  } else {
    // Use AsyncStorage for native platforms
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  }
};

// Helper function to safely store language
const storeLanguage = async (language: string): Promise<void> => {
  if (Platform.OS === 'web') {
    // Use localStorage for web
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LANGUAGE_KEY, language);
    }
  } else {
    // Use AsyncStorage for native platforms
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    compatibilityJSON: "v4",
    lng: deviceLanguage === "fr" ? "fr" : "en", // default language
    fallbackLng: "en",
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    interpolation: {
      escapeValue: false,
    },
  })
  .then(async () => {
    try {
      // Load saved language from storage if available
      const savedLang = await getStoredLanguage();
      if (savedLang && savedLang !== i18n.language) {
        i18n.changeLanguage(savedLang);
      }
    } catch (error) {
      console.warn('Failed to load saved language:', error);
    }
  });

// save language whenever it changes
i18n.on("languageChanged", (lng) => {
  storeLanguage(lng).catch((error) => {
    console.warn('Failed to save language:', error);
  });
});

export default i18n;
