import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    // サポート言語を明示し、"en-US" などのロケール付きコードを "en"/"ja" に正規化する
    // (これにより i18n.language === "en" 等の比較が確実に機能する)
    supportedLngs: ["en", "ja"],
    load: "languageOnly",
    debug: import.meta.env.DEV,
    ns: ["translations"],
    defaultNS: "translations",

    detection: {
      caches: ["localStorage"],
      order: ["localStorage", "navigator"],
    },

    backend: {
      // 相対パスを使用
      loadPath: "./locales/{{lng}}/{{ns}}.json",
    },

    react: {
      useSuspense: false, // Suspenseを無効化して問題を回避
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
