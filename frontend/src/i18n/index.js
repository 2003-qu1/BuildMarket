import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './en.json';
import translationAR from './ar.json';

const resources = {
  en: {
    translation: translationEN
  },
  ar: {
    translation: translationAR
  }
};

const savedLang = localStorage.getItem('i18nextLng') || 'ar';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang.startsWith('en') ? 'en' : 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

// Synchronize document dir and lang on change
function updateDirection(lang) {
  const isArabic = lang.startsWith('ar');
  document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  document.documentElement.lang = isArabic ? 'ar' : 'en';
  if (isArabic) {
    document.documentElement.classList.add('font-arabic');
  } else {
    document.documentElement.classList.remove('font-arabic');
  }
}

// Initial setup
updateDirection(i18n.language || savedLang);

i18n.on('languageChanged', (lng) => {
  updateDirection(lng);
});

export default i18n;
