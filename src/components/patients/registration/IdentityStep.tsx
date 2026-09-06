import React, { useEffect, useRef, useState } from 'react';
import {
  User,
  Phone,
  Calendar,
  Mail,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Mic,
  MicOff,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { VoiceLanguage, voiceRecognition, getFriendlySpeechError, parseVoiceCommand, speakText, stopSpeaking } from '../../../utils/speechHelper';
import { Patient } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';

interface Props {
  fullName: string;
  setFullName: (name: string) => void;
  age: number;
  setAge: (age: number) => void;
  dob: string;
  setDob: (dob: string) => void;
  gender: 'Male' | 'Female' | 'Other';
  setGender: (gender: 'Male' | 'Female' | 'Other') => void;
  phone: string;
  setPhone: (phone: string) => void;
  email: string;
  setEmail: (email: string) => void;
  address: string;
  setAddress: (address: string) => void;
  pinCode: string;
  setPinCode: (pin: string) => void;
  emergencyName: string;
  setEmergencyName: (name: string) => void;
  emergencyRelation: string;
  setEmergencyRelation: (rel: string) => void;
  emergencyPhone: string;
  setEmergencyPhone: (phone: string) => void;
  existingPatients: Patient[];
  selectedLanguage: VoiceLanguage;
  onSelectExistingPatient?: (patient: Patient) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const IdentityStep: React.FC<Props> = ({
  fullName,
  setFullName,
  age,
  setAge,
  dob,
  setDob,
  gender,
  setGender,
  phone,
  setPhone,
  email,
  setEmail,
  address,
  setAddress,
  pinCode,
  setPinCode,
  emergencyName,
  setEmergencyName,
  emergencyRelation,
  setEmergencyRelation,
  emergencyPhone,
  setEmergencyPhone,
  existingPatients,
  selectedLanguage,
  onSelectExistingPatient,
  onBack,
  onContinue,
}) => {
  const { t, isVoiceEnabled } = useLanguage();
  const [duplicateMatch, setDuplicateMatch] = useState<Patient | null>(null);
  const [isListeningField, setIsListeningField] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [interviewIndex, setInterviewIndex] = useState(0);
  const [interviewPhase, setInterviewPhase] = useState<'idle' | 'speaking' | 'listening' | 'confirming' | 'complete'>('idle');
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null);
  const [showKeyboardFields, setShowKeyboardFields] = useState<boolean>(true);
  const interviewSession = useRef(0);

  const interviewFields = [
    { id: 'fullName', prompt: t('registration.question.fullName'), value: fullName },
    { id: 'dateOfBirth', prompt: t('registration.question.dateOfBirth'), value: dob },
    { id: 'gender', prompt: t('registration.question.gender'), value: gender },
    { id: 'mobile', prompt: t('registration.question.mobile'), value: phone },
    { id: 'email', prompt: t('registration.question.email'), value: email },
    { id: 'pincode', prompt: t('registration.question.pincode'), value: pinCode },
    { id: 'address', prompt: t('registration.question.address'), value: address },
    { id: 'emergencyName', prompt: t('registration.question.emergencyName'), value: emergencyName },
    { id: 'emergencyRelation', prompt: t('registration.question.emergencyRelation'), value: emergencyRelation },
    { id: 'emergencyPhone', prompt: t('registration.question.emergencyPhone'), value: emergencyPhone },
  ];
  const currentInterviewField = interviewFields[interviewIndex];
  const isInterviewMode = isVoiceEnabled && voiceRecognition.isSupported();
  const replay = () => {
    stopSpeaking();
    void speakText(currentInterviewField?.prompt || t('registration.question.identity'), selectedLanguage);
  };

  const parseInterviewAnswer = (fieldId: string, transcript: string): string | null => {
    const text = transcript.trim();
    if (!text) return null;
    if (['email', 'pincode', 'address'].includes(fieldId) && /\b(skip|skipped|छोड़ें|छोड़ना|वगळा|वगळणे|नको)\b/i.test(text)) return '';
    if (fieldId === 'mobile' || fieldId === 'emergencyPhone' || fieldId === 'pincode') {
      const digits = text.replace(/\D/g, '');
      return digits.length >= (fieldId === 'pincode' ? 1 : 8) ? digits : null;
    }
    if (fieldId === 'dateOfBirth') {
      const numbers = text.match(/\d+/g) || [];
      if (numbers.length >= 3) {
        const [first, second, third] = numbers.map(Number);
        const year = third > 31 ? third : first > 31 ? first : 0;
        const day = third > 31 ? first : second;
        const month = third > 31 ? second : first;
        if (year >= 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
      return null;
    }
    if (fieldId === 'gender') {
      const lower = text.toLowerCase();
      if (lower.includes('female') || lower.includes('महिला') || lower.includes('स्त्री')) return 'Female';
      if (lower.includes('male') || lower.includes('पुरुष')) return 'Male';
      if (lower.includes('other') || lower.includes('अन्य') || lower.includes('इतर')) return 'Other';
      return null;
    }
    return text;
  };

  const applyInterviewAnswer = (fieldId: string, value: string) => {
    if (fieldId === 'fullName') { setFullName(value); checkDuplicates(phone, value); }
    if (fieldId === 'dateOfBirth') handleDobChange(value);
    if (fieldId === 'gender') setGender(value as 'Male' | 'Female' | 'Other');
    if (fieldId === 'mobile') { setPhone(value); checkDuplicates(value, fullName); }
    if (fieldId === 'email') setEmail(value);
    if (fieldId === 'pincode') setPinCode(value);
    if (fieldId === 'address') setAddress(value);
    if (fieldId === 'emergencyName') setEmergencyName(value);
    if (fieldId === 'emergencyRelation') setEmergencyRelation(value);
    if (fieldId === 'emergencyPhone') setEmergencyPhone(value);
  };

  // 2-Way Automatic Recalculation between DOB and Age
  const handleDobChange = (newDob: string) => {
    setDob(newDob);
    if (!newDob) return;
    const birthDate = new Date(newDob);
    if (!isNaN(birthDate.getTime())) {
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      if (calculatedAge > 0 && calculatedAge < 125) {
        setAge(calculatedAge);
      }
    }
  };

  const handleAgeChange = (newAge: number) => {
    setAge(newAge);
    if (newAge > 0 && newAge < 125) {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - newAge;
      // Approximate DOB maintaining current month/day or Jan 01
      const existingDate = dob ? new Date(dob) : new Date(`${birthYear}-01-01`);
      const month = String(existingDate.getMonth() + 1).padStart(2, '0');
      const day = String(existingDate.getDate()).padStart(2, '0');
      setDob(`${birthYear}-${month}-${day}`);
    }
  };

  // Real-time Duplicate Check
  const checkDuplicates = (testPhone: string, testName: string) => {
    const cleanPhone = testPhone.trim().replace(/\s+/g, '');
    const cleanName = testName.trim().toLowerCase();

    if (cleanPhone.length >= 8) {
      const match = existingPatients.find(
        (p) =>
          p.demographics.phone.replace(/\s+/g, '').includes(cleanPhone) ||
          (cleanName.length >= 3 && p.demographics.fullName.toLowerCase() === cleanName)
      );
      if (match) {
        setDuplicateMatch(match);
        return;
      }
    }
    setDuplicateMatch(null);
  };

  const handlePhoneBlur = () => {
    checkDuplicates(phone, fullName);
  };

  // Voice Input for Fields
  const handleVoiceDictation = (fieldName: 'name' | 'address' | 'phone') => {
    setVoiceError(null);
    if (!voiceRecognition.isSupported()) {
      setVoiceError('Speech recognition is not supported in this browser environment.');
      return;
    }

    if (isListeningField === fieldName) {
      voiceRecognition.stop();
      setIsListeningField(null);
      return;
    }

    setIsListeningField(fieldName);

    voiceRecognition.startListening(
      selectedLanguage,
      (result) => {
        const text = result.transcript;
        if (fieldName === 'name') {
          setFullName(text);
          checkDuplicates(phone, text);
        } else if (fieldName === 'address') {
          setAddress(text);
        } else if (fieldName === 'phone') {
          const digitsOnly = text.replace(/[^0-9]/g, '');
          setPhone(digitsOnly || text);
          checkDuplicates(digitsOnly || text, fullName);
        }
        setIsListeningField(null);
        voiceRecognition.stop();
      },
      (err) => {
        const friendly = getFriendlySpeechError(err);
        setVoiceError(friendly.message);
        setIsListeningField(null);
      }
    );
  };

  const commitInterviewAnswer = () => {
    if (!currentInterviewField || pendingAnswer === null) return;
    applyInterviewAnswer(currentInterviewField.id, pendingAnswer);
    setPendingAnswer(null);
    if (interviewIndex >= interviewFields.length - 1) {
      setInterviewPhase('complete');
      return;
    }
    setInterviewIndex((index) => index + 1);
  };

  const skipOptionalInterviewField = () => {
    if (!currentInterviewField || !['pincode', 'address', 'email'].includes(currentInterviewField.id)) return;
    setPendingAnswer('');
    applyInterviewAnswer(currentInterviewField.id, '');
    setPendingAnswer(null);
    if (interviewIndex >= interviewFields.length - 1) {
      setInterviewPhase('complete');
    } else {
      setInterviewIndex((index) => index + 1);
    }
  };

  const startInterviewListening = (session: number, fieldId: string, confirming: boolean) => {
    if (session !== interviewSession.current || !voiceRecognition.isSupported()) return;
    setInterviewPhase(confirming ? 'confirming' : 'listening');
    voiceRecognition.startListening(
      selectedLanguage,
      (result) => {
        if (session !== interviewSession.current || !result.transcript.trim()) return;
        voiceRecognition.stop();
        if (confirming) {
          const command = parseVoiceCommand(result.transcript, selectedLanguage);
          if (command === 'CONFIRM') commitInterviewAnswer();
          else if (command === 'CANCEL') {
            setPendingAnswer(null);
            setInterviewPhase('listening');
            startInterviewListening(session, fieldId, false);
          }
          return;
        }
        const parsed = parseInterviewAnswer(fieldId, result.transcript);
        if (parsed === null) {
          setVoiceError(t('registration.answer.invalid'));
          setInterviewPhase('listening');
          startInterviewListening(session, fieldId, false);
          return;
        }
        setPendingAnswer(parsed);
        setInterviewPhase('confirming');
        const confirmation = t('registration.answer.confirm').replace('{answer}', parsed || t('common.skip', 'skipped'));
        void speakText(confirmation, selectedLanguage).then(() => startInterviewListening(session, fieldId, true));
      },
      (error) => {
        if (session !== interviewSession.current) return;
        setVoiceError(getFriendlySpeechError(error).message);
        setInterviewPhase('idle');
      },
    );
  };

  useEffect(() => {
    if (!isInterviewMode || !currentInterviewField) return;
    const session = ++interviewSession.current;
    voiceRecognition.abort();
    stopSpeaking();
    setPendingAnswer(null);
    setVoiceError(null);
    setInterviewPhase('speaking');
    const timer = window.setTimeout(() => {
      void speakText(currentInterviewField.prompt, selectedLanguage).then(() => {
        if (session !== interviewSession.current) return;
        startInterviewListening(session, currentInterviewField.id, false);
      });
    }, 180);
    return () => {
      window.clearTimeout(timer);
      if (session === interviewSession.current) {
        interviewSession.current += 1;
        voiceRecognition.abort();
        stopSpeaking();
      }
    };
  }, [interviewIndex, selectedLanguage, isInterviewMode]);

  useEffect(() => {
    if (!isInterviewMode) {
      interviewSession.current += 1;
      voiceRecognition.abort();
      stopSpeaking();
      setInterviewPhase('idle');
    }
  }, [isInterviewMode]);

  const handleValidateAndContinue = () => {
    if (!fullName.trim()) {
      alert(t('registration.identity.fullName', 'Please enter patient full name.'));
      return;
    }
    if (!phone.trim()) {
      alert(t('registration.identity.mobile', 'Please enter patient mobile number.'));
      return;
    }
    onContinue();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <User className="w-3.5 h-3.5" />
            Step 4 of 10 • Patient Identity & Duplicate Check
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('registration.identity.title')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('registration.identity.subtitle')}
          </p>
          <button type="button" onClick={replay} className="mt-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400" aria-label={t('common.readAgain')}>
            {t('common.readAgain')}
          </button>
        </div>
      </div>

      {/* Voice Dictation Error Banner */}
      {voiceError && (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>{voiceError}</span>
        </div>
      )}

      {/* Duplicate Patient Alert Card */}
      {duplicateMatch && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-950 dark:text-amber-200 text-xs space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-900 dark:text-amber-300">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>{t('registration.identity.duplicate')}</span>
            </div>
            <span className="font-mono text-[11px] font-bold bg-amber-500/20 px-2 py-0.5 rounded">
              Token: {duplicateMatch.opdToken}
            </span>
          </div>

          <p className="leading-relaxed">
            A matching file was found for <strong>{duplicateMatch.demographics.fullName}</strong> ({duplicateMatch.demographics.age}Y, Phone: {duplicateMatch.demographics.phone}).
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {onSelectExistingPatient && (
              <button
                type="button"
                onClick={() => onSelectExistingPatient(duplicateMatch)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t('registration.identity.openFile')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setDuplicateMatch(null)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
            >
              {t('registration.identity.newVisit')}
            </button>
          </div>
        </div>
      )}

      {isInterviewMode && currentInterviewField && (
        <div className="max-w-2xl mx-auto space-y-5 rounded-3xl border border-cyan-500/30 bg-cyan-500/5 p-6 sm:p-8 text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            Question {interviewIndex + 1} of {interviewFields.length}
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">{currentInterviewField.prompt}</h3>
          <div className="text-xs font-semibold text-slate-500">
            {interviewPhase === 'speaking' && 'Speaking...'}
            {interviewPhase === 'listening' && 'Listening...'}
            {interviewPhase === 'confirming' && 'Please confirm your answer'}
            {interviewPhase === 'complete' && 'All identity details captured'}
          </div>
          {pendingAnswer !== null && (
            <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 p-4 text-left text-sm text-slate-800 dark:text-slate-200">
              <span className="block text-xs font-bold text-slate-500">You said</span>
              {pendingAnswer || 'Skipped'}
            </div>
          )}
          {voiceError && <div className="text-xs text-amber-600 dark:text-amber-400">{voiceError}</div>}
          <div className="flex flex-wrap justify-center gap-3">
            {interviewPhase === 'confirming' ? (
              <>
                <button type="button" onClick={commitInterviewAnswer} className="min-h-[48px] rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white">Yes, continue</button>
                <button type="button" onClick={() => { setPendingAnswer(null); startInterviewListening(interviewSession.current, currentInterviewField.id, false); }} className="min-h-[48px] rounded-2xl bg-slate-200 px-6 py-3 text-sm font-bold text-slate-800 dark:bg-slate-800 dark:text-white">No, try again</button>
              </>
            ) : interviewPhase === 'complete' ? (
              <button type="button" onClick={handleValidateAndContinue} className="min-h-[48px] rounded-2xl bg-cyan-600 px-7 py-3 text-sm font-bold text-white">Continue to Health Questions</button>
            ) : (
              <button type="button" onClick={() => { voiceRecognition.abort(); startInterviewListening(interviewSession.current, currentInterviewField.id, false); }} className="min-h-[48px] rounded-2xl bg-cyan-600 px-7 py-3 text-sm font-bold text-white">
                {interviewPhase === 'listening' ? 'Listening...' : 'Start Listening'}
              </button>
            )}
            {['pincode', 'address', 'email'].includes(currentInterviewField.id) && interviewPhase !== 'complete' && (
              <button type="button" onClick={skipOptionalInterviewField} className="min-h-[48px] rounded-2xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 dark:border-slate-600 dark:text-slate-200">
                Skip optional field
              </button>
            )}
            <button type="button" onClick={replay} className="min-h-[48px] rounded-2xl border border-cyan-500 px-5 py-3 text-sm font-bold text-cyan-700 dark:text-cyan-300">Read Again</button>
            <button type="button" onClick={() => setShowKeyboardFields(true)} className="min-h-[48px] rounded-2xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 dark:border-slate-600 dark:text-slate-200">Enter with keyboard</button>
          </div>
        </div>
      )}

      {/* Form Fields Grid */}
      {showKeyboardFields && <div className="space-y-3">
        {isInterviewMode && <div className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-xs text-slate-600 dark:text-slate-300"><span>Keyboard and touch entry are available for every field.</span><button type="button" onClick={() => setShowKeyboardFields(false)} className="font-bold text-cyan-600 dark:text-cyan-400">Hide keyboard form</button></div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
        {/* Full Name with Voice Mic */}
        <div className="md:col-span-2">
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('registration.identity.fullName')} *
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              required
              id="patient-fullname"
              placeholder="e.g. Rahul S. Patil"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                checkDuplicates(phone, e.target.value);
              }}
              className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-12"
            />
            <button
              type="button"
              onClick={() => handleVoiceDictation('name')}
              className={`absolute right-2 p-2 rounded-xl transition-all ${
                isListeningField === 'name'
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Speak name"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('registration.identity.gender')} *
          </label>
          <select
            value={gender}
            id="patient-gender"
            onChange={(e: any) => setGender(e.target.value)}
            className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
          >
            <option value="Male">{t('registration.identity.male')}</option>
            <option value="Female">{t('registration.identity.female')}</option>
            <option value="Other">{t('registration.identity.other')}</option>
          </select>
        </div>

        {/* Date of Birth (2-way recalculation) */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('registration.identity.dateOfBirth')}
          </label>
          <input
            type="date"
            id="patient-dob"
            value={dob}
            onChange={(e) => handleDobChange(e.target.value)}
            className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
          />
        </div>

        {/* Age (Years) (2-way recalculation) */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('registration.identity.age')} *
          </label>
          <input
            type="number"
            min="1"
            max="120"
            id="patient-age"
            value={age}
            onChange={(e) => handleAgeChange(Number(e.target.value))}
            className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
          />
        </div>

        {/* Mobile Number with onBlur duplicate check and Voice Mic */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('registration.identity.mobile')} *
          </label>
          <div className="relative flex items-center">
            <input
              type="tel"
              required
              id="patient-phone"
              placeholder="+91 98201 54321"
              value={phone}
              onBlur={handlePhoneBlur}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none pr-12"
            />
            <button
              type="button"
              onClick={() => handleVoiceDictation('phone')}
              className={`absolute right-2 p-2 rounded-xl transition-all ${
                isListeningField === 'phone'
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Speak phone digits"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('registration.identity.email')} ({t('registration.identity.optional', 'Optional')})
          </label>
          <input
            type="email"
            id="patient-email"
            placeholder="patient@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
          />
        </div>

        {/* PIN Code */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('registration.identity.pincode')} <span className="font-normal text-slate-400">(Optional)</span>
          </label>
          <input
            type="text"
            id="patient-pincode"
            maxLength={6}
            placeholder="e.g. 400601"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-3">
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('registration.identity.address')} <span className="font-normal text-slate-400">(Optional)</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              id="patient-address"
              placeholder="e.g. Flat 302, Gokul Heights, Naupada, Thane West, Maharashtra"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none pr-12"
            />
            <button
              type="button"
              onClick={() => handleVoiceDictation('address')}
              className={`absolute right-2 p-2 rounded-xl transition-all ${
                isListeningField === 'address'
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Speak address"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Emergency Contact Header */}
        <div className="md:col-span-3 pt-2">
          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-2">
            {t('registration.identity.emergencyName')}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sunita Patil"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Relationship
              </label>
              <input
                type="text"
                placeholder="e.g. Spouse / Parent"
                value={emergencyRelation}
                onChange={(e) => setEmergencyRelation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('registration.identity.emergencyPhone')}
              </label>
              <input
                type="tel"
                placeholder="+91 98201 54322"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>
        </div>
      </div>}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Consent
        </button>

        <button
          type="button"
          id="btn-identity-continue"
          onClick={handleValidateAndContinue}
          className="px-7 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all"
        >
          <span>Continue to Health Questions</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
