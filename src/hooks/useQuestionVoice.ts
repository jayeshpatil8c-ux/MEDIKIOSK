import { useEffect, useRef } from 'react';
import { VoiceLanguage, speakText, stopSpeaking } from '../utils/speechHelper';

export function useQuestionVoice(
  questionId: string,
  question: string,
  language: VoiceLanguage,
  enabled: boolean,
  onSpeechError?: (message: string) => void,
) {
  const lastSpoken = useRef<string>('');

  useEffect(() => {
    stopSpeaking();
    lastSpoken.current = '';
    if (!enabled || !question.trim()) return;

    const speechKey = `${questionId}:${language}`;
    const timer = window.setTimeout(() => {
      if (lastSpoken.current === speechKey) return;
      lastSpoken.current = speechKey;
      void speakText(question, language).then((result) => {
        if (!result.success) onSpeechError?.(result.error === 'NO_MARATHI_VOICE' ? 'Marathi speech is unavailable on this device. You can continue by typing, tapping, or using the microphone.' : 'Voice guidance could not speak this question. You can continue manually.');
      });
    }, 100);

    return () => {
      window.clearTimeout(timer);
      stopSpeaking();
    };
  }, [questionId, question, language, enabled]);

  const replay = () => {
    if (!enabled) return;
    stopSpeaking();
    lastSpoken.current = `${questionId}:${language}`;
    void speakText(question, language).then((result) => {
      if (!result.success) onSpeechError?.(result.error === 'NO_MARATHI_VOICE' ? 'Marathi speech is unavailable on this device. You can continue by typing, tapping, or using the microphone.' : 'Voice guidance could not speak this question. You can continue manually.');
    });
  };

  return { replay, stop: stopSpeaking };
}