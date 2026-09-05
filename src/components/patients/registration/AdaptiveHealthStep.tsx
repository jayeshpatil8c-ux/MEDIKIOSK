import React, { useState } from 'react';
import {
  Stethoscope,
  AlertTriangle,
  Flame,
  Activity,
  HeartCrack,
  Clock,
  Mic,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  HelpCircle,
  Volume2,
} from 'lucide-react';
import { VoiceLanguage, voiceRecognition, getFriendlySpeechError, speakText } from '../../../utils/speechHelper';

interface Props {
  reasonForVisit: 'unwell' | 'followup' | 'review' | 'routine';
  setReasonForVisit: (val: 'unwell' | 'followup' | 'review' | 'routine') => void;
  chiefComplaint: string;
  setChiefComplaint: (val: string) => void;
  symptomDuration: string;
  setSymptomDuration: (val: string) => void;
  symptomSeverity: 'Mild' | 'Moderate' | 'Severe';
  setSymptomSeverity: (val: 'Mild' | 'Moderate' | 'Severe') => void;
  symptomLocation: string;
  setSymptomLocation: (val: string) => void;
  hasSecondaryComplaint: boolean;
  setHasSecondaryComplaint: (val: boolean) => void;
  secondaryComplaint: string;
  setSecondaryComplaint: (val: string) => void;
  urgencyScreen: 'No' | 'Yes';
  setUrgencyScreen: (val: 'No' | 'Yes') => void;
  selectedLanguage: VoiceLanguage;
  onBack: () => void;
  onContinue: () => void;
}

export const AdaptiveHealthStep: React.FC<Props> = ({
  reasonForVisit,
  setReasonForVisit,
  chiefComplaint,
  setChiefComplaint,
  symptomDuration,
  setSymptomDuration,
  symptomSeverity,
  setSymptomSeverity,
  symptomLocation,
  setSymptomLocation,
  hasSecondaryComplaint,
  setHasSecondaryComplaint,
  secondaryComplaint,
  setSecondaryComplaint,
  urgencyScreen,
  setUrgencyScreen,
  selectedLanguage,
  onBack,
  onContinue,
}) => {
  const [activeBranch, setActiveBranch] = useState<'gastric' | 'fever' | 'headache' | 'chest' | 'custom'>('gastric');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);

  // Common symptom presets for rapid touch
  const symptomPresets = [
    {
      id: 'gastric' as const,
      label: 'Abdominal / Stomach Pain & Acidity',
      icon: Flame,
      defaultComplaint: 'Epigastric stomach pain, sour eructations, and burning sensation (Gastritis)',
      defaultLocation: 'Upper abdomen / Epigastrium',
      isRedFlag: false,
    },
    {
      id: 'fever' as const,
      label: 'Fever, Chills & Body Ache',
      icon: Activity,
      defaultComplaint: 'High grade fever with chills and generalized body weakness',
      defaultLocation: 'Generalized / Forehead',
      isRedFlag: false,
    },
    {
      id: 'headache' as const,
      label: 'Severe Headache / Migraine',
      icon: HelpCircle,
      defaultComplaint: 'Throbbing frontal headache, nausea, and sensitivity to bright light',
      defaultLocation: 'Frontal / Temporal region',
      isRedFlag: false,
    },
    {
      id: 'chest' as const,
      label: 'Chest Discomfort / Heaviness',
      icon: HeartCrack,
      defaultComplaint: 'Substernal chest heaviness, pressure, and shortness of breath',
      defaultLocation: 'Center of chest / Retrosternal',
      isRedFlag: true,
    },
  ];

  const handleSelectPreset = (preset: typeof symptomPresets[0]) => {
    setActiveBranch(preset.id);
    setChiefComplaint(preset.defaultComplaint);
    setSymptomLocation(preset.defaultLocation);
    if (preset.isRedFlag) {
      setUrgencyScreen('Yes');
    }
  };

  const handleVoiceInput = () => {
    setVoiceNote(null);
    if (!voiceRecognition.isSupported()) {
      setVoiceNote('Speech recognition is not available in this browser.');
      return;
    }

    if (isListening) {
      voiceRecognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setVoiceNote('Listening... Please describe your symptoms clearly.');

    voiceRecognition.startListening(
      selectedLanguage,
      (result) => {
        setChiefComplaint(result.transcript);
        setVoiceNote(`Captured: "${result.transcript}"`);
        setIsListening(false);
        voiceRecognition.stop();
      },
      (err) => {
        const friendly = getFriendlySpeechError(err);
        setVoiceNote(friendly.message);
        setIsListening(false);
      }
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Stethoscope className="w-3.5 h-3.5" />
            Step 5 of 10 • Adaptive Health Questions
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {selectedLanguage === 'Marathi'
                ? 'आरोग्य समस्या व लक्षणे'
                : selectedLanguage === 'Hindi'
                ? 'स्वास्थ्य समस्या और लक्षण'
                : 'Reason for Visit & Symptom Assessment'}
            </h2>
            <button
              type="button"
              onClick={() => {
                const q =
                  selectedLanguage === 'Marathi'
                    ? 'तुम्हाला सध्या कोणती समस्या जाणवत आहे?'
                    : selectedLanguage === 'Hindi'
                    ? 'आपको वर्तमान में कौन सी समस्या महसूस हो रही है?'
                    : 'What health symptoms are you experiencing today?';
                speakText(q, selectedLanguage);
              }}
              className="p-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 transition-colors"
              title="Hear question aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {selectedLanguage === 'Marathi'
              ? 'तुम्हाला सध्या कोणती समस्या जाणवत आहे? मुख्य लक्षण निवडा किंवा बोला.'
              : 'Select your main symptom category or describe your discomfort using voice dictation.'}
          </p>
        </div>

        {/* Voice Dictation Button */}
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 ${
            isListening
              ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>{isListening ? 'Listening...' : 'Speak Symptoms'}</span>
        </button>
      </div>

      {voiceNote && (
        <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-800 dark:text-cyan-300">
          {voiceNote}
        </div>
      )}

      {/* Immediate RED FLAG Warning for Chest Discomfort */}
      {(activeBranch === 'chest' || urgencyScreen === 'Yes') && (
        <div className="p-4 rounded-3xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-950 dark:text-rose-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-700 dark:text-rose-300">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 animate-pulse" />
            <span>CLINICAL RED FLAG: Immediate Triage Required</span>
          </div>
          <p className="leading-relaxed text-rose-900 dark:text-rose-200">
            Sudden chest discomfort, retrosternal pain, or breathlessness requires urgent assessment. A high-priority Triage Alert is flagged on the Nurse and Doctor monitors. If symptoms are worsening, please notify the nearby hospital attendant immediately.
          </p>
        </div>
      )}

      {/* Symptom Category Preset Buttons */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Select Primary Symptom Category
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {symptomPresets.map((preset) => {
            const Icon = preset.icon;
            const isSelected = activeBranch === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? preset.isRedFlag
                      ? 'border-rose-500 bg-rose-500/10 shadow-md ring-2 ring-rose-400'
                      : 'border-cyan-500 bg-cyan-500/10 shadow-md ring-2 ring-cyan-400'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      preset.isRedFlag
                        ? 'bg-rose-500/20 text-rose-600'
                        : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                      Active
                    </span>
                  )}
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                  {preset.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chief Complaint Description Box */}
      <div className="space-y-1.5 text-xs">
        <label className="block font-bold text-slate-700 dark:text-slate-300">
          Chief Complaint Description *
        </label>
        <textarea
          rows={3}
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
          placeholder="Describe what feels uncomfortable, when it started, and what makes it better or worse..."
          className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Severity and Duration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Severity Selection */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
            Symptom Severity
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Mild', 'Moderate', 'Severe'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSymptomSeverity(sev)}
                className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                  symptomSeverity === sev
                    ? sev === 'Severe'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : sev === 'Moderate'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Duration Selection */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
            Duration
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {['Hours', '1-3 Days', '1-2 Weeks', '1+ Month'].map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => setSymptomDuration(dur)}
                className={`py-2.5 rounded-xl font-bold text-[11px] border transition-all ${
                  symptomDuration === dur
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {dur}
              </button>
            ))}
          </div>
        </div>

        {/* Symptom Site */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
            Specific Location / Body Area
          </label>
          <input
            type="text"
            value={symptomLocation}
            onChange={(e) => setSymptomLocation(e.target.value)}
            placeholder="e.g. Upper abdomen / right flank"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Secondary Symptom Toggle */}
      <div className="pt-2">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={hasSecondaryComplaint}
            onChange={(e) => setHasSecondaryComplaint(e.target.checked)}
            className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
          />
          <span>I have an additional symptom or complaint to report</span>
        </label>

        {hasSecondaryComplaint && (
          <div className="mt-2 text-xs">
            <input
              type="text"
              placeholder="e.g. Nausea and loss of appetite for 2 days"
              value={secondaryComplaint}
              onChange={(e) => setSecondaryComplaint(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Identity
        </button>

        <button
          type="button"
          id="btn-health-continue"
          onClick={onContinue}
          className="px-7 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all"
        >
          <span>Continue to Medical History & Allergies</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
