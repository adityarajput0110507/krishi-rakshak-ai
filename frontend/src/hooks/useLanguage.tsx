import React, { createContext, useContext, useState } from 'react';
import { Language, TranslationKeys, getTranslation } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  needsLanguagePrompt: boolean;
  dismissLanguagePrompt: (chosenLang?: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('cropguard_lang');
    if (saved === 'mr' || saved === 'hi' || saved === 'en') {
      return saved;
    }
    return 'hi';
  });

  const [needsLanguagePrompt, setNeedsLanguagePrompt] = useState<boolean>(() => {
    return !localStorage.getItem('cropguard_lang_chosen');
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('cropguard_lang', lang);
    localStorage.setItem('cropguard_lang_chosen', 'true');
    setNeedsLanguagePrompt(false);
  };

  const dismissLanguagePrompt = (chosenLang?: Language) => {
    if (chosenLang) {
      setLanguageState(chosenLang);
      localStorage.setItem('cropguard_lang', chosenLang);
    }
    localStorage.setItem('cropguard_lang_chosen', 'true');
    setNeedsLanguagePrompt(false);
  };

  const t = getTranslation(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, needsLanguagePrompt, dismissLanguagePrompt }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
