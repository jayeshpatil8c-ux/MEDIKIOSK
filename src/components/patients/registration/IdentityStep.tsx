import React, { useState } from 'react';
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
import { VoiceLanguage, voiceRecognition, getFriendlySpeechError } from '../../../utils/speechHelper';
import { Patient } from '../../../types';

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
  const [duplicateMatch, setDuplicateMatch] = useState<Patient | null>(null);
  const [isListeningField, setIsListeningField] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

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

  const handleValidateAndContinue = () => {
    if (!fullName.trim()) {
      alert('Please enter patient full name.');
      return;
    }
    if (!phone.trim()) {
      alert('Please enter patient mobile number.');
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
            Patient Personal & Demographics Details
          </h2>
          <p className="text-xs text-slate-500">
            Touch to type or speak into any field. Real-time duplicate detection protects your existing file.
          </p>
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
              <span>Existing Hospital Patient Record Found!</span>
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
                <span>Open Existing Patient File</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setDuplicateMatch(null)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
            >
              Continue as New Visit / Registration
            </button>
          </div>
        </div>
      )}

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
        {/* Full Name with Voice Mic */}
        <div className="md:col-span-2">
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Full Name *
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
            Gender *
          </label>
          <select
            value={gender}
            id="patient-gender"
            onChange={(e: any) => setGender(e.target.value)}
            className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Date of Birth (2-way recalculation) */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Date of Birth
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
            Age (Years) *
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
            Mobile Number *
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
            Email Address (Optional)
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
            Postal PIN Code
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
            Residential Address (Locality, City, State)
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
            Emergency Contact Person
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
                Emergency Phone
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
