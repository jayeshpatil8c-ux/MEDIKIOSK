import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Mic,
  MicOff,
  Globe,
  ShieldCheck,
  Zap,
  Phone,
  MapPin,
  HelpCircle,
  AlertTriangle,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Clock,
  User,
} from 'lucide-react';
import { speakText, stopSpeaking, VoiceLanguage, VOICE_PROMPTS } from '../../utils/speechHelper';
import { useLanguage } from '../../context/LanguageContext';

// Configurable Hospital Information
export const HOSPITAL_CONFIG = {
  name: 'AYUSH Integrative Wellness & Holistic Care Station',
  shortName: 'AYUSH Wellness & Care Station',
  phone: '+91 22 2548 9900',
  emergencyPhone: '108 / +91 22 2548 9999',
  address: 'Healthcare Enclave, Station Road, Thane West, Maharashtra 400601',
  tagline: 'Ayurveda, Yoga, Unani, Siddha, Homoeopathy protocol and Prakriti assessment for PHCs',
};

interface Props {
  onStartRegistration: (language: VoiceLanguage, voiceEnabled: boolean) => void;
  onOpenDoctorStation: () => void;
  onOpenQueueBoard: () => void;
  onOpenExistingPatient?: () => void;
  onOpenEmergency?: () => void;
}

export const WelcomeView: React.FC<Props> = ({
  onStartRegistration,
  onOpenDoctorStation,
  onOpenQueueBoard,
  onOpenExistingPatient,
  onOpenEmergency,
}) => {
  const { languageName: selectedLanguage, isVoiceEnabled, setLanguage, setVoiceEnabled } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [largeTextMode, setLargeTextMode] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Play audio greeting on first load or language change if voice enabled
  const handlePlayGreeting = async (lang: VoiceLanguage = selectedLanguage) => {
    if (!isVoiceEnabled) return;
    setIsSpeaking(true);
    await speakText(VOICE_PROMPTS[lang].welcome, lang);
    setIsSpeaking(false);
  };

  const handleLanguageChange = (lang: VoiceLanguage) => {
    setLanguage(lang);
    stopSpeaking();
    if (isVoiceEnabled) void handlePlayGreeting(lang);
  };

  // Translations for Welcome Page
  const i18n = {
    English: {
      welcomeTitle: 'Welcome to MediKiosk',
      subtitle: 'Your simple, fast and secure digital check-in experience.',
      description:
        'Register, connect your health information and receive your OPD token — with guided assistance every step of the way.',
      startBtn: 'START PATIENT REGISTRATION',
      voiceOption: 'Voice Assisted Kiosk',
      voiceDesc: 'Prefer speaking? You can use voice assistance throughout registration.',
      secureBadge: 'Secure & Private',
      secureDesc: 'Your information is protected and encrypted',
      fastBadge: 'Fast OPD Check-in',
      fastDesc: 'Generate queue token in under 2 minutes',
      multilingualBadge: 'Multilingual & Voice',
      multilingualDesc: 'English, Hindi & Marathi assisted care',
      emergencyBtn: 'Medical Emergency?',
      contactReception: 'Need assistance? Approach reception counter 1 or touch Help.',
      helpBtn: 'Kiosk Help',
      journeyTitle: 'Simple 4-Step Patient Journey',
      steps: ['1. Consent & Language', '2. Basic Information', '3. Health & Documents', '4. Receive OPD Token'],
      quickStaffLinks: 'Hospital Staff Portals:',
      doctorStation: 'Doctor Station',
      queueBoard: 'Live OPD Board',
    },
    Hindi: {
      welcomeTitle: 'मेडीकियोस्क में आपका स्वागत है',
      subtitle: 'आपका सरल, त्वरित और सुरक्षित डिजिटल चेक-इन अनुभव।',
      description:
        'पंजीकरण करें, अपनी स्वास्थ्य जानकारी जोड़ें और अपना ओपीडी टोकन प्राप्त करें — हर कदम पर आसान मार्गदर्शन के साथ।',
      startBtn: 'मरीज पंजीकरण शुरू करें',
      voiceOption: 'ध्वनि-सहायता युक्त कियोस्क',
      voiceDesc: 'बोलकर विवरण दर्ज करना चाहते हैं? आप पूरी प्रक्रिया में आवाज सहायता का उपयोग कर सकते हैं।',
      secureBadge: 'सुरक्षित एवं गोपनीय',
      secureDesc: 'आपकी स्वास्थ्य जानकारी पूरी तरह सुरक्षित है',
      fastBadge: 'त्वरित ओपीडी चेक-इन',
      fastDesc: '२ मिनट से भी कम समय में ओपीडी टोकन पाएं',
      multilingualBadge: 'बहुभाषी एवं बोलकर इनपुट',
      multilingualDesc: 'अंग्रेजी, हिंदी एवं मराठी में उपलब्ध',
      emergencyBtn: 'आपातकालीन चिकित्सा?',
      contactReception: 'सहायता चाहिए? काउंटर नंबर १ से संपर्क करें या हेल्प दबाएं।',
      helpBtn: 'सहायता केंद्र',
      journeyTitle: 'आसान ४-चरणीय पंजीकरण',
      steps: ['१. सहमति एवं भाषा', '२. व्यक्तिगत विवरण', '३. स्वास्थ्य एवं रिपोर्ट', '४. टोकन प्राप्त करें'],
      quickStaffLinks: 'स्टाफ पोर्टल:',
      doctorStation: 'डॉक्टर स्टेशन',
      queueBoard: 'ओपीडी बोर्ड',
    },
    Marathi: {
      welcomeTitle: 'मेडीकियोस्कमध्ये आपले स्वागत आहे',
      subtitle: 'आपला सुलभ, जलद आणि सुरक्षित डिजिटल नोंदणी अनुभव.',
      description:
        'नोंदणी करा, आरोग्य माहिती जोडा आणि आपला ओपीडी टोकन मिळवा — प्रत्येक टप्प्यावर मार्गदर्शनासह.',
      startBtn: 'रुग्ण नोंदणी सुरू करा',
      voiceOption: 'आवाज सहाय्यक कियोस्क',
      voiceDesc: 'बोलून माहिती द्यायची आहे? आपण संपूर्ण प्रक्रियेत आवाज सहाय्यक वापरू शकता.',
      secureBadge: 'सुरक्षित आणि खाजगी',
      secureDesc: 'आपली सर्व माहिती सुरक्षित आणि गोपनीय राहील',
      fastBadge: 'जलद ओपीडी चेक-इन',
      fastDesc: 'दोन मिनिटांत ओपीडी टोकन मिळवा',
      multilingualBadge: 'बहुभाषिक सहाय्य',
      multilingualDesc: 'इंग्रजी, हिंदी आणि मराठीमध्ये उपलब्ध',
      emergencyBtn: 'तातडीची मदत हवी आहे?',
      contactReception: 'मदत हवी असल्यास स्वागत कक्षाशी संपर्क साधा.',
      helpBtn: 'मदत केंद्र',
      journeyTitle: 'सुलभ ४ टप्प्यांत नोंदणी',
      steps: ['१. संमती व भाषा निवड', '२. प्राथमिक माहिती', '३. आरोग्य व तपासण्या', '४. ओपीडी टोकन मिळवा'],
      quickStaffLinks: 'कर्मचारी पोर्टल:',
      doctorStation: 'डॉक्टर स्टेशन',
      queueBoard: 'ओपीडी डिस्प्ले',
    },
  };

  const t = i18n[selectedLanguage];

  return (
    <div
      className={`min-h-[calc(100vh-80px)] flex flex-col justify-between transition-all duration-300 ${
        largeTextMode ? 'text-lg' : 'text-base'
      }`}
    >
      {/* Top Welcome Header Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100 uppercase sm:text-base">
              {HOSPITAL_CONFIG.shortName}
            </h1>
            <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
              {HOSPITAL_CONFIG.tagline}
            </p>
          </div>
        </div>

        {/* Accessibility & Language Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle button */}
          <button
            id="welcome-voice-toggle"
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking();
                setIsSpeaking(false);
              } else {
                setVoiceEnabled(!isVoiceEnabled);
                if (!isVoiceEnabled) handlePlayGreeting();
              }
            }}
            title="Audio guidance"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isVoiceEnabled
                ? 'bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500/30 text-cyan-700 dark:text-cyan-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
            }`}
          >
            {isVoiceEnabled ? (
              <>
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse text-cyan-500' : ''}`} />
                <span className="hidden sm:inline">Voice ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">Voice Muted</span>
              </>
            )}
          </button>

          {/* Live Clock Badge */}
          {currentTime && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              <span>{currentTime}</span>
            </div>
          )}

          {/* Large text toggle */}
          <button
            id="welcome-text-scale"
            onClick={() => setLargeTextMode(!largeTextMode)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              largeTextMode
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-1" />
            <span className="hidden sm:inline">Large Text</span>
          </button>

          {/* Language Selector Buttons */}
          <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl border border-slate-300/80 dark:border-slate-700">
            {(['English', 'Hindi', 'Marathi'] as VoiceLanguage[]).map((lang) => (
              <button
                key={lang}
                id={`lang-btn-${lang.toLowerCase()}`}
                onClick={() => handleLanguageChange(lang)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedLanguage === lang
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lang === 'English' ? 'EN' : lang === 'Hindi' ? 'हिंदी' : 'मराठी'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Hero Container */}
      <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
        {/* Left Column: Hero Content & Big Primary Touch Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            National Smart Health Kiosk Platform
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {t.welcomeTitle}
            </h1>
            <p className="text-lg sm:text-xl font-medium text-cyan-700 dark:text-cyan-300">
              {t.subtitle}
            </p>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {t.description}
            </p>
          </div>

          {/* Primary Registration Touch Button (Large Touch Target: min 56px) */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              id="btn-start-patient-registration"
              onClick={() => onStartRegistration(selectedLanguage, isVoiceEnabled)}
              className="flex-1 min-h-[58px] px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base sm:text-lg shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <UserPlus className="w-6 h-6" />
              <span>{t.startBtn}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              id="btn-voice-assisted-checkin"
              onClick={() => {
                setVoiceEnabled(true);
                onStartRegistration(selectedLanguage, true);
              }}
              className="px-6 min-h-[58px] rounded-2xl bg-white dark:bg-slate-900 border-2 border-cyan-500/40 hover:border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2.5 transition-all"
            >
              <Mic className="w-5 h-5 text-cyan-500 animate-pulse" />
              <span>{t.voiceOption}</span>
            </button>
          </div>

          {/* Secondary Actions: Existing Patient, Staff Login, Emergency Assistance */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              id="btn-welcome-existing-patient"
              onClick={onOpenExistingPatient || onOpenDoctorStation}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-300 dark:border-slate-700 transition-all"
            >
              <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Existing Patient</span>
            </button>

            <button
              id="btn-welcome-staff-login"
              onClick={onOpenDoctorStation}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-300 dark:border-slate-700 transition-all"
            >
              <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Staff Login</span>
            </button>

            <button
              id="btn-welcome-emergency-cta"
              onClick={() => setShowEmergencyModal(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-2 border border-rose-500/30 transition-all"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Emergency Assistance</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Mic className="w-3.5 h-3.5 text-cyan-500" />
            {t.voiceDesc}
          </p>

          {/* 3 Trust Indicator Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs mb-1">
                <ShieldCheck className="w-4 h-4" />
                {t.secureBadge}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {t.secureDesc}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs mb-1">
                <Zap className="w-4 h-4" />
                {t.fastBadge}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {t.fastDesc}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs mb-1">
                <Globe className="w-4 h-4" />
                {t.multilingualBadge}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {t.multilingualDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Premium Healthcare Visual & Journey Overview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full relative rounded-3xl overflow-hidden p-6 bg-gradient-to-br from-cyan-950/60 via-slate-900/90 to-slate-950 border border-cyan-500/20 shadow-2xl backdrop-blur-xl">
            {/* Top decorative badge */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Stethoscope className="w-4 h-4" />
                {HOSPITAL_CONFIG.shortName}
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                Kiosk Ready
              </span>
            </div>

            {/* Central Visual Graphic */}
            <div className="py-4 text-center space-y-3">
              <div className="relative inline-block">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-1 mx-auto shadow-xl shadow-cyan-500/30">
                  <div className="w-full h-full rounded-[22px] bg-slate-950 flex flex-col items-center justify-center text-white">
                    <HeartPulse className="w-10 h-10 text-cyan-400 animate-pulse mb-1" />
                    <span className="text-[10px] font-bold text-cyan-300">OPD 360°</span>
                  </div>
                </div>
                {/* Floating pill badge */}
                <div className="absolute -bottom-2 -right-3 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  ABHA Ready
                </div>
              </div>

              <h2 className="text-base font-bold text-white tracking-tight">
                {t.journeyTitle}
              </h2>
            </div>

            {/* 4 Steps Journey */}
            <div className="space-y-2 pt-2">
              {t.steps.map((stepText, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs text-slate-200"
                >
                  <div className="flex items-center gap-2.5 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <span>{stepText}</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>

            {/* Quick staff shortcuts for hospital reviewers */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>{t.quickStaffLinks}</span>
              <div className="flex gap-2">
                <button
                  onClick={onOpenDoctorStation}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                >
                  {t.doctorStation}
                </button>
                <button
                  onClick={onOpenQueueBoard}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  {t.queueBoard}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Information Footer */}
      <div className="w-full max-w-7xl mx-auto px-4 py-4 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {HOSPITAL_CONFIG.address}
          </span>
          <a
            href={`tel:${HOSPITAL_CONFIG.phone}`}
            className="flex items-center gap-1.5 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium"
          >
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            {HOSPITAL_CONFIG.phone}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-welcome-emergency"
            onClick={() => setShowEmergencyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-500/20 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {t.emergencyBtn}
          </button>

          <button
            id="btn-welcome-help"
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {t.helpBtn}
          </button>
        </div>
      </div>

      {/* Emergency Assistance Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Emergency Care Protocol</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Immediate triage and emergency medical help
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              If you or the patient are experiencing chest pain, severe breathlessness, sudden weakness,
              loss of consciousness, or severe trauma, <strong>do not wait for kiosk registration</strong>.
            </p>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center">
              <span className="text-xs text-rose-700 dark:text-rose-300 uppercase font-bold tracking-wider block mb-1">
                Emergency Hotline & Triage Desk
              </span>
              <a
                href={`tel:${HOSPITAL_CONFIG.emergencyPhone}`}
                className="text-xl font-extrabold text-rose-600 dark:text-rose-400 hover:underline"
              >
                {HOSPITAL_CONFIG.emergencyPhone}
              </a>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Report to Emergency Casualty Ward (Ground Floor, Wing A)
              </span>
            </div>

            <button
              onClick={() => setShowEmergencyModal(false)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
            >
              Close & Return to Kiosk
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-500" />
                MediKiosk Assistance Guide
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-cyan-600 dark:text-cyan-400 block mb-1">
                  🎙 1. Voice Guidance
                </span>
                Touch the microphone icon to speak your name, mobile, and chief complaint. The kiosk
                will convert your voice into text and confirm before saving.
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">
                  📄 2. Old Prescriptions & Lab Reports
                </span>
                You can hold up your previous paper prescription or discharge slip to the camera. The
                kiosk will extract the tests, dates, and medicines automatically.
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">
                  🎫 3. OPD Token Generation
                </span>
                Once confirmed, an OPD token is immediately issued and automatically routed to the
                appropriate Doctor consultation queue.
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
