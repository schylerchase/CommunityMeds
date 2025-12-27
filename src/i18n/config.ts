import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all locale files
import en from './locales/en.json';
import es from './locales/es.json';
import zh from './locales/zh.json';
import zhTW from './locales/zh-TW.json';
import tl from './locales/tl.json';
import vi from './locales/vi.json';
import ar from './locales/ar.json';
import ko from './locales/ko.json';
import ru from './locales/ru.json';
import fr from './locales/fr.json';
import frCA from './locales/fr-CA.json';
import hi from './locales/hi.json';
import pt from './locales/pt.json';
import ptBR from './locales/pt-BR.json';
import ht from './locales/ht.json';
import ne from './locales/ne.json';
import sw from './locales/sw.json';
import so from './locales/so.json';
import bo from './locales/bo.json';
import kar from './locales/kar.json';
import ymm from './locales/ymm.json';
import he from './locales/he.json';
import prs from './locales/prs.json';
import my from './locales/my.json';
import uk from './locales/uk.json';
import ln from './locales/ln.json';
import sm from './locales/sm.json';
import af from './locales/af.json';
import am from './locales/am.json';
import az from './locales/az.json';
import be from './locales/be.json';
import bg from './locales/bg.json';
import bn from './locales/bn.json';
import bs from './locales/bs.json';
import ceb from './locales/ceb.json';
import cnh from './locales/cnh.json';
import cs from './locales/cs.json';
import da from './locales/da.json';
import de from './locales/de.json';
import el from './locales/el.json';
import et from './locales/et.json';
import fa from './locales/fa.json';
import fi from './locales/fi.json';
import gu from './locales/gu.json';
import hil from './locales/hil.json';
import hmn from './locales/hmn.json';
import hr from './locales/hr.json';
import hu from './locales/hu.json';
import hy from './locales/hy.json';
import id from './locales/id.json';
import ig from './locales/ig.json';
import ilo from './locales/ilo.json';
import is from './locales/is.json';
import it from './locales/it.json';
import ja from './locales/ja.json';
import jv from './locales/jv.json';
import ka from './locales/ka.json';
import kk from './locales/kk.json';
import km from './locales/km.json';
import kn from './locales/kn.json';
import ky from './locales/ky.json';
import lo from './locales/lo.json';
import lt from './locales/lt.json';
import lv from './locales/lv.json';
import mh from './locales/mh.json';
import mk from './locales/mk.json';
import mn from './locales/mn.json';
import mr from './locales/mr.json';
import ms from './locales/ms.json';
import nl from './locales/nl.json';
import no from './locales/no.json';
import nv from './locales/nv.json';
import om from './locales/om.json';
import pa from './locales/pa.json';
import pl from './locales/pl.json';
import ps from './locales/ps.json';
import rn from './locales/rn.json';
import ro from './locales/ro.json';
import rw from './locales/rw.json';
import sk from './locales/sk.json';
import sl from './locales/sl.json';
import sq from './locales/sq.json';
import sr from './locales/sr.json';
import sv from './locales/sv.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import th from './locales/th.json';
import ti from './locales/ti.json';
import tr from './locales/tr.json';
import ur from './locales/ur.json';
import uz from './locales/uz.json';
import wo from './locales/wo.json';
import yo from './locales/yo.json';

export const languages = [
  // Major world languages
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'zh', name: '简体中文', dir: 'ltr' },
  { code: 'zh-TW', name: '繁體中文', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'fr-CA', name: 'Français (Canada)', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'it', name: 'Italiano', dir: 'ltr' },
  { code: 'pt', name: 'Português', dir: 'ltr' },
  { code: 'pt-BR', name: 'Português (Brasil)', dir: 'ltr' },
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'ja', name: '日本語', dir: 'ltr' },
  { code: 'ko', name: '한국어', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'hi', name: 'हिन्दी', dir: 'ltr' },

  // Southeast Asian languages
  { code: 'vi', name: 'Tiếng Việt', dir: 'ltr' },
  { code: 'tl', name: 'Tagalog', dir: 'ltr' },
  { code: 'th', name: 'ภาษาไทย', dir: 'ltr' },
  { code: 'id', name: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'ms', name: 'Bahasa Melayu', dir: 'ltr' },
  { code: 'my', name: 'မြန်မာ', dir: 'ltr' },
  { code: 'km', name: 'ភាសាខ្មែរ', dir: 'ltr' },
  { code: 'lo', name: 'ພາສາລາວ', dir: 'ltr' },
  { code: 'jv', name: 'Basa Jawa', dir: 'ltr' },
  { code: 'ceb', name: 'Cebuano', dir: 'ltr' },
  { code: 'hil', name: 'Hiligaynon', dir: 'ltr' },
  { code: 'ilo', name: 'Ilocano', dir: 'ltr' },
  { code: 'hmn', name: 'Hmoob', dir: 'ltr' },

  // South Asian languages
  { code: 'bn', name: 'বাংলা', dir: 'ltr' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', dir: 'ltr' },
  { code: 'gu', name: 'ગુજરાતી', dir: 'ltr' },
  { code: 'mr', name: 'मराठी', dir: 'ltr' },
  { code: 'ta', name: 'தமிழ்', dir: 'ltr' },
  { code: 'te', name: 'తెలుగు', dir: 'ltr' },
  { code: 'kn', name: 'ಕನ್ನಡ', dir: 'ltr' },
  { code: 'ne', name: 'नेपाली', dir: 'ltr' },
  { code: 'ur', name: 'اردو', dir: 'rtl' },

  // Middle Eastern and Central Asian languages
  { code: 'fa', name: 'فارسی', dir: 'rtl' },
  { code: 'prs', name: 'دری', dir: 'rtl' },
  { code: 'ps', name: 'پښتو', dir: 'rtl' },
  { code: 'he', name: 'עברית', dir: 'rtl' },
  { code: 'tr', name: 'Türkçe', dir: 'ltr' },
  { code: 'az', name: 'Azərbaycan', dir: 'ltr' },
  { code: 'kk', name: 'Қазақ', dir: 'ltr' },
  { code: 'ky', name: 'Кыргызча', dir: 'ltr' },
  { code: 'uz', name: "O'zbek", dir: 'ltr' },
  { code: 'mn', name: 'Монгол', dir: 'ltr' },
  { code: 'ka', name: 'ქართული', dir: 'ltr' },
  { code: 'hy', name: 'Հdelays', dir: 'ltr' },

  // European languages
  { code: 'uk', name: 'Українська', dir: 'ltr' },
  { code: 'pl', name: 'Polski', dir: 'ltr' },
  { code: 'nl', name: 'Nederlands', dir: 'ltr' },
  { code: 'el', name: 'Ελληνικά', dir: 'ltr' },
  { code: 'cs', name: 'Čeština', dir: 'ltr' },
  { code: 'sk', name: 'Slovenčina', dir: 'ltr' },
  { code: 'hu', name: 'Magyar', dir: 'ltr' },
  { code: 'ro', name: 'Română', dir: 'ltr' },
  { code: 'bg', name: 'Български', dir: 'ltr' },
  { code: 'sr', name: 'Srpski', dir: 'ltr' },
  { code: 'hr', name: 'Hrvatski', dir: 'ltr' },
  { code: 'bs', name: 'Bosanski', dir: 'ltr' },
  { code: 'sl', name: 'Slovenščina', dir: 'ltr' },
  { code: 'mk', name: 'Македонски', dir: 'ltr' },
  { code: 'sq', name: 'Shqip', dir: 'ltr' },
  { code: 'be', name: 'Беларуская', dir: 'ltr' },
  { code: 'et', name: 'Eesti', dir: 'ltr' },
  { code: 'lv', name: 'Latviešu', dir: 'ltr' },
  { code: 'lt', name: 'Lietuvių', dir: 'ltr' },
  { code: 'fi', name: 'Suomi', dir: 'ltr' },
  { code: 'sv', name: 'Svenska', dir: 'ltr' },
  { code: 'no', name: 'Norsk', dir: 'ltr' },
  { code: 'da', name: 'Dansk', dir: 'ltr' },
  { code: 'is', name: 'Íslenska', dir: 'ltr' },

  // African languages
  { code: 'af', name: 'Afrikaans', dir: 'ltr' },
  { code: 'sw', name: 'Kiswahili', dir: 'ltr' },
  { code: 'am', name: 'አማርኛ', dir: 'ltr' },
  { code: 'ti', name: 'ትግርኛ', dir: 'ltr' },
  { code: 'om', name: 'Afaan Oromoo', dir: 'ltr' },
  { code: 'so', name: 'Soomaali', dir: 'ltr' },
  { code: 'yo', name: 'Yorùbá', dir: 'ltr' },
  { code: 'ig', name: 'Igbo', dir: 'ltr' },
  { code: 'wo', name: 'Wolof', dir: 'ltr' },
  { code: 'ln', name: 'Lingala', dir: 'ltr' },
  { code: 'rw', name: 'Kinyarwanda', dir: 'ltr' },
  { code: 'rn', name: 'Kirundi', dir: 'ltr' },

  // Caribbean and Creole languages
  { code: 'ht', name: 'Kreyòl Ayisyen', dir: 'ltr' },

  // Pacific Islander languages
  { code: 'sm', name: 'Gagana Samoa', dir: 'ltr' },
  { code: 'mh', name: 'Kajin M̧ajeļ', dir: 'ltr' },

  // Indigenous and minority languages
  { code: 'nv', name: 'Diné Bizaad', dir: 'ltr' },
  { code: 'cnh', name: 'Lai Holh', dir: 'ltr' },
  { code: 'kar', name: 'ကညီ', dir: 'ltr' },
  { code: 'bo', name: 'བོད་སྐད', dir: 'ltr' },
  { code: 'ymm', name: 'Maay Maay', dir: 'ltr' },
] as const;

// Supported language codes for matching
const supportedLngs = languages.map(lang => lang.code);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      zh: { translation: zh },
      'zh-TW': { translation: zhTW },
      tl: { translation: tl },
      vi: { translation: vi },
      ar: { translation: ar },
      ko: { translation: ko },
      ru: { translation: ru },
      fr: { translation: fr },
      'fr-CA': { translation: frCA },
      hi: { translation: hi },
      pt: { translation: pt },
      'pt-BR': { translation: ptBR },
      ht: { translation: ht },
      ne: { translation: ne },
      sw: { translation: sw },
      so: { translation: so },
      bo: { translation: bo },
      kar: { translation: kar },
      ymm: { translation: ymm },
      he: { translation: he },
      prs: { translation: prs },
      my: { translation: my },
      uk: { translation: uk },
      ln: { translation: ln },
      sm: { translation: sm },
      af: { translation: af },
      am: { translation: am },
      az: { translation: az },
      be: { translation: be },
      bg: { translation: bg },
      bn: { translation: bn },
      bs: { translation: bs },
      ceb: { translation: ceb },
      cnh: { translation: cnh },
      cs: { translation: cs },
      da: { translation: da },
      de: { translation: de },
      el: { translation: el },
      et: { translation: et },
      fa: { translation: fa },
      fi: { translation: fi },
      gu: { translation: gu },
      hil: { translation: hil },
      hmn: { translation: hmn },
      hr: { translation: hr },
      hu: { translation: hu },
      hy: { translation: hy },
      id: { translation: id },
      ig: { translation: ig },
      ilo: { translation: ilo },
      is: { translation: is },
      it: { translation: it },
      ja: { translation: ja },
      jv: { translation: jv },
      ka: { translation: ka },
      kk: { translation: kk },
      km: { translation: km },
      kn: { translation: kn },
      ky: { translation: ky },
      lo: { translation: lo },
      lt: { translation: lt },
      lv: { translation: lv },
      mh: { translation: mh },
      mk: { translation: mk },
      mn: { translation: mn },
      mr: { translation: mr },
      ms: { translation: ms },
      nl: { translation: nl },
      no: { translation: no },
      nv: { translation: nv },
      om: { translation: om },
      pa: { translation: pa },
      pl: { translation: pl },
      ps: { translation: ps },
      rn: { translation: rn },
      ro: { translation: ro },
      rw: { translation: rw },
      sk: { translation: sk },
      sl: { translation: sl },
      sq: { translation: sq },
      sr: { translation: sr },
      sv: { translation: sv },
      ta: { translation: ta },
      te: { translation: te },
      th: { translation: th },
      ti: { translation: ti },
      tr: { translation: tr },
      ur: { translation: ur },
      uz: { translation: uz },
      wo: { translation: wo },
      yo: { translation: yo },
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
