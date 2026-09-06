import React, { useState } from 'react';
import {
  Heart,
  Volume2,
  VolumeX,
  Type,
  HelpCircle,
  LogOut,
  Languages,
  X,
  PhoneCall,
  Info,
} from 'lucide-react';
import { LANGUAGE_OPTIONS, useLanguage } from '../../context/LanguageContext';

interface Props {
  onExit: () => void;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
  isLargeText: boolean;
  onToggleLargeText: () => void;
}

export const PatientPortalHeader: React.FC<Props> = ({
  onExit,
  isVoiceEnabled,
  onToggleVoice,
  isLargeText,
  onToggleLargeText,
}) => {
  const { languageCode, setLanguage } = useLanguage();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
          {/* Brand & Portal Label */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
                  MEDIKIOSK
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold border border-sky-300/40">
                  Patient Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Self-Service Registration & Case Taking
              </p>
            </div>
          </div>

          {/* Patient Controls: Language, Voice, Accessibility, Help, Exit */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                id="btn-patient-language"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
                title="Change Language"
              >
                <Languages className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="hidden sm:inline">
                  {LANGUAGE_OPTIONS.find((l) => l.code === languageCode)?.nativeName || 'Language'}
                </span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => {
                        setLanguage(opt.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                        languageCode === opt.code
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{opt.nativeName}</span>
                      <span className="text-[10px] text-slate-400">{opt.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Guidance Toggle */}
            <button
              id="btn-patient-voice-toggle"
              onClick={onToggleVoice}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isVoiceEnabled
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={isVoiceEnabled ? 'Voice Guidance Active' : 'Enable Voice Guidance'}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">{isVoiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
            </button>

            {/* Accessibility / Large Text Toggle */}
            <button
              id="btn-patient-large-text"
              onClick={onToggleLargeText}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isLargeText
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Large Text for Easy Reading"
            >
              <Type className="w-4 h-4" />
              <span className="hidden lg:inline">{isLargeText ? 'Large Text' : 'Text Size'}</span>
            </button>

            {/* Help Button */}
            <button
              id="btn-patient-help"
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Need Help?"
            >
              <HelpCircle className="w-4 h-4 text-sky-500" />
            </button>

            {/* Exit to Main Selection */}
            <button
              id="btn-exit-patient-portal"
              onClick={onExit}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition-colors ml-1"
              title="Return to Portal Selection"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Exit Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                <Info className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Kiosk Assistance & Instructions
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
              <p>
                <strong>Welcome to MediKiosk!</strong> This kiosk helps you register your visit and receive an OPD token without waiting in long queues.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Choose your preferred language (English, Hindi, or Marathi).</li>
                <li>You can speak into the microphone or type your symptoms.</li>
                <li>Have your Aadhaar or ABHA ID ready for faster verification.</li>
                <li>At the end, take your printed/digital OPD token number.</li>
              </ul>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs">
                <strong>Need immediate hospital assistance?</strong> Please approach the Helpdesk or call our emergency line below.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Helpline: 108</span>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
