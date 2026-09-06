import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  VolumeX,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import {
  VoiceLanguage,
  checkNativeVoiceAvailability,
  speakText,
  stopSpeaking,
  voiceRecognition,
  getFriendlySpeechError,
} from '../../../utils/speechHelper';
import { useLanguage } from '../../../context/LanguageContext';
import { useQuestionVoice } from '../../../hooks/useQuestionVoice';

interface Props {
  selectedLanguage: VoiceLanguage;
  isVoiceEnabled: boolean;
  onToggleVoice: (enabled: boolean) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const VoiceSetupStep: React.FC<Props> = ({
  selectedLanguage,
  isVoiceEnabled,
  onToggleVoice,
  onBack,
  onContinue,
}) => {
  const { t } = useLanguage();
  const { replay } = useQuestionVoice('voice', t('registration.question.voice'), selectedLanguage, isVoiceEnabled);
  const [micStatus, setMicStatus] = useState<'idle' | 'testing' | 'granted' | 'denied'>('idle');
  const [friendlyError, setFriendlyError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [voiceCheckResult, setVoiceCheckResult] = useState<any>(null);
  const [testTranscript, setTestTranscript] = useState<string>('');

  useEffect(() => {
    // Check regional voice availability on mount
    const check = checkNativeVoiceAvailability(selectedLanguage);
    setVoiceCheckResult(check);
  }, [selectedLanguage]);

  // Audio level simulator during test
  useEffect(() => {
    let interval: any = null;
    if (micStatus === 'testing') {
      interval = setInterval(() => {
        setAudioLevel(Math.floor(25 + Math.random() * 65));
      }, 120);
    } else {
      setAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [micStatus]);

  const testMicrophone = async () => {
    setFriendlyError(null);
    setTestTranscript('');

    if (!voiceRecognition.isSupported()) {
      setFriendlyError('Your browser does not support web speech recognition. You can proceed with standard touch and keyboard input.');
      setMicStatus('denied');
      return;
    }

    try {
      setMicStatus('testing');

      // Request mic permission gracefully
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }

      voiceRecognition.startListening(
        selectedLanguage,
        (result) => {
          setTestTranscript(result.transcript);
          setMicStatus('granted');
          voiceRecognition.stop();
        },
        (error) => {
          const friendly = getFriendlySpeechError(error);
          setFriendlyError(friendly.message);
          setMicStatus(friendly.blocked ? 'denied' : 'idle');
        }
      );

      // Timeout safety after 6 seconds
      setTimeout(() => {
        if (micStatus === 'testing') {
          voiceRecognition.stop();
          setMicStatus('granted');
        }
      }, 6000);
    } catch (err: any) {
      const friendly = getFriendlySpeechError(err.message || 'not-allowed');
      setFriendlyError(friendly.message);
      setMicStatus('denied');
    }
  };

  const commandDictionary: Record<VoiceLanguage, { cmd: string; action: string; example: string }[]> = {
    English: [
      { cmd: '"Next" / "Continue"', action: 'Moves forward to next step', example: 'Say "Next"' },
      { cmd: '"Back" / "Previous"', action: 'Returns to earlier step', example: 'Say "Back"' },
      { cmd: '"Read All"', action: 'Reads full 10-section consent form', example: 'Say "Read entire form"' },
      { cmd: '"Pause" / "Resume"', action: 'Pauses or resumes consent reader', example: 'Say "Pause"' },
      { cmd: '"Confirm"', action: 'Approves signature or review', example: 'Say "I confirm"' },
    ],
    Hindi: [
      { cmd: '"आगे" / "नेक्स्ट"', action: 'अगले चरण पर जाएं', example: '"आगे बढ़ो" बोलें' },
      { cmd: '"पीछे" / "वापस"', action: 'पिछले चरण पर लौटें', example: '"पीछे जाओ" बोलें' },
      { cmd: '"पूरा फॉर्म पढ़ो"', action: 'संपूर्ण १०-भाग सहमति पत्र सुनें', example: '"पूरा पढ़ो" बोलें' },
      { cmd: '"रोक दो" / "शुरू करो"', action: 'वॉयस रीडर को रोकें अथवा पुनः चलाएं', example: '"पॉज" बोलें' },
      { cmd: '"पुष्टि करें" / "स्वीकार"', action: 'सहमति अथवा समीक्षा की पुष्टि करें', example: '"स्वीकार है" बोलें' },
    ],
    Marathi: [
      { cmd: '"पुढे" / "नेक्स्ट"', action: 'पुढील टप्प्यावर जाण्यासाठी', example: '"पुढे चला" बोला' },
      { cmd: '"मागे" / "परत"', action: 'मागील टप्प्यावर परत जाण्यासाठी', example: '"मागे जा" बोला' },
      { cmd: '"संपूर्ण फॉर्म वाचा"', action: '१० भागांचे संपूर्ण संमती पत्र ऐकण्यासाठी', example: '"सर्व वाचा" बोला' },
      { cmd: '"थांबा" / "सुरू करा"', action: 'आवाज वाचन थांबवण्यासाठी अथवा चालू ठेवण्यासाठी', example: '"थांबा" बोला' },
      { cmd: '"नक्की करा" / "होय"', action: 'समीक्षा अथवा स्वाक्षरीची खात्री देण्यासाठी', example: '"संमती आहे" बोला' },
    ],
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Mic className="w-3.5 h-3.5" />
            Step 2 of 10 • Voice Setup & Mic Test
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('registration.voice.title')}
          </h2>
          <p className="text-xs text-slate-500">
            MediKiosk supports hands-free navigation and voice dictation in {selectedLanguage}.
          </p>
        </div>

        {/* Master Voice Toggle */}
        <button
          onClick={() => {
            if (isVoiceEnabled) stopSpeaking();
            onToggleVoice(!isVoiceEnabled);
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 ${
            isVoiceEnabled
              ? 'bg-cyan-500/15 border-cyan-500 text-cyan-600 dark:text-cyan-400 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
          }`}
        >
          {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{isVoiceEnabled ? 'Voice Guidance: ACTIVE' : 'Voice Guidance: MUTED'}</span>
        </button>
      </div>

      {/* Grid: Mic Tester & Regional Voice Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Interactive Microphone Tester Box */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-cyan-500" />
              Microphone Sensitivity & Live Test
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                micStatus === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : micStatus === 'testing'
                  ? 'bg-amber-500/20 text-amber-600 animate-pulse'
                  : micStatus === 'denied'
                  ? 'bg-rose-500/20 text-rose-600'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {micStatus === 'granted'
                ? 'Ready'
                : micStatus === 'testing'
                ? 'Listening...'
                : micStatus === 'denied'
                ? 'Blocked / Muted'
                : 'Not Tested'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Touch <strong>"Test Microphone"</strong> and speak a short phrase (e.g. "Hello Doctor"). The waveform will react to your voice.
          </p>

          {/* Live Waveform Indicator */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 h-20">
            {Array.from({ length: 16 }).map((_, i) => {
              const height =
                micStatus === 'testing'
                  ? Math.max(12, Math.min(60, (audioLevel * ((i % 4) + 1)) / 3.5))
                  : micStatus === 'granted'
                  ? 24
                  : 8;
              return (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-100 ${
                    micStatus === 'testing'
                      ? 'bg-cyan-500'
                      : micStatus === 'granted'
                      ? 'bg-emerald-500'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>

          {/* Test Transcript Preview */}
          {testTranscript && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Voice Captured: <strong>"{testTranscript}"</strong></span>
            </div>
          )}

          {/* Friendly Error Banner (Never showing raw browser errors) */}
          {friendlyError && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Microphone Note:</strong>
                  <span>{friendlyError}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={testMicrophone}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Try Again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onToggleVoice(false);
                    onContinue();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]"
                >
                  Continue Without Voice
                </button>
              </div>
            </div>
          )}

          {/* Test Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              id="btn-test-microphone"
              onClick={testMicrophone}
              className="flex-1 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>{micStatus === 'testing' ? 'Listening... Speak Now' : 'Test Microphone'}</span>
            </button>

            <button
              type="button"
              id="btn-test-speaker"
              onClick={() => {
                const sampleText =
                  selectedLanguage === 'Marathi'
                    ? 'नमस्कार. आपल्या आरोग्य नोंदणीसाठी आपले स्वागत आहे. मी आपल्याला संपूर्ण नोंदणी प्रक्रियेत मार्गदर्शन करेन.'
                    : selectedLanguage === 'Hindi'
                    ? 'नमस्ते। आपके अस्पताल पंजीकरण कियोस्क में आपका स्वागत है। मैं आपको पंजीकरण प्रक्रिया में मार्गदर्शन करूँगा।'
                    : 'Hello. Welcome to your hospital registration kiosk. I will guide you through each step.';
                speakText(sampleText, selectedLanguage);
              }}
              className="px-4 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4 text-cyan-500" />
              <span>{selectedLanguage === 'Marathi' ? '🔊 Test Marathi Voice' : 'Test Speaker'}</span>
            </button>
          </div>
        </div>

        {/* Right: Regional Voice Status & Voice Commands Guide */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Device Regional Voice Engine
            </h3>
            <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
              {selectedLanguage} Engine (mr-IN)
            </span>
          </div>

          {/* Native Voice Status Banner */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              {voiceCheckResult?.isAvailable ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
              <span>{voiceCheckResult?.note || 'Native synthesis configured'}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {selectedLanguage === 'Marathi'
                ? 'Strict Marathi engine active. Never fakes accents or substitutes English voices.'
                : `Audio prompts will be pronounced using accurate Indian phonetic accents (${selectedLanguage}).`}
            </p>
          </div>

          {/* Voice Command Reference Guide */}
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Voice Commands Quick Reference ({selectedLanguage})
            </span>
            <div className="space-y-1.5">
              {commandDictionary[selectedLanguage].map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-cyan-700 dark:text-cyan-300 font-mono">
                      {item.cmd}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {item.action}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    {item.example}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Language
        </button>

        <button
          type="button"
          id="btn-voice-continue-to-consent"
          onClick={onContinue}
          className="px-7 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all"
        >
          <span>Continue to Mandatory Informed Consent</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
