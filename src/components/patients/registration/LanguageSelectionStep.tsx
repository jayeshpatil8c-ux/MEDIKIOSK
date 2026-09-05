import React from 'react';
import { Globe, Volume2, ArrowRight, CheckCircle2, Mic } from 'lucide-react';
import { VoiceLanguage, speakText, VOICE_PROMPTS } from '../../../utils/speechHelper';

interface Props {
  selectedLanguage: VoiceLanguage;
  onSelectLanguage: (lang: VoiceLanguage) => void;
  onContinue: () => void;
  isVoiceEnabled: boolean;
}

export const LanguageSelectionStep: React.FC<Props> = ({
  selectedLanguage,
  onSelectLanguage,
  onContinue,
  isVoiceEnabled,
}) => {
  const languages: {
    id: VoiceLanguage;
    name: string;
    nativeName: string;
    flag: string;
    desc: string;
    sampleText: string;
  }[] = [
    {
      id: 'English',
      name: 'English',
      nativeName: 'Standard Indian English',
      flag: '🇬🇧',
      desc: 'Voice prompts, consent forms, health questionnaire, and OPD tokens in English.',
      sampleText: 'Welcome to MediKiosk. Please select your preferred language.',
    },
    {
      id: 'Hindi',
      name: 'Hindi',
      nativeName: 'हिंदी',
      flag: '🇮🇳',
      desc: 'वॉयस सहायता, सहमति पत्र, स्वास्थ्य प्रश्न और ओपीडी टोकन हिंदी में।',
      sampleText: 'मेडीकियोस्क में आपका स्वागत है। कृपया अपनी पसंदीदा भाषा चुनें।',
    },
    {
      id: 'Marathi',
      name: 'Marathi',
      nativeName: 'मराठी',
      flag: '🇮🇳',
      desc: 'आवाज सहाय्यक, संमती पत्र, आरोग्य प्रश्न आणि ओपीडी टोकन मराठी भाषेत.',
      sampleText: 'मेडीकियोस्क मध्ये आपले स्वागत आहे. कृपया आपली भाषा निवडा.',
    },
  ];

  const handleListenSample = (e: React.MouseEvent, lang: VoiceLanguage, text: string) => {
    e.stopPropagation();
    speakText(text, lang);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Step Header */}
      <div className="text-center space-y-2 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5" />
          Step 1 of 10 • Language First
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          CHOOSE YOUR LANGUAGE / अपनी भाषा चुनें / आपली भाषा निवडा
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          The entire hospital registration, voice commands, clinical consent form, and queue token instructions will adapt to your choice.
        </p>
      </div>

      {/* Language Selection Touch Cards (Large Touch Targets > 64px) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        {languages.map((lang) => {
          const isSelected = selectedLanguage === lang.id;
          return (
            <div
              key={lang.id}
              id={`select-lang-${lang.id.toLowerCase()}`}
              onClick={() => {
                onSelectLanguage(lang.id);
                if (isVoiceEnabled) {
                  speakText(VOICE_PROMPTS[lang.id].welcome, lang.id);
                }
              }}
              role="button"
              tabIndex={0}
              className={`p-6 rounded-3xl border-2 cursor-pointer transition-all duration-200 text-left flex flex-col justify-between relative select-none ${
                isSelected
                  ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/10 via-slate-50 to-blue-500/10 dark:from-cyan-950/40 dark:via-slate-900 dark:to-blue-950/40 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-400'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 text-cyan-500">
                  <CheckCircle2 className="w-6 h-6 fill-cyan-500 text-white dark:text-slate-950" />
                </div>
              )}

              <div className="space-y-2">
                <div className="text-3xl mb-1">{lang.flag}</div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {lang.name}
                </div>
                <div className="text-base font-bold text-cyan-600 dark:text-cyan-400">
                  {lang.nativeName}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                  {lang.desc}
                </p>
              </div>

              {/* Listen Sample Button (min touch target: 44px) */}
              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => handleListenSample(e, lang.id, lang.sampleText)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-600 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Listen to audio pronunciation"
                >
                  <Volume2 className="w-4 h-4 text-cyan-500" />
                  <span>🔊 Listen Sample</span>
                </button>

                <span className="text-[11px] font-semibold text-slate-400">
                  {isSelected ? '✓ Selected' : 'Touch to select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Mic className="w-4 h-4 text-cyan-500 animate-pulse" />
          <span>You can speak <strong>"Next"</strong> or touch the button below to proceed.</span>
        </div>

        <button
          type="button"
          id="btn-lang-continue"
          onClick={onContinue}
          className="w-full sm:w-auto min-h-[52px] px-8 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>Continue to Voice Setup & Mic Test</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
