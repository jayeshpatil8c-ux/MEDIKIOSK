import React from 'react';
import { AlertTriangle, VolumeX, ArrowRight, Settings, Globe } from 'lucide-react';
import { VoiceLanguage } from '../../../utils/speechHelper';

interface Props {
  isOpen: boolean;
  onContinueUsingText: () => void;
  onTryAnotherVoice: () => void;
  onOpenDiagnostics?: () => void;
}

export const MarathiVoiceUnavailableModal: React.FC<Props> = ({
  isOpen,
  onContinueUsingText,
  onTryAnotherVoice,
  onOpenDiagnostics,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="marathi-voice-unavailable-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-400 dark:border-amber-600/80 shadow-2xl p-6 sm:p-7 space-y-5 text-slate-900 dark:text-white">
        {/* Warning Icon & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
            <VolumeX className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              Device Audio Notice
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
              Native Marathi voice is not available on this device.
            </h3>
          </div>
        </div>

        {/* Explanation */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <p className="leading-relaxed">
            MediKiosk strictly <strong>refuses to use an English-accented voice</strong> to pronounce Marathi medical text or clinical consent.
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            You can proceed with 100% full hospital registration using high-contrast touchscreen Marathi text, or switch to another supported voice.
          </p>
        </div>

        {/* Required Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            id="btn-continue-using-text"
            onClick={onContinueUsingText}
            className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all active:scale-95"
          >
            <span>Continue Using Text</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="btn-try-another-voice"
            onClick={onTryAnotherVoice}
            className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Globe className="w-4 h-4 text-cyan-500" />
            <span>Try Another Voice</span>
          </button>
        </div>

        {onOpenDiagnostics && (
          <div className="text-center pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onOpenDiagnostics}
              className="text-[11px] font-semibold text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 inline-flex items-center gap-1.5 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Open Voice Diagnostics Panel</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
