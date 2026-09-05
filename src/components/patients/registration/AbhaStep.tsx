import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  QrCode,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { VoiceLanguage } from '../../../utils/speechHelper';

interface Props {
  abhaId: string;
  setAbhaId: (id: string) => void;
  isAbhaVerified: boolean;
  setIsAbhaVerified: (val: boolean) => void;
  fullName: string;
  dob: string;
  gender: string;
  selectedLanguage: VoiceLanguage;
  onBack: () => void;
  onContinue: () => void;
}

export const AbhaStep: React.FC<Props> = ({
  abhaId,
  setAbhaId,
  isAbhaVerified,
  setIsAbhaVerified,
  fullName,
  dob,
  gender,
  onBack,
  onContinue,
}) => {
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otpValue, setOtpValue] = useState<string>('123456');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleFormatAbha = (val: string) => {
    // Digits only
    const digits = val.replace(/[^0-9]/g, '').slice(0, 14);
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i === 2 || i === 6 || i === 10) {
        formatted += '-';
      }
      formatted += digits[i];
    }
    setAbhaId(formatted);
  };

  const handleVerifyClick = () => {
    if (!abhaId || abhaId.length < 14) {
      // Allow demo filling
      setAbhaId('91-8472-9102-3841');
    }
    setShowOtpModal(true);
  };

  const handleConfirmOtp = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setShowOtpModal(false);
      setIsAbhaVerified(true);
      if (!abhaId) {
        setAbhaId('91-8472-9102-3841');
      }
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <CreditCard className="w-3.5 h-3.5" />
            Step 8 of 10 • Ayushman Bharat Digital Mission (ABDM)
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            ABHA ID Linkage & National Health Account
          </h2>
          <p className="text-xs text-slate-500">
            Link your 14-digit ABHA Number to seamlessly store OPD prescriptions and diagnostic reports digitally.
          </p>
        </div>

        {/* Sandbox Indicator */}
        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-bold flex items-center gap-1.5 w-fit">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ABDM Sandbox / Demo Active</span>
        </span>
      </div>

      {/* ABHA Card Box */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border border-blue-800/40 shadow-xl relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-black text-xs text-white">
              🇮🇳
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                National Health Authority (NHA)
              </span>
              <span className="text-xs font-black tracking-wider">
                AYUSHMAN BHARAT HEALTH ACCOUNT
              </span>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
              isAbhaVerified
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300'
            }`}
          >
            {isAbhaVerified ? '✓ Verified & Linked' : 'Unlinked'}
          </span>
        </div>

        {/* ABHA Input Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            14-Digit ABHA Number (XX-XXXX-XXXX-XXXX)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              id="abha-number-input"
              value={abhaId}
              placeholder="91-8472-9102-3841"
              onChange={(e) => handleFormatAbha(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-white font-mono text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="button"
              id="btn-verify-abha"
              onClick={handleVerifyClick}
              className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAbhaVerified ? 'Re-verify ABHA' : 'Verify via Aadhaar OTP'}</span>
            </button>
          </div>
        </div>

        {/* Demo Fast Fill Button */}
        {!isAbhaVerified && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Don't know your ABHA?</span>
            <button
              type="button"
              onClick={() => {
                setAbhaId('91-8472-9102-3841');
                setShowOtpModal(true);
              }}
              className="text-cyan-400 hover:underline font-semibold"
            >
              ⚡ Use Demo ABHA Profile (Auto-Fill)
            </button>
          </div>
        )}

        {/* Verified Profile Card Preview */}
        {isAbhaVerified && (
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">
                Verified Health Record Holder
              </span>
              <div className="text-base font-black text-white">{fullName || 'Rahul S. Patil'}</div>
              <div className="text-slate-300 font-mono text-[11px]">
                ABHA: {abhaId} • Gender: {gender}
              </div>
            </div>
            <div className="w-16 h-16 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
              <QrCode className="w-14 h-14 text-slate-900" />
            </div>
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-scaleUp text-xs">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center mb-2">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Enter Aadhaar OTP
              </h3>
              <p className="text-slate-500">
                A 6-digit one-time code was sent to the mobile linked with ABHA ({abhaId}).
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Demo OTP Code (Pre-filled: 123456)
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                className="w-full text-center py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xl tracking-widest font-bold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-otp"
                onClick={handleConfirmOtp}
                disabled={isVerifying}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md"
              >
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Documents
        </button>

        <div className="flex items-center gap-3">
          {!isAbhaVerified && (
            <button
              type="button"
              onClick={onContinue}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Skip ABHA for this visit
            </button>
          )}

          <button
            type="button"
            id="btn-abha-continue"
            onClick={onContinue}
            className="px-7 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all"
          >
            <span>Continue to Final Review</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
