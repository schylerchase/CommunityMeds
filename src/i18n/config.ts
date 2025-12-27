import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import es from './locales/es.json';
import zh from './locales/zh.json';
import tl from './locales/tl.json';
import vi from './locales/vi.json';
import ar from './locales/ar.json';
import ko from './locales/ko.json';
import ru from './locales/ru.json';
import fr from './locales/fr.json';
import hi from './locales/hi.json';
import pt from './locales/pt.json';
import ht from './locales/ht.json';

export const languages = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'zh', name: '中文', dir: 'ltr' },
  { code: 'tl', name: 'Tagalog', dir: 'ltr' },
  { code: 'vi', name: 'Tiếng Việt', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'ko', name: '한국어', dir: 'ltr' },
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
  { code: 'pt', name: 'Português', dir: 'ltr' },
  { code: 'ht', name: 'Kreyòl Ayisyen', dir: 'ltr' },
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      zh: { translation: zh },
      tl: { translation: tl },
      vi: { translation: vi },
      ar: { translation: ar },
      ko: { translation: ko },
      ru: { translation: ru },
      fr: { translation: fr },
      hi: { translation: hi },
      pt: { translation: pt },
      ht: { translation: ht },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
