import React, { useState } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { VoiceLanguage, voiceRecognition, getFriendlySpeechError } from '../../utils/speechHelper';

interface Props {
  onTranscript: (text: string) => void;
  language?: VoiceLanguage;
  label?: string;
  className?: string;
}

export const VoiceInputButton: React.FC<Props> = ({
  onTranscript,
  language = 'English',
  label = 'Dictate',
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const supported = voiceRecognition.isSupported();
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleToggle = () => {
    setErrorNotice(null);
    if (!supported) {
      setErrorNotice('Voice dictation is not supported by your current browser.');
      return;
    }

    if (isListening) {
      voiceRecognition.abort();
      setIsListening(false);
      return;
    }

    try {
      const started = voiceRecognition.startListening(language as VoiceLanguage, (result) => {
        if (result.transcript) onTranscript(result.transcript);
        setIsListening(false);
      }, (error) => {
        setIsListening(false);
        setErrorNotice(getFriendlySpeechError(error).message);
      }, () => setIsListening(false));
      setIsListening(started);
    } catch (err) {
      setIsListening(false);
      setErrorNotice('Microphone error.');
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        id="voice-dictation-btn"
        onClick={handleToggle}
        title={supported ? `Click to dictate in ${language}` : 'Voice dictation unavailable'}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
          isListening
            ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-300'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200 dark:border-slate-700'
        } ${className}`}
      >
        {isListening ? (
          <>
            <MicOff className="w-3.5 h-3.5 text-white animate-spin" />
            <span>Listening ({language})...</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-sky-500" />
            <span>{label}</span>
          </>
        )}
      </button>

      {errorNotice && (
        <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {errorNotice}
        </span>
      )}
    </div>
  );
};
