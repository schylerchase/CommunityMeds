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
import ne from './locales/ne.json';
import sw from './locales/sw.json';
import so from './locales/so.json';
import bo from './locales/bo.json';
import kar from './locales/kar.json';
import ymm from './locales/ymm.json';
import he from './locales/he.json';

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
  { code: 'ne', name: 'नेपाली', dir: 'ltr' },
  { code: 'sw', name: 'Kiswahili', dir: 'ltr' },
  { code: 'so', name: 'Soomaali', dir: 'ltr' },
  { code: 'bo', name: 'བོད་སྐད', dir: 'ltr' },
  { code: 'kar', name: 'ကညီ', dir: 'ltr' },
  { code: 'ymm', name: 'Maay Maay', dir: 'ltr' },
  { code: 'he', name: 'עברית', dir: 'rtl' },
] as const;

// Supported language codes for matching
const supportedLngs = ['en', 'es', 'zh', 'tl', 'vi', 'ar', 'ko', 'ru', 'fr', 'hi', 'pt', 'ht', 'ne', 'sw', 'so', 'bo', 'kar', 'ymm', 'he'];

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
      ne: { translation: ne },
      sw: { translation: sw },
      so: { translation: so },
      bo: { translation: bo },
      kar: { translation: kar },
      ymm: { translation: ymm },
      he: { translation: he },
    },
    supportedLngs,
    fallbackLng: 'en',
    // Handle language codes like 'en-US' -> 'en', 'zh-CN' -> 'zh'
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Order of detection: saved preference first, then browser language
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      // Look for language in these navigator properties
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
