import React, { useState, useEffect } from 'react';
import {
  Globe,
  Mic,
  FileText,
  User,
  Heart,
  Stethoscope,
  CreditCard,
  ClipboardCheck,
  Ticket,
  AlertTriangle,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  XCircle,
  Clock,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { usePatients } from '../../context/PatientContext';
import { VoiceLanguage, speakText, stopSpeaking, voiceRecognition, parseVoiceCommand } from '../../utils/speechHelper';
import { Patient, MedicalDocument, ConsentRecord } from '../../types';

// Step Sub-Components
import { LanguageSelectionStep } from './registration/LanguageSelectionStep';
import { VoiceSetupStep } from './registration/VoiceSetupStep';
import { ConsentStep } from './registration/ConsentStep';
import { IdentityStep } from './registration/IdentityStep';
import { AdaptiveHealthStep } from './registration/AdaptiveHealthStep';
import { MedicalHistoryStep } from './registration/MedicalHistoryStep';
import { DocumentScannerStep } from './registration/DocumentScannerStep';
import { AbhaStep } from './registration/AbhaStep';
import { ReviewStep } from './registration/ReviewStep';
import { TokenSlipStep } from './registration/TokenSlipStep';
import { MarathiVoiceDebugPanel } from './registration/MarathiVoiceDebugPanel';
import { MarathiVoiceUnavailableModal } from './registration/MarathiVoiceUnavailableModal';

interface Props {
  onRegistrationComplete: (patient: Patient) => void;
  onNavigateTab: (tab: string) => void;
  initialLanguage?: VoiceLanguage;
  initialVoiceEnabled?: boolean;
}

export const PatientRegistrationView: React.FC<Props> = ({
  onRegistrationComplete,
  onNavigateTab,
  initialLanguage = 'English',
  initialVoiceEnabled = true,
}) => {
  const { registerPatient, patients, selectPatient } = usePatients();

  // 10-Step Sequential State Machine:
  // 1: Language Selection
  // 2: Voice Setup & Mic Test
  // 3: Mandatory Informed Consent (Robinia 30 Study)
  // 4: Patient Identity & Duplicate Detection
  // 5: Adaptive Health Questions & Symptoms
  // 6: Past Medical History & Allergies
  // 7: Document Scanning & OCR Verification
  // 8: ABHA ID Integration
  // 9: Review & Confirmation
  // 10: OPD Token Slip
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);

  // Global Language & Voice State
  const [selectedLanguage, setSelectedLanguage] = useState<VoiceLanguage>(initialLanguage);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(initialVoiceEnabled);
  const [isGlobalMicListening, setIsGlobalMicListening] = useState<boolean>(false);
  const [voiceNotification, setVoiceNotification] = useState<string | null>(null);

  // Decline Consent Modal State
  const [showDeclineModal, setShowDeclineModal] = useState<boolean>(false);
  const [showVoiceDebugPanel, setShowVoiceDebugPanel] = useState<boolean>(false);
  const [showMarathiUnavailableModal, setShowMarathiUnavailableModal] = useState<boolean>(false);

  // Step 3: Consent Form State
  const [consentReadConfirmed, setConsentReadConfirmed] = useState<boolean>(false);
  const [consentLanguageConfirmed, setConsentLanguageConfirmed] = useState<boolean>(false);
  const [consentQuestionsAnswered, setConsentQuestionsAnswered] = useState<boolean>(false);
  const [patientSignature, setPatientSignature] = useState<string>('');
  const [witnessName, setWitnessName] = useState<string>('Sister K. Sharma');
  const [doctorName, setDoctorName] = useState<string>('Dr. Sunita Deshmukh, MD (Hom)');

  // Step 4: Identity & Contact Details
  const [fullName, setFullName] = useState<string>('Ananya Sharma');
  const [age, setAge] = useState<number>(34);
  const [dob, setDob] = useState<string>('1992-04-12');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [phone, setPhone] = useState<string>('+91 98201 84729');
  const [email, setEmail] = useState<string>('ananya.s@example.com');
  const [address, setAddress] = useState<string>('Flat 302, Gokul Towers, Naupada, Thane West');
  const [pinCode, setPinCode] = useState<string>('400602');
  const [emergencyName, setEmergencyName] = useState<string>('Vikram Sharma');
  const [emergencyRelation, setEmergencyRelation] = useState<string>('Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState<string>('+91 98201 84730');

  // Step 5: Adaptive Health Questions
  const [reasonForVisit, setReasonForVisit] = useState<'unwell' | 'followup' | 'review' | 'routine'>('unwell');
  const [chiefComplaint, setChiefComplaint] = useState<string>(
    'Epigastric stomach burning, retrosternal acidity, and post-prandial heaviness for 3 weeks'
  );
  const [symptomDuration, setSymptomDuration] = useState<string>('1-2 Weeks');
  const [symptomSeverity, setSymptomSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [symptomLocation, setSymptomLocation] = useState<string>('Upper abdomen / Epigastric');
  const [hasSecondaryComplaint, setHasSecondaryComplaint] = useState<boolean>(true);
  const [secondaryComplaint, setSecondaryComplaint] = useState<string>('Sour eructations & nausea on empty stomach');
  const [urgencyScreen, setUrgencyScreen] = useState<'No' | 'Yes'>('No');

  // Step 6: Medical History & Allergies
  const [chronicConditions, setChronicConditions] = useState<string[]>(['GERD / Acid Reflux']);
  const [pastSurgery, setPastSurgery] = useState<'No' | 'Yes'>('Yes');
  const [pastSurgeryDetails, setPastSurgeryDetails] = useState<string>('Appendectomy');
  const [pastSurgeriesList, setPastSurgeriesList] = useState<{ procedure: string; year: string }[]>([
    { procedure: 'Laparoscopic Appendectomy', year: '2019' },
  ]);
  const [hasAllergies, setHasAllergies] = useState<'No' | 'Yes'>('Yes');
  const [knownAllergies, setKnownAllergies] = useState<string>('Penicillin (Rashes)');
  const [allergySeverity, setAllergySeverity] = useState<'Mild' | 'Moderate' | 'Severe / Anaphylaxis'>('Moderate');
  const [currentMedications, setCurrentMedications] = useState<string>('Pantoprazole 40mg (OD before food)');
  const [familyHistory, setFamilyHistory] = useState<string[]>(['Hypertension', 'Diabetes']);

  // Step 7: Documents & OCR
  const [scannedDocuments, setScannedDocuments] = useState<MedicalDocument[]>([]);

  // Step 8: ABHA ID
  const [abhaId, setAbhaId] = useState<string>('91-8472-9102-3841');
  const [isAbhaVerified, setIsAbhaVerified] = useState<boolean>(true);

  // Clean speech when step changes
  useEffect(() => {
    stopSpeaking();
  }, [step]);

  // Global Voice Commands Handler
  const startGlobalVoiceCommands = () => {
    if (!voiceRecognition.isSupported()) {
      setVoiceNotification('Speech recognition is not available on this device.');
      return;
    }

    if (isGlobalMicListening) {
      voiceRecognition.stop();
      setIsGlobalMicListening(false);
      return;
    }

    setIsGlobalMicListening(true);
    setVoiceNotification(`Listening for voice commands in ${selectedLanguage}...`);

    voiceRecognition.startListening(
      selectedLanguage,
      (result) => {
        const transcript = result.transcript;
        const cmd = parseVoiceCommand(transcript, selectedLanguage);

        if (cmd === 'NEXT') {
          setVoiceNotification(`Voice command accepted: Next Step`);
          handleStepForward();
        } else if (cmd === 'BACK') {
          setVoiceNotification(`Voice command accepted: Previous Step`);
          handleStepBackward();
        } else if (cmd === 'CONFIRM' && step === 9) {
          setVoiceNotification(`Voice command accepted: Confirming Registration`);
          handleFinalConfirmation();
        } else {
          setVoiceNotification(`Heard: "${transcript}"`);
        }

        setIsGlobalMicListening(false);
        voiceRecognition.stop();
      },
      (err) => {
        setIsGlobalMicListening(false);
      }
    );
  };

  const handleStepForward = () => {
    if (step === 3 && (!consentReadConfirmed || !patientSignature)) {
      alert('Informed consent and signature are required to continue.');
      return;
    }
    if (step === 4 && !fullName.trim()) {
      alert('Patient full name is required.');
      return;
    }
    if (step < 10) {
      setStep((s) => s + 1);
    }
  };

  const handleStepBackward = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  // Step 9 -> Step 10: Final Confirmation and OPD Slip Generation
  const handleFinalConfirmation = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const newPatientId = `pat_${Date.now()}`;
      const tokenRandom = Math.floor(70 + Math.random() * 25);
      const generatedToken = `OPD-T${tokenRandom}`;

      const nowIso = new Date().toISOString();
      const consentRecord: ConsentRecord = {
        templateId: 'robinia-30-study',
        title: 'Robinia 30 Case Series Clinical Study Consent',
        templateTitle: 'Robinia 30 Case Series Clinical Study Consent',
        version: '1.0',
        language: selectedLanguage,
        patientName: fullName,
        patientAge: age,
        patientPhone: phone,
        signatureData: patientSignature,
        patientSignatureUrl: patientSignature,
        witnessRequired: true,
        witnessName: witnessName,
        doctorName: doctorName,
        status: 'PATIENT SIGNED',
        signedAt: nowIso,
        confirmedStatements: [
          'Read and understood study information',
          `Explained in ${selectedLanguage}`,
          'Voluntary participation confirmed',
        ],
      };

      const newPatient: Patient = {
        id: newPatientId,
        opdToken: generatedToken,
        status: 'Waiting for Doctor',
        demographics: {
          fullName,
          age,
          gender,
          dob: dob || '1992-01-01',
          phone,
          email: email || '',
          address: pinCode ? `${address}, PIN: ${pinCode}` : address,
          emergencyContact: {
            name: emergencyName,
            relationship: emergencyRelation,
            phone: emergencyPhone,
          },
          preferredLanguage: selectedLanguage,
          registrationNumber: `REG-${Date.now().toString().slice(-6)}`,
          abhaId: isAbhaVerified ? abhaId : undefined,
          knownAllergies: hasAllergies === 'Yes' ? [knownAllergies] : [],
          existingConditions: chronicConditions,
          currentMedications: currentMedications ? [currentMedications] : [],
        },
        symptoms: {
          chiefComplaint,
          symptoms: [chiefComplaint, ...(hasSecondaryComplaint && secondaryComplaint ? [secondaryComplaint] : [])],
          duration: symptomDuration,
          severity: symptomSeverity === 'Severe' ? 'Severe' : symptomSeverity === 'Moderate' ? 'Moderate' : 'Mild',
          medicalHistory: chronicConditions,
          medicationHistory: currentMedications ? [currentMedications] : [],
          knownAllergies: hasAllergies === 'Yes' ? [knownAllergies] : [],
          lifestyle: {
            smoking: false,
            alcohol: false,
            diet: 'Vegetarian',
            physicalActivity: 'Moderate',
          },
          intakeNotes: `Location: ${symptomLocation || 'Epigastrium'}. Kiosk self-intake.`,
          inputMethod: 'Voice',
          languageUsed: selectedLanguage,
          recordedAt: nowIso,
        },
        safetyAlerts:
          urgencyScreen === 'Yes'
            ? [
                {
                  id: `alert_${Date.now()}`,
                  level: 'CRITICAL',
                  title: 'Emergency Triage Triggered',
                  reason: 'Chest discomfort reported at registration kiosk',
                  actionRequired: 'Immediate physician evaluation and ECG triage required',
                  timestamp: nowIso,
                  acknowledged: false,
                },
              ]
            : [],
        documents: scannedDocuments,
        consent: consentRecord,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      // Register patient in Context
      registerPatient(newPatient);
      selectPatient(newPatient);
      setRegisteredPatient(newPatient);
      setIsSubmitting(false);
      setStep(10);
    }, 900);
  };

  // Step 10: Proceed directly to Doctor Consultation
  const handleProceedToDoctor = () => {
    if (registeredPatient) {
      onRegistrationComplete(registeredPatient);
    }
    onNavigateTab('doctor');
  };

  // Steps metadata
  const stepsList = [
    { id: 1, title: 'Language', icon: Globe },
    { id: 2, title: 'Voice Setup', icon: Mic },
    { id: 3, title: 'Consent', icon: FileText },
    { id: 4, title: 'Identity', icon: User },
    { id: 5, title: 'Health', icon: Stethoscope },
    { id: 6, title: 'History', icon: Heart },
    { id: 7, title: 'Documents', icon: FileText },
    { id: 8, title: 'ABHA', icon: CreditCard },
    { id: 9, title: 'Review', icon: ClipboardCheck },
    { id: 10, title: 'Token Slip', icon: Ticket },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Registration Station Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-cyan-600/20">
            {step}
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-cyan-600 dark:text-cyan-400 block">
              MediKiosk Clinical Platform • Registration Station
            </span>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">
              {stepsList[step - 1]?.title} (Step {step} of 10)
            </div>
          </div>
        </div>

        {/* Action Controls: Language Badge, Voice Assistant Trigger & Mute */}
        <div className="flex items-center gap-2">
          {/* Active Language Badge */}
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
            <Globe className="w-3.5 h-3.5 text-cyan-500" />
            <span>{selectedLanguage}</span>
          </span>

          {/* Voice Diagnostics Panel Trigger */}
          <button
            type="button"
            id="btn-toggle-voice-diagnostics"
            onClick={() => setShowVoiceDebugPanel(!showVoiceDebugPanel)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              showVoiceDebugPanel
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
            }`}
            title="Open Voice Engine Diagnostics"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voice Engine</span>
          </button>

          {/* Hands-Free Voice Commands Button */}
          <button
            type="button"
            onClick={startGlobalVoiceCommands}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isGlobalMicListening
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
            }`}
            title="Speak voice command (Next, Back, Confirm)"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isGlobalMicListening ? 'Listening...' : 'Voice Cmd'}</span>
          </button>

          {/* Voice Guidance Audio Mute Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isVoiceEnabled) stopSpeaking();
              setIsVoiceEnabled(!isVoiceEnabled);
            }}
            className={`p-2 rounded-xl border text-xs transition-all ${
              isVoiceEnabled
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
            }`}
            title={isVoiceEnabled ? 'Mute Voice Prompts' : 'Enable Voice Prompts'}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {voiceNotification && (
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-700 dark:text-cyan-300 flex items-center justify-between">
          <span>{voiceNotification}</span>
          <button onClick={() => setVoiceNotification(null)} className="text-[10px] font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 10-Step Visual Breadcrumb Indicator (Interactive touch to jump to unlocked steps) */}
      <div className="overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-2 min-w-[680px]">
          {stepsList.map((s) => {
            const isCurrent = step === s.id;
            const isCompleted = step > s.id;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (s.id < step || (s.id <= 9 && step !== 10)) {
                    setStep(s.id);
                  }
                }}
                className={`flex-1 py-2 px-2.5 rounded-2xl border text-left transition-all flex items-center gap-2 ${
                  isCurrent
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 shadow-sm ring-1 ring-cyan-400'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-400 opacity-70'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-cyan-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : s.id}
                </div>
                <div className="truncate">
                  <span className="text-[11px] font-bold block truncate">{s.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl min-h-[480px]">
        {/* STEP 1: Language Selection First */}
        {step === 1 && (
          <LanguageSelectionStep
            selectedLanguage={selectedLanguage}
            onSelectLanguage={(lang) => setSelectedLanguage(lang)}
            onContinue={() => setStep(2)}
            isVoiceEnabled={isVoiceEnabled}
          />
        )}

        {/* STEP 2: Voice Setup & Mic Test */}
        {step === 2 && (
          <VoiceSetupStep
            selectedLanguage={selectedLanguage}
            isVoiceEnabled={isVoiceEnabled}
            onToggleVoice={(enabled) => setIsVoiceEnabled(enabled)}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
          />
        )}

        {/* STEP 3: Mandatory Informed Consent (Robinia 30 Case Series Study) */}
        {step === 3 && (
          <ConsentStep
            selectedLanguage={selectedLanguage}
            onLanguageChange={(lang) => setSelectedLanguage(lang)}
            consentReadConfirmed={consentReadConfirmed}
            setConsentReadConfirmed={setConsentReadConfirmed}
            consentLanguageConfirmed={consentLanguageConfirmed}
            setConsentLanguageConfirmed={setConsentLanguageConfirmed}
            consentQuestionsAnswered={consentQuestionsAnswered}
            setConsentQuestionsAnswered={setConsentQuestionsAnswered}
            patientSignature={patientSignature}
            setPatientSignature={setPatientSignature}
            witnessName={witnessName}
            doctorName={doctorName}
            onBack={() => setStep(2)}
            onContinue={() => setStep(4)}
            onDecline={() => setShowDeclineModal(true)}
          />
        )}

        {/* STEP 4: Identity & Duplicate Detection */}
        {step === 4 && (
          <IdentityStep
            fullName={fullName}
            setFullName={setFullName}
            age={age}
            setAge={setAge}
            dob={dob}
            setDob={setDob}
            gender={gender}
            setGender={setGender}
            phone={phone}
            setPhone={setPhone}
            email={email}
            setEmail={setEmail}
            address={address}
            setAddress={setAddress}
            pinCode={pinCode}
            setPinCode={setPinCode}
            emergencyName={emergencyName}
            setEmergencyName={setEmergencyName}
            emergencyRelation={emergencyRelation}
            setEmergencyRelation={setEmergencyRelation}
            emergencyPhone={emergencyPhone}
            setEmergencyPhone={setEmergencyPhone}
            existingPatients={patients}
            selectedLanguage={selectedLanguage}
            onSelectExistingPatient={(p) => {
              setFullName(p.demographics.fullName);
              setPhone(p.demographics.phone);
              setAge(p.demographics.age);
              setGender(p.demographics.gender as any);
              if (p.demographics.dob) setDob(p.demographics.dob);
              if (p.demographics.address) setAddress(p.demographics.address);
              if (p.abhaId) {
                setAbhaId(p.abhaId);
                setIsAbhaVerified(true);
              }
              setStep(5);
            }}
            onBack={() => setStep(3)}
            onContinue={() => setStep(5)}
          />
        )}

        {/* STEP 5: Adaptive Health Questions */}
        {step === 5 && (
          <AdaptiveHealthStep
            reasonForVisit={reasonForVisit}
            setReasonForVisit={setReasonForVisit}
            chiefComplaint={chiefComplaint}
            setChiefComplaint={setChiefComplaint}
            symptomDuration={symptomDuration}
            setSymptomDuration={setSymptomDuration}
            symptomSeverity={symptomSeverity}
            setSymptomSeverity={setSymptomSeverity}
            symptomLocation={symptomLocation}
            setSymptomLocation={setSymptomLocation}
            hasSecondaryComplaint={hasSecondaryComplaint}
            setHasSecondaryComplaint={setHasSecondaryComplaint}
            secondaryComplaint={secondaryComplaint}
            setSecondaryComplaint={setSecondaryComplaint}
            urgencyScreen={urgencyScreen}
            setUrgencyScreen={setUrgencyScreen}
            selectedLanguage={selectedLanguage}
            onBack={() => setStep(4)}
            onContinue={() => setStep(6)}
          />
        )}

        {/* STEP 6: Past Medical History & Allergies */}
        {step === 6 && (
          <MedicalHistoryStep
            chronicConditions={chronicConditions}
            setChronicConditions={setChronicConditions}
            pastSurgery={pastSurgery}
            setPastSurgery={setPastSurgery}
            pastSurgeryDetails={pastSurgeryDetails}
            setPastSurgeryDetails={setPastSurgeryDetails}
            pastSurgeriesList={pastSurgeriesList}
            setPastSurgeriesList={setPastSurgeriesList}
            hasAllergies={hasAllergies}
            setHasAllergies={setHasAllergies}
            knownAllergies={knownAllergies}
            setKnownAllergies={setKnownAllergies}
            allergySeverity={allergySeverity}
            setAllergySeverity={setAllergySeverity}
            currentMedications={currentMedications}
            setCurrentMedications={setCurrentMedications}
            familyHistory={familyHistory}
            setFamilyHistory={setFamilyHistory}
            selectedLanguage={selectedLanguage}
            onBack={() => setStep(5)}
            onContinue={() => setStep(7)}
          />
        )}

        {/* STEP 7: Document Scanning & OCR Verification */}
        {step === 7 && (
          <DocumentScannerStep
            scannedDocuments={scannedDocuments}
            setScannedDocuments={setScannedDocuments}
            selectedLanguage={selectedLanguage}
            onBack={() => setStep(6)}
            onContinue={() => setStep(8)}
          />
        )}

        {/* STEP 8: ABHA ID */}
        {step === 8 && (
          <AbhaStep
            abhaId={abhaId}
            setAbhaId={setAbhaId}
            isAbhaVerified={isAbhaVerified}
            setIsAbhaVerified={setIsAbhaVerified}
            fullName={fullName}
            dob={dob}
            gender={gender}
            selectedLanguage={selectedLanguage}
            onBack={() => setStep(7)}
            onContinue={() => setStep(9)}
          />
        )}

        {/* STEP 9: Review & Confirmation */}
        {step === 9 && (
          <ReviewStep
            fullName={fullName}
            age={age}
            dob={dob}
            gender={gender}
            phone={phone}
            email={email}
            address={address}
            emergencyName={emergencyName}
            emergencyRelation={emergencyRelation}
            emergencyPhone={emergencyPhone}
            chiefComplaint={chiefComplaint}
            symptomSeverity={symptomSeverity}
            symptomDuration={symptomDuration}
            symptomLocation={symptomLocation}
            chronicConditions={chronicConditions}
            pastSurgery={pastSurgery}
            pastSurgeriesList={pastSurgeriesList}
            hasAllergies={hasAllergies}
            knownAllergies={knownAllergies}
            currentMedications={currentMedications}
            scannedDocuments={scannedDocuments}
            abhaId={abhaId}
            isAbhaVerified={isAbhaVerified}
            patientSignature={patientSignature}
            witnessName={witnessName}
            selectedLanguage={selectedLanguage}
            onNavigateToStep={(s) => setStep(s)}
            onBack={() => setStep(8)}
            onConfirm={handleFinalConfirmation}
            isSubmitting={isSubmitting}
          />
        )}

        {/* STEP 10: OPD Token Slip & Direct Transfer */}
        {step === 10 && registeredPatient && (
          <TokenSlipStep
            patient={registeredPatient}
            tokenNumber={registeredPatient.opdToken}
            chamberNumber={registeredPatient.assignedChamber || 'OPD Chamber 3'}
            department={registeredPatient.department || 'AYUSH Integrative Medicine'}
            waitTime="~10-15 minutes"
            selectedLanguage={selectedLanguage}
            isVoiceEnabled={isVoiceEnabled}
            onProceedToDoctor={handleProceedToDoctor}
          />
        )}
      </div>

      {/* Decline Consent Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Informed Consent is Required for Kiosk Self-Registration
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                This automated kiosk registers patients participating in the Institutional Ethics Committee Approved Robinia 30 Case Series Study protocol.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 text-left space-y-1.5 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white">Alternative Options:</div>
              <div>• Visit <strong>Manual Reception Counter 1</strong> for non-study general hospital OPD registration.</div>
              <div>• Consult the triage nurse for immediate emergency evaluation.</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
              >
                Review Consent Form Again
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeclineModal(false);
                  onNavigateTab('welcome');
                }}
                className="flex-1 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Return to Welcome
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Marathi Voice Diagnostics Panel */}
      <MarathiVoiceDebugPanel
        selectedLanguage={selectedLanguage}
        onSelectLanguage={(lang) => setSelectedLanguage(lang)}
        isOpen={showVoiceDebugPanel}
        onClose={() => setShowVoiceDebugPanel(false)}
        isFloating={true}
      />

      {/* Modal for when native Marathi voice is unavailable */}
      <MarathiVoiceUnavailableModal
        isOpen={showMarathiUnavailableModal}
        onContinueUsingText={() => {
          setIsVoiceEnabled(false);
          setShowMarathiUnavailableModal(false);
        }}
        onTryAnotherVoice={() => {
          setShowMarathiUnavailableModal(false);
          setStep(1);
          setShowVoiceDebugPanel(true);
        }}
        onOpenDiagnostics={() => {
          setShowMarathiUnavailableModal(false);
          setShowVoiceDebugPanel(true);
        }}
      />
    </div>
  );
};
