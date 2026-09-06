import React, { useState, useEffect } from 'react';
import {
  Printer,
  Volume2,
  CheckCircle2,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  QrCode,
  User,
  Stethoscope,
} from 'lucide-react';
import { VoiceLanguage, speakText } from '../../../utils/speechHelper';
import { Patient } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';

interface Props {
  patient: Patient;
  tokenNumber: string;
  chamberNumber: string;
  department: string;
  waitTime: string;
  selectedLanguage: VoiceLanguage;
  isVoiceEnabled: boolean;
  onProceedToDoctor: () => void;
}

export const TokenSlipStep: React.FC<Props> = ({
  patient,
  tokenNumber,
  chamberNumber,
  department,
  waitTime,
  selectedLanguage,
  isVoiceEnabled,
  onProceedToDoctor,
}) => {
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState<number>(6);
  const [autoRedirect, setAutoRedirect] = useState<boolean>(true);

  // Auto announcement on mount
  useEffect(() => {
    const announceSlip = () => {
      const announcement =
        selectedLanguage === 'Hindi'
          ? `टोकन संख्या ${tokenNumber}। कृपया ओपीडी कक्ष संख्या ${chamberNumber} में जाएं। अनुमानित प्रतीक्षा समय ${waitTime} है।`
          : selectedLanguage === 'Marathi'
          ? `टोकन क्रमांक ${tokenNumber}. कृपया ओपीडी कक्ष क्रमांक ${chamberNumber} कडे जावे. अंदाजे प्रतीक्षा वेळ ${waitTime} आहे.`
          : `Token number ${tokenNumber}. Please proceed to ${chamberNumber}, ${department}. Estimated wait time is ${waitTime}.`;

      if (isVoiceEnabled) {
        speakText(announcement, selectedLanguage);
      }
    };

    announceSlip();
  }, [tokenNumber, chamberNumber, department, waitTime, selectedLanguage, isVoiceEnabled]);

  // Countdown timer to automatically proceed to Doctor Consultation
  useEffect(() => {
    if (!autoRedirect) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onProceedToDoctor();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirect, onProceedToDoctor]);

  const handleManualVoiceAnnounce = () => {
    const announcement =
      selectedLanguage === 'Hindi'
        ? `टोकन संख्या ${tokenNumber}। कृपया ओपीडी कक्ष संख्या ${chamberNumber} में जाएं।`
        : selectedLanguage === 'Marathi'
        ? `टोकन क्रमांक ${tokenNumber}. कृपया ओपीडी कक्ष क्रमांक ${chamberNumber} कडे जावे.`
        : `Token number ${tokenNumber}. Please proceed to ${chamberNumber}.`;

    speakText(announcement, selectedLanguage);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Success Badge */}
      <div className="text-center space-y-2 pb-2">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-scaleUp">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('registration.token.title')}!
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Your OPD Consultation Slip has been generated. Your clinical file is now open on the Doctor's Station.
        </p>
      </div>

      {/* OPD Token Slip Card (Printable Thermal/Digital Slip Layout) */}
      <div
        id="printable-opd-token-slip"
        className="max-w-md mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-cyan-500/40 shadow-2xl text-slate-900 dark:text-white space-y-4 relative"
      >
        {/* Slip Top Brand */}
        <div className="text-center border-b border-slate-100 dark:border-slate-800 pb-3 space-y-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            MediKiosk Clinical Platform
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            City Post Graduate Medical College & Hospital
          </div>
          <div className="text-[10px] text-slate-400">
            AYUSH Integrative Wellness & Holistic Care Station
          </div>
        </div>

        {/* Large Prominent Token Number */}
        <div className="text-center py-2 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/20 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            OPD Queue Token Number
          </span>
          <div className="text-5xl font-black text-cyan-600 dark:text-cyan-400 font-mono tracking-wider">
            {tokenNumber}
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {department}
          </div>
        </div>

        {/* Room & Wait Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-500" /> Assigned Chamber
            </span>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white">
              {chamberNumber}
            </div>
            <span className="text-[10px] text-slate-500 block">Ground Floor OPD</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-500" /> Est. Wait Time
            </span>
            <div className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
              {waitTime}
            </div>
            <span className="text-[10px] text-slate-500 block">2 patients ahead</span>
          </div>
        </div>

        {/* Patient Demographic Summary on Slip */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Patient:</span>
            <strong className="text-slate-900 dark:text-white">{patient.demographics.fullName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Age / Gender:</span>
            <span>
              {patient.demographics.age}Y • {patient.demographics.gender}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Contact:</span>
            <span className="font-mono">{patient.demographics.phone}</span>
          </div>
          {patient.abhaId && (
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-400">ABHA ID:</span>
              <span className="text-cyan-600 dark:text-cyan-400">{patient.abhaId}</span>
            </div>
          )}
        </div>

        {/* QR Code on Slip */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 space-y-0.5">
            <div>Timestamp: {new Date().toLocaleTimeString()}</div>
            <div>Robinia 30 Study Consent: VERIFIED</div>
          </div>
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 flex items-center justify-center">
            <QrCode className="w-10 h-10 text-slate-700 dark:text-slate-300" />
          </div>
        </div>
      </div>

      {/* Slip Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors"
        >
          <Printer className="w-4 h-4 text-cyan-500" />
          <span>Print Slip</span>
        </button>

        <button
          type="button"
          onClick={handleManualVoiceAnnounce}
          className="px-5 py-2.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs flex items-center gap-2 border border-cyan-500/30 transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          <span>🔊 Repeat Announcement ({selectedLanguage})</span>
        </button>
      </div>

      {/* Auto-redirect Timer Banner and Immediate Consultation Button */}
      <div className="max-w-md mx-auto p-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-center space-y-2 shadow-lg shadow-cyan-600/20">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold">
          <Stethoscope className="w-4 h-4" />
          <span>
            {autoRedirect
              ? `Transferring to Doctor Station in ${countdown}s...`
              : 'File ready on Doctor Station'}
          </span>
        </div>

        <button
          type="button"
          id="btn-proceed-to-doctor"
          onClick={() => {
            setAutoRedirect(false);
            onProceedToDoctor();
          }}
          className="w-full py-3 rounded-xl bg-white text-cyan-700 hover:bg-slate-100 font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all"
        >
          <span>Proceed to Doctor Consultation Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {autoRedirect && (
          <button
            type="button"
            onClick={() => setAutoRedirect(false)}
            className="text-[11px] text-cyan-100 hover:underline pt-1 block mx-auto"
          >
            Pause auto-redirect
          </button>
        )}
      </div>
    </div>
  );
};
