import React, { createContext, useContext, useEffect, useState } from 'react';
import { VoiceLanguage, LANGUAGE_CODES, stopSpeaking, voiceRecognition } from '../utils/speechHelper';
import { translations, TranslationDictionary } from '../i18n/translations';

export type LanguageCode = 'en' | 'hi' | 'mr';

export interface LanguageOption {
  code: LanguageCode;
  locale: string;
  name: VoiceLanguage;
  nativeName: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', locale: LANGUAGE_CODES.English, name: 'English', nativeName: 'English' },
  { code: 'hi', locale: LANGUAGE_CODES.Hindi, name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', locale: LANGUAGE_CODES.Marathi, name: 'Marathi', nativeName: 'मराठी' },
];

const dictionaries: Record<LanguageCode, TranslationDictionary> = translations;

interface LanguageContextValue {
  language: LanguageCode;
  languageCode: LanguageCode;
  locale: string;
  languageName: VoiceLanguage;
  nativeName: string;
  isVoiceEnabled: boolean;
  currentDictionary: TranslationDictionary;
  t: (key: string, fallback?: string) => string;
  isMarathi: boolean;
  isHindi: boolean;
  isEnglish: boolean;
  setLanguage: (language: VoiceLanguage | LanguageCode) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  translate: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);
const optionFor = (value: VoiceLanguage | LanguageCode) => LANGUAGE_OPTIONS.find((option) => option.name === value || option.code === value) || LANGUAGE_OPTIONS[0];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [option, setOption] = useState<LanguageOption>(() => optionFor((localStorage.getItem('medikiosk.language') as LanguageCode) || 'en'));
  const [isVoiceEnabled, setVoiceEnabledState] = useState(() => localStorage.getItem('medikiosk.voiceEnabled') !== 'false');

  useEffect(() => {
    localStorage.setItem('medikiosk.language', option.code);
    document.documentElement.lang = option.locale;
  }, [option]);

  useEffect(() => localStorage.setItem('medikiosk.voiceEnabled', String(isVoiceEnabled)), [isVoiceEnabled]);

  const setLanguage = (value: VoiceLanguage | LanguageCode) => {
    stopSpeaking();
    voiceRecognition.abort();
    const next = optionFor(value);
    voiceRecognition.setLanguage(next.name);
    setOption(next);
  };

  const t = (key: string, fallback?: string) => {
    const value = dictionaries[option.code][key] || dictionaries.en[key];
    if (!value) console.warn(`Missing translation: ${key}`);
    return value || fallback || key;
  };
  return <LanguageContext.Provider value={{ language: option.code, languageCode: option.code, locale: option.locale, languageName: option.name, nativeName: option.nativeName, isMarathi: option.code === 'mr', isHindi: option.code === 'hi', isEnglish: option.code === 'en', isVoiceEnabled, currentDictionary: dictionaries[option.code], setLanguage, setVoiceEnabled: setVoiceEnabledState, t, translate: t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};