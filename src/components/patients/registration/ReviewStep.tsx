import React from 'react';
import {
  ClipboardCheck,
  User,
  Heart,
  FileText,
  CreditCard,
  Edit2,
  Volume2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { VoiceLanguage, speakText } from '../../../utils/speechHelper';
import { MedicalDocument } from '../../../types';

interface Props {
  fullName: string;
  age: number;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  chiefComplaint: string;
  symptomSeverity: string;
  symptomDuration: string;
  symptomLocation: string;
  chronicConditions: string[];
  pastSurgery: string;
  pastSurgeriesList: { procedure: string; year: string }[];
  hasAllergies: string;
  knownAllergies: string;
  currentMedications: string;
  scannedDocuments: MedicalDocument[];
  abhaId: string;
  isAbhaVerified: boolean;
  patientSignature: string;
  witnessName: string;
  selectedLanguage: VoiceLanguage;
  onNavigateToStep: (stepNumber: number) => void;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export const ReviewStep: React.FC<Props> = ({
  fullName,
  age,
  dob,
  gender,
  phone,
  email,
  address,
  emergencyName,
  emergencyRelation,
  emergencyPhone,
  chiefComplaint,
  symptomSeverity,
  symptomDuration,
  symptomLocation,
  chronicConditions,
  pastSurgery,
  pastSurgeriesList,
  hasAllergies,
  knownAllergies,
  currentMedications,
  scannedDocuments,
  abhaId,
  isAbhaVerified,
  patientSignature,
  witnessName,
  selectedLanguage,
  onNavigateToStep,
  onBack,
  onConfirm,
  isSubmitting,
}) => {
  const handleReadAloudSummary = () => {
    const summaryText =
      selectedLanguage === 'Hindi'
        ? `मरीज का नाम: ${fullName}। उम्र: ${age} वर्ष। मुख्य शिकायत: ${chiefComplaint}। मोबाइल: ${phone}। क्या आप टोकन जारी करने के लिए तैयार हैं?`
        : selectedLanguage === 'Marathi'
        ? `रुग्णाचे नाव: ${fullName}. वय: ${age} वर्षे. मुख्य तक्रार: ${chiefComplaint}. मोबाईल: ${phone}. आपण ओपीडी टोकन तयार करण्यास तयार आहात का?`
        : `Patient name: ${fullName}. Age: ${age} years. Chief complaint: ${chiefComplaint}. Contact: ${phone}. Ready to generate OPD token slip.`;

    speakText(summaryText, selectedLanguage);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ClipboardCheck className="w-3.5 h-3.5" />
            Step 9 of 10 • Pre-Consultation Review
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Review Registration Information
          </h2>
          <p className="text-xs text-slate-500">
            Verify patient details before generating the official OPD queue token. Touch "Edit" on any section to revise.
          </p>
        </div>

        {/* Read Summary Voice Button */}
        <button
          type="button"
          onClick={handleReadAloudSummary}
          className="px-4 py-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs flex items-center gap-2 border border-cyan-500/30 transition-all w-fit"
        >
          <Volume2 className="w-4 h-4" />
          <span>🔊 Read Aloud Review</span>
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Card 1: Identity & Demographics */}
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3 relative">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-500" />
              1. Demographics & Contact
            </h3>
            <button
              type="button"
              onClick={() => onNavigateToStep(4)}
              className="text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1 hover:underline text-[11px]"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>

          <div className="space-y-1 text-slate-700 dark:text-slate-300">
            <div>
              <span className="text-slate-400">Full Name:</span>{' '}
              <strong className="text-slate-900 dark:text-white text-sm">{fullName}</strong>
            </div>
            <div>
              <span className="text-slate-400">Age & Gender:</span>{' '}
              <strong>
                {age} Years • {gender} (DOB: {dob || 'Not specified'})
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Phone:</span>{' '}
              <strong className="font-mono">{phone}</strong>
            </div>
            {email && (
              <div>
                <span className="text-slate-400">Email:</span> {email}
              </div>
            )}
            <div>
              <span className="text-slate-400">Address:</span> {address || 'Thane, Maharashtra'}
            </div>
            {emergencyName && (
              <div className="pt-1 border-t border-slate-200 dark:border-slate-800/60 text-[11px]">
                <span className="text-slate-400">Emergency:</span>{' '}
                <strong>
                  {emergencyName} ({emergencyRelation}) - {emergencyPhone}
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Symptoms & Health Questionnaire */}
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3 relative">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-cyan-500" />
              2. Reason for Visit & Symptoms
            </h3>
            <button
              type="button"
              onClick={() => onNavigateToStep(5)}
              className="text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1 hover:underline text-[11px]"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>

          <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
            <div>
              <span className="text-slate-400 block text-[11px]">Chief Complaint:</span>
              <p className="font-semibold text-slate-900 dark:text-white leading-relaxed">
                {chiefComplaint || 'Epigastric stomach pain & hyperacidity'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold text-[11px]">
                Severity: {symptomSeverity}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                Duration: {symptomDuration}
              </span>
              {symptomLocation && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                  Site: {symptomLocation}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Medical History & Allergies */}
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3 relative">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-500" />
              3. History & Allergies
            </h3>
            <button
              type="button"
              onClick={() => onNavigateToStep(6)}
              className="text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1 hover:underline text-[11px]"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>

          <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
            <div>
              <span className="text-slate-400">Allergies:</span>{' '}
              {hasAllergies === 'Yes' ? (
                <strong className="text-rose-600 font-bold">{knownAllergies || 'Yes'}</strong>
              ) : (
                <span className="text-emerald-600 font-semibold">No Known Drug Allergies</span>
              )}
            </div>
            <div>
              <span className="text-slate-400">Chronic Conditions:</span>{' '}
              {chronicConditions.length > 0 ? (
                <span>{chronicConditions.join(', ')}</span>
              ) : (
                <span className="text-slate-500">None reported</span>
              )}
            </div>
            <div>
              <span className="text-slate-400">Surgeries:</span>{' '}
              {pastSurgeriesList.length > 0 ? (
                <span>
                  {pastSurgeriesList.map((s) => `${s.procedure} (${s.year})`).join(', ')}
                </span>
              ) : (
                <span className="text-slate-500">No past surgeries</span>
              )}
            </div>
            {currentMedications && (
              <div>
                <span className="text-slate-400">Medications:</span>{' '}
                <span>{currentMedications}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Documents & ABHA */}
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3 relative">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-500" />
              4. ABHA & Medical Records
            </h3>
            <button
              type="button"
              onClick={() => onNavigateToStep(8)}
              className="text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1 hover:underline text-[11px]"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>

          <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
            <div>
              <span className="text-slate-400">ABHA Status:</span>{' '}
              {isAbhaVerified ? (
                <span className="text-emerald-600 font-bold font-mono">
                  Linked ({abhaId})
                </span>
              ) : (
                <span className="text-slate-500">Unlinked / Skipped</span>
              )}
            </div>
            <div>
              <span className="text-slate-400">Attached Documents:</span>{' '}
              <strong className="text-slate-900 dark:text-white">
                {scannedDocuments.length} Clinical Record(s) verified by OCR
              </strong>
            </div>
          </div>
        </div>

        {/* Card 5: Robinia 30 Mandatory Consent */}
        <div className="md:col-span-2 p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 relative">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <h3 className="font-extrabold text-emerald-950 dark:text-emerald-300 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              5. Mandatory Robinia 30 Case Series Study Informed Consent
            </h3>
            <button
              type="button"
              onClick={() => onNavigateToStep(3)}
              className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline text-[11px]"
            >
              <Edit2 className="w-3 h-3" /> Review Consent
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Consent Form Verified & Confirmed in {selectedLanguage}</span>
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                Institutional Ethics Committee Protocol (IEC/PGH-HOM/2026/CS-04) • Witness: {witnessName}
              </p>
            </div>

            {patientSignature && (
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800">
                <span className="text-[10px] text-slate-400 block mb-1">Captured Signature:</span>
                <img
                  src={patientSignature}
                  alt="Patient Signature"
                  className="h-10 max-w-[140px] object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to ABHA
        </button>

        <button
          type="button"
          id="btn-confirm-registration"
          disabled={isSubmitting}
          onClick={onConfirm}
          className="w-full sm:w-auto px-9 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-600/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Generating OPD Slip...' : 'CONFIRM & GENERATE OPD TOKEN'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
