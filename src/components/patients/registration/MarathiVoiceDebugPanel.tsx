import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import {
  VoiceLanguage,
  getVoiceDiagnostics,
  VoiceDiagnosticInfo,
  onVoicesChanged,
  speakMarathi,
  stopSpeaking,
  VOICE_PROMPTS,
} from '../../../utils/speechHelper';

interface Props {
  selectedLanguage: VoiceLanguage;
  onSelectLanguage?: (lang: VoiceLanguage) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isFloating?: boolean;
}

export const MarathiVoiceDebugPanel: React.FC<Props> = ({
  selectedLanguage,
  onSelectLanguage,
  isOpen = true,
  onClose,
  isFloating = false,
}) => {
  const [diag, setDiag] = useState<VoiceDiagnosticInfo>(() => getVoiceDiagnostics(selectedLanguage));
  const [isSpeakingTest, setIsSpeakingTest] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [showAllVoices, setShowAllVoices] = useState<boolean>(false);
  const [allSystemVoices, setAllSystemVoices] = useState<SpeechSynthesisVoice[]>([]);

  const refreshDiagnostics = () => {
    const d = getVoiceDiagnostics(selectedLanguage);
    setDiag(d);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setAllSystemVoices(window.speechSynthesis.getVoices());
    }
  };

  useEffect(() => {
    refreshDiagnostics();
    const unsub = onVoicesChanged(() => {
      refreshDiagnostics();
    });
    return () => {
      unsub();
    };
  }, [selectedLanguage]);

  const handleTestMarathiVoice = async () => {
    stopSpeaking();
    setIsSpeakingTest(true);
    setTestStatus('Synthesizing verified Marathi voice...');

    // Exact required text from specification:
    const testText =
      'नमस्कार. आपल्या आरोग्य नोंदणीसाठी आपले स्वागत आहे. मी आपल्याला संपूर्ण नोंदणी प्रक्रियेत मार्गदर्शन करेन.';

    const result = await speakMarathi(
      testText,
      0.92,
      () => {
        setTestStatus('Speaking native Marathi audio...');
      },
      () => {
        setIsSpeakingTest(false);
        setTestStatus('✓ Speech test completed successfully.');
      },
      (err) => {
        setIsSpeakingTest(false);
        setTestStatus(`⚠ Voice error: ${err}`);
      }
    );

    if (!result.success) {
      setIsSpeakingTest(false);
      if (result.error === 'NO_MARATHI_VOICE') {
        setTestStatus('⚠ Native Marathi voice is not available on this device.');
      } else {
        setTestStatus(`⚠ Synthesis could not start (${result.error})`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="marathi-voice-diagnostic-panel"
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isFloating
          ? 'fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] shadow-2xl bg-slate-900/95 text-slate-100 border-cyan-500/40 backdrop-blur-md ring-1 ring-cyan-500/20'
          : 'bg-slate-50 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800 shadow-md'
      }`}
    >
      {/* Panel Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Voice Engine Diagnostic Panel
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={refreshDiagnostics}
            title="Refresh device voice list"
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Hide panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Diagnostic Specs Matrix */}
      <div className="p-4 space-y-3.5 text-xs">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Selected Language */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
              Selected Language
            </span>
            <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">
              {diag.language}
            </span>
          </div>

          {/* Requested Locale */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
              Requested Locale
            </span>
            <span className="text-sm font-mono font-black text-slate-800 dark:text-slate-200">
              {diag.requestedLocale}
            </span>
          </div>
        </div>

        {/* Selected Voice & Locale */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Selected Device Voice
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {diag.voiceLang}
            </span>
          </div>
          <div className="font-bold text-slate-800 dark:text-slate-200 truncate" title={diag.voiceName}>
            {diag.voiceName}
          </div>
        </div>

        {/* Voice Status Badge */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between ${
            diag.isAvailable
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {diag.isAvailable ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            )}
            <span>{diag.statusLabel}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/60 dark:bg-black/40">
            {diag.totalVoicesAvailable} system voices
          </span>
        </div>

        {/* Action Button: Test Marathi Voice */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            id="btn-test-marathi-voice-diag"
            onClick={handleTestMarathiVoice}
            disabled={isSpeakingTest}
            className={`w-full py-2.5 px-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
              diag.isAvailable
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20 active:scale-95'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isSpeakingTest ? 'Playing Marathi Speech...' : '🔊 Test Marathi Voice'}</span>
          </button>

          {testStatus && (
            <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
              {testStatus}
            </div>
          )}
        </div>

        {/* Unavailable Advice Box if no Marathi voice */}
        {!diag.isAvailable && diag.language === 'Marathi' && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-700 dark:text-amber-300 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Native Marathi voice is not available on this device.</span>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400">
              The application strictly refuses to speak Marathi using an English accent. Registration continues seamlessly with text prompts.
            </p>
            {onSelectLanguage && (
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectLanguage('Hindi')}
                  className="px-2.5 py-1 rounded bg-amber-600 text-white font-bold text-[10px]"
                >
                  Try Hindi Voice
                </button>
                <button
                  type="button"
                  onClick={() => onSelectLanguage('English')}
                  className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[10px]"
                >
                  Try English Voice
                </button>
              </div>
            )}
          </div>
        )}

        {/* Detailed System Voices Inspector Toggle */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-2">
          <button
            type="button"
            onClick={() => setShowAllVoices(!showAllVoices)}
            className="w-full flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 py-1"
          >
            <span>Inspect System Installed Voices ({allSystemVoices.length})</span>
            {showAllVoices ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAllVoices && (
            <div className="max-h-36 overflow-y-auto space-y-1 pt-1 pr-1">
              {allSystemVoices.map((v, i) => {
                const isMr = v.lang.toLowerCase().startsWith('mr') || v.name.toLowerCase().includes('marathi') || v.name.includes('मराठी');
                const isHi = v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi');
                return (
                  <div
                    key={i}
                    className={`p-1.5 rounded text-[10px] font-mono flex items-center justify-between ${
                      isMr
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : isHi
                        ? 'bg-blue-500/10 text-blue-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="truncate max-w-[200px]" title={v.name}>
                      {v.name}
                    </span>
                    <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-black/20">
                      {v.lang}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
