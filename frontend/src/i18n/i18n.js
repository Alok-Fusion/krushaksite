import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslations from "./en.json";
import hiTranslations from "./hi.json";
import mrTranslations from "./mr.json";

const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
  mr: { translation: mrTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "hi", "mr"],
    load: "languageOnly",
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "krushak_language",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false, // React already protects against XSS
    },
    react: {
      useSuspense: false,
    },
  });

// Synchronize HTML document lang attribute
const syncHtmlLang = (lng) => {
  if (typeof document !== "undefined") {
    const primary = (lng || "en").split("-")[0];
    document.documentElement.lang = primary;
    if (primary === "hi" || primary === "mr") {
      document.body.classList.add("font-devanagari");
    } else {
      document.body.classList.remove("font-devanagari");
    }
  }
};

i18n.on("languageChanged", (lng) => {
  syncHtmlLang(lng);
  try {
    localStorage.setItem("krushak_language", lng);
  } catch (e) {
    // LocalStorage fallback
  }
});

// Initial synchronization
syncHtmlLang(i18n.language || "en");

export default i18n;
