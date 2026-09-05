import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface Props {
  onTranscript: (text: string) => void;
  language?: 'English' | 'Hindi' | 'Marathi';
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
  const [supported, setSupported] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const handleToggle = () => {
    setErrorNotice(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorNotice('Voice dictation is not supported by your current browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Select BCP 47 language code
      let langCode = 'en-IN';
      if (language === 'Hindi') langCode = 'hi-IN';
      if (language === 'Marathi') langCode = 'mr-IN';
      recognition.lang = langCode;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorNotice('Microphone access was denied. Please allow microphone permission.');
        } else {
          setErrorNotice('Speech not detected. Try speaking closer to the microphone.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to initiate speech recognition:', err);
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
