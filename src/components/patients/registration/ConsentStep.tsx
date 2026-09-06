import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Square,
  ZoomIn,
  ZoomOut,
  PenTool,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Globe,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { VoiceLanguage, speakText, stopSpeaking } from '../../../utils/speechHelper';
import { ROBINIA_STUDY_DATA } from '../../../data/consentStudyData';
import { useLanguage } from '../../../context/LanguageContext';
import { useQuestionVoice } from '../../../hooks/useQuestionVoice';

interface Props {
  selectedLanguage: VoiceLanguage;
  onLanguageChange: (lang: VoiceLanguage) => void;
  consentReadConfirmed: boolean;
  setConsentReadConfirmed: (val: boolean) => void;
  consentLanguageConfirmed: boolean;
  setConsentLanguageConfirmed: (val: boolean) => void;
  consentQuestionsAnswered: boolean;
  setConsentQuestionsAnswered: (val: boolean) => void;
  patientSignature: string;
  setPatientSignature: (sig: string) => void;
  witnessName: string;
  doctorName: string;
  onBack: () => void;
  onContinue: () => void;
  onDecline: () => void;
}

export const ConsentStep: React.FC<Props> = ({
  selectedLanguage,
  onLanguageChange,
  consentReadConfirmed,
  setConsentReadConfirmed,
  consentLanguageConfirmed,
  setConsentLanguageConfirmed,
  consentQuestionsAnswered,
  setConsentQuestionsAnswered,
  patientSignature,
  setPatientSignature,
  witnessName,
  doctorName,
  onBack,
  onContinue,
  onDecline,
}) => {
  const { t, isVoiceEnabled } = useLanguage();
  const { replay } = useQuestionVoice('consent', t('registration.question.consent'), selectedLanguage, isVoiceEnabled);
  const study = ROBINIA_STUDY_DATA[selectedLanguage];
  const [zoom, setZoom] = useState<number>(100);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Audio Sequential Reader State
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentReadingSection, setCurrentReadingSection] = useState<number | null>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Sequential Reader Execution
  const readSectionSequentially = async (index: number) => {
    if (index >= study.sections.length) {
      setIsPlayingAll(false);
      setIsPaused(false);
      setCurrentReadingSection(null);
      const completionMsg =
        selectedLanguage === 'Marathi'
          ? 'संमती पत्र वाचन पूर्ण झाले आहे. कृपया खाली आपली स्वाक्षरी आणि पुष्टीकरण द्या.'
          : selectedLanguage === 'Hindi'
          ? 'सहमति पत्र का वाचन पूरा हो गया है। कृपया नीचे अपने हस्ताक्षर और पुष्टि प्रदान करें।'
          : 'Consent form reading complete. Please provide your signature and confirmations below.';
      speakText(completionMsg, selectedLanguage);
      return;
    }

    setCurrentReadingSection(index);
    const sec = study.sections[index];
    const speechText = `${sec.title}. ${sec.content}`;

    // Scroll into view gently
    if (sectionRefs.current[index]) {
      sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    await speakText(speechText, selectedLanguage);

    // Proceed to next section if not paused or stopped
    if (isPlayingAll) {
      setTimeout(() => {
        readSectionSequentially(index + 1);
      }, 500);
    }
  };

  const handleStartReadAll = () => {
    setIsPlayingAll(true);
    setIsPaused(false);
    readSectionSequentially(0);
  };

  const handlePause = () => {
    stopSpeaking();
    setIsPaused(true);
    setIsPlayingAll(false);
  };

  const handleResume = () => {
    setIsPlayingAll(true);
    setIsPaused(false);
    const resumeIndex = currentReadingSection !== null ? currentReadingSection : 0;
    readSectionSequentially(resumeIndex);
  };

  const handleStop = () => {
    stopSpeaking();
    setIsPlayingAll(false);
    setIsPaused(false);
    setCurrentReadingSection(null);
  };

  const handleRestart = () => {
    stopSpeaking();
    setIsPlayingAll(true);
    setIsPaused(false);
    readSectionSequentially(0);
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0284c7';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingHandler = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        setPatientSignature(canvas.toDataURL());
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      setPatientSignature('');
    }
  };

  const canContinue =
    consentReadConfirmed && consentLanguageConfirmed && consentQuestionsAnswered && Boolean(patientSignature);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Step Header with Integrated Language Switcher and Audio Player */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5" />
            Step 3 of 10 • Mandatory Informed Consent
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('registration.consent.title')}
          </h2>
          <p className="text-xs text-slate-500">
            Institutional Ethics Committee Approved Study Protocol (ECR/942/Inst/MH/2023/RR-26).
          </p>
        </div>

        {/* Language Switcher Directly on Form (Without losing signature or checks!) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {(['English', 'Hindi', 'Marathi'] as VoiceLanguage[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => onLanguageChange(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedLanguage === lang
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lang === 'English' ? 'EN' : lang === 'Hindi' ? 'हिंदी' : 'मराठी'}
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setZoom((z) => Math.max(z - 10, 80))}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-1 font-semibold text-slate-500">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(z + 10, 140))}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sequential Audio Player Toolbar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-950 border border-cyan-500/30 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Volume2 className={`w-5 h-5 ${isPlayingAll ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <span className="text-xs font-bold block">
              Sequential Voice Consent Reader ({selectedLanguage})
            </span>
            <span className="text-[11px] text-cyan-300">
              {currentReadingSection !== null
                ? `Reading Section ${currentReadingSection + 1} of 10: ${study.sections[currentReadingSection]?.title}`
                : 'Touch "Read All" to have the entire 10-section consent read aloud.'}
            </span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-2">
          {!isPlayingAll && !isPaused && (
            <button
              type="button"
              id="btn-consent-read-all"
              onClick={handleStartReadAll}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {selectedLanguage === 'Marathi'
                  ? '▶ संपूर्ण फॉर्म वाचा'
                  : selectedLanguage === 'Hindi'
                  ? '▶ पूरा फॉर्म पढ़ें'
                  : '▶ Read All'}
              </span>
            </button>
          )}

          {isPlayingAll && (
            <button
              type="button"
              onClick={handlePause}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>{selectedLanguage === 'Marathi' ? 'थांबा (Pause)' : selectedLanguage === 'Hindi' ? 'रोकें (Pause)' : 'Pause'}</span>
            </button>
          )}

          {isPaused && (
            <button
              type="button"
              onClick={handleResume}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{selectedLanguage === 'Marathi' ? 'पुन्हा सुरू करा (Resume)' : selectedLanguage === 'Hindi' ? 'जारी रखें' : 'Resume'}</span>
            </button>
          )}

          {(isPlayingAll || isPaused) && (
            <button
              type="button"
              onClick={handleStop}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-xs flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5" />
              <span>{selectedLanguage === 'Marathi' ? 'थांबवा (Stop)' : selectedLanguage === 'Hindi' ? 'बंद करें' : 'Stop'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRestart}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            title={selectedLanguage === 'Marathi' ? 'पहिल्या भागापासून पुन्हा वाचा' : 'Restart from Section 1'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Authoritative Document Reader Box (All 10 Sections with dynamic active highlight) */}
      <div
        className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 space-y-4 max-h-[420px] overflow-y-auto"
        style={{ fontSize: `${(zoom / 100) * 13}px` }}
      >
        {/* Document Header */}
        <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {study.institution}
          </div>
          <h3 className="font-black text-sm sm:text-base text-cyan-700 dark:text-cyan-300 uppercase">
            {study.studyTitle}
          </h3>
          <div className="flex flex-wrap justify-center gap-3 text-[11px] font-mono text-slate-500 pt-1">
            <span>Protocol: {study.studyCode}</span>
            <span>•</span>
            <span>{study.ethicsApproval}</span>
          </div>
        </div>

        {/* 10 Structured Sections */}
        <div className="space-y-4 pt-1">
          {study.sections.map((sec, idx) => {
            const isReadingThis = currentReadingSection === idx;
            return (
              <div
                key={sec.id}
                ref={(el) => (sectionRefs.current[idx] = el)}
                className={`p-4 rounded-2xl border transition-all duration-300 ${
                  isReadingThis
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-lg ring-2 ring-cyan-400/50'
                    : 'border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800/60 mb-2">
                  <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {isReadingThis && <Volume2 className="w-4 h-4 text-cyan-500 animate-pulse" />}
                    <span>{sec.title}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentReadingSection(idx);
                      speakText(`${sec.title}. ${sec.content}`, selectedLanguage);
                    }}
                    className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" /> Read Section
                  </button>
                </div>

                <p className="leading-relaxed text-slate-700 dark:text-slate-300 mb-2">
                  {sec.content}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {sec.keyPoints.map((kp, kIdx) => (
                    <span
                      key={kIdx}
                      className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold"
                    >
                      • {kp}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Checkboxes */}
      <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            id="chk-consent-read"
            checked={consentReadConfirmed}
            onChange={(e) => setConsentReadConfirmed(e.target.checked)}
            className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4 mt-0.5"
          />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {study.declarations[0]}
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            id="chk-consent-lang"
            checked={consentLanguageConfirmed}
            onChange={(e) => setConsentLanguageConfirmed(e.target.checked)}
            className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4 mt-0.5"
          />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {study.declarations[1]}
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            id="chk-consent-questions"
            checked={consentQuestionsAnswered}
            onChange={(e) => setConsentQuestionsAnswered(e.target.checked)}
            className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4 mt-0.5"
          />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {study.declarations[2]}
          </span>
        </label>
      </div>

      {/* Digital Touchscreen Signature Pad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-cyan-500" />
              Patient / Guardian Digital Signature *
            </label>
            <button
              type="button"
              onClick={clearSignature}
              className="text-[11px] text-rose-500 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Clear Signature
            </button>
          </div>
          <div className="border-2 border-dashed border-cyan-500/40 rounded-2xl bg-white dark:bg-slate-950 p-1 flex justify-center shadow-inner">
            <canvas
              ref={canvasRef}
              width={420}
              height={150}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawingHandler}
              onMouseLeave={stopDrawingHandler}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawingHandler}
              className="cursor-crosshair w-full touch-none"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Touch and sign above with your finger or stylus. Digital signature timestamp is recorded securely.
          </p>
        </div>

        {/* Witness and Supervising Investigator Info */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Independent Witness Verification
            </label>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{witnessName}</span>
                <span className="text-[10px] text-slate-500">Staff Nurse / Clinical Witness</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Witness Present
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supervising Guide / Lead Investigator
            </label>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{doctorName}</span>
                <span className="text-[10px] text-slate-500">MD (Hom) • Guide & Head of OPD</span>
              </div>
              <span className="text-[10px] font-bold text-cyan-600 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> IEC Investigator
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions: Decline or Accept & Continue */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          <button
            type="button"
            id="btn-decline-consent"
            onClick={onDecline}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 underline"
          >
            I Do Not Consent / Decline
          </button>
        </div>

        <button
          type="button"
          id="btn-accept-consent-continue"
          disabled={!canContinue}
          onClick={onContinue}
          className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span>Accept Consent & Continue to Identity</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
