import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import fr from "./locales/fr.json";

const LANGUAGE_KEY = "appLanguage";

// detect device language
const deviceLanguage = Localization.getLocales()[0].languageCode;

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
    // Load saved language from AsyncStorage if available
    const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  });

// save language whenever it changes
i18n.on("languageChanged", (lng) => {
  AsyncStorage.setItem(LANGUAGE_KEY, lng);
});

export default i18n;
