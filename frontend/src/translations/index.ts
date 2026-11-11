import { en } from './en';
import { mr } from './mr';
import { hi } from './hi';

export type Language = 'en' | 'mr' | 'hi';
export type TranslationKeys = typeof en;

export const translations = {
  en,
  mr,
  hi,
};

export const getTranslation = (lang: Language): TranslationKeys => {
  return translations[lang] || translations.en;
};

