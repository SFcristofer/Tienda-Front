import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import translationES from './locales/es-MX/translation.json';
import translationEN from './locales/en/translation.json';

// The translations
const resources = {
  'es-MX': {
    translation: translationES,
  },
  'en': {
    translation: translationEN,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'es-MX', // Default language
  fallbackLng: 'es-MX',
  interpolation: {
    escapeValue: false, // React already safes from xss
  },
});

export default i18n;