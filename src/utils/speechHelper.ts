/**
 * MediKiosk Universal Multilingual Voice Assistant
 * Specialized for True Native Marathi Voice (mr-IN), Hindi (hi-IN), and Indian English (en-IN).
 * Strict Rule: NEVER fall back to English voice or fake accents for Marathi.
 */

export type VoiceLanguage = 'English' | 'Hindi' | 'Marathi';

export const LANGUAGE_CODES: Record<VoiceLanguage, string> = {
  English: 'en-IN',
  Hindi: 'hi-IN',
  Marathi: 'mr-IN',
};

// Internal cached voices list
let cachedVoices: SpeechSynthesisVoice[] = [];
let voiceChangeListeners: Array<() => void> = [];
let unavailableNoticeListeners: Array<(lang: VoiceLanguage) => void> = [];

// Initialize voices and listener
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cachedVoices = window.speechSynthesis.getVoices();
    voiceChangeListeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // ignore
      }
    });
  });
}

/**
 * Register callback when voices are loaded or updated by browser
 */
export function onVoicesChanged(callback: () => void): () => void {
  voiceChangeListeners.push(callback);
  return () => {
    voiceChangeListeners = voiceChangeListeners.filter((cb) => cb !== callback);
  };
}

/**
 * Register callback when native Marathi voice is requested but not available on the device
 */
export function onMarathiVoiceUnavailable(callback: (lang: VoiceLanguage) => void): () => void {
  unavailableNoticeListeners.push(callback);
  return () => {
    unavailableNoticeListeners = unavailableNoticeListeners.filter((cb) => cb !== callback);
  };
}

function notifyVoiceUnavailable(lang: VoiceLanguage) {
  unavailableNoticeListeners.forEach((listener) => {
    try {
      listener(lang);
    } catch {
      // ignore
    }
  });
}

/**
 * Asynchronously wait until voices are populated in the browser
 */
export function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const current = window.speechSynthesis.getVoices();
    if (current && current.length > 0) {
      cachedVoices = current;
      resolve(current);
      return;
    }

    let resolved = false;
    const onVoices = () => {
      if (resolved) return;
      resolved = true;
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    };

    window.speechSynthesis.addEventListener('voiceschanged', onVoices);

    // Timeout fallback after 1200ms if browser already finished loading
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
        cachedVoices = window.speechSynthesis.getVoices();
        resolve(cachedVoices);
      }
    }, 1200);
  });
}

/**
 * Strict verification: Is this specific SpeechSynthesisVoice Marathi-compatible?
 * Strictly rejects any English voices (en-US, en-GB, en-IN, etc.)
 */
export function isMarathiVoice(voice: SpeechSynthesisVoice | null): boolean {
  if (!voice) return false;
  const lang = (voice.lang || '').toLowerCase().replace('_', '-');
  const name = (voice.name || '').toLowerCase();

  // Explicitly reject any English voice under all circumstances
  if (
    lang.startsWith('en') ||
    name.includes('english') ||
    name.includes('en-us') ||
    name.includes('en-in') ||
    name.includes('en-gb') ||
    name.includes('david') ||
    name.includes('samantha') ||
    name.includes('zira') ||
    name.includes('george')
  ) {
    return false;
  }

  // 1. Language code matches Marathi
  if (lang === 'mr' || lang.startsWith('mr-')) {
    return true;
  }

  // 2. Name contains Marathi identifier or known Marathi TTS engine
  if (
    name.includes('marathi') ||
    name.includes('मराठी') ||
    name.includes('aarohi')
  ) {
    return true;
  }

  return false;
}

/**
 * Strict verification: Is this voice Hindi-compatible?
 */
export function isHindiVoice(voice: SpeechSynthesisVoice | null): boolean {
  if (!voice) return false;
  const lang = (voice.lang || '').toLowerCase().replace('_', '-');
  const name = (voice.name || '').toLowerCase();

  if (lang.startsWith('en') || name.includes('english')) {
    return false;
  }

  if (lang === 'hi' || lang.startsWith('hi-')) {
    return true;
  }

  if (name.includes('hindi') || name.includes('हिंदी') || name.includes('kalpana') || name.includes('madhur') || name.includes('swara')) {
    return true;
  }

  return false;
}

/**
 * Priority-based Voice Selection Engine
 * NEVER falls back to an English voice when requesting Marathi.
 */
export function getBestVoice(targetLocale: string = 'mr-IN'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices() || cachedVoices;
  if (!voices || voices.length === 0) return null;

  const loc = (targetLocale || '').toLowerCase().replace('_', '-');

  // MARATHI VOICE SELECTION ALGORITHM
  if (loc.startsWith('mr')) {
    // Priority 1: Exact locale match ('mr-IN')
    const exactMatch = voices.find((v) => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      return vLang === 'mr-in' && isMarathiVoice(v);
    });
    if (exactMatch) return exactMatch;

    // Priority 2: Language prefix match ('mr', 'mr-*')
    const prefixMatch = voices.find((v) => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      return (vLang === 'mr' || vLang.startsWith('mr-')) && isMarathiVoice(v);
    });
    if (prefixMatch) return prefixMatch;

    // Priority 3: Voice name clearly indicates Marathi
    const nameMatch = voices.find((v) => {
      const vName = (v.name || '').toLowerCase();
      return (vName.includes('marathi') || vName.includes('मराठी') || vName.includes('aarohi')) && isMarathiVoice(v);
    });
    if (nameMatch) return nameMatch;

    // Priority 4: Verified Indian regional voice that supports Marathi
    const regionalMatch = voices.find((v) => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      const vName = (v.name || '').toLowerCase();
      return (vLang.includes('mr') || vName.includes('mr')) && isMarathiVoice(v);
    });
    if (regionalMatch) return regionalMatch;

    // CRITICAL: NEVER return en-US, en-GB, en-IN for Marathi!
    return null;
  }

  // HINDI VOICE SELECTION ALGORITHM
  if (loc.startsWith('hi')) {
    const exactHi = voices.find((v) => (v.lang || '').toLowerCase().replace('_', '-') === 'hi-in' && isHindiVoice(v));
    if (exactHi) return exactHi;

    const prefixHi = voices.find((v) => (v.lang || '').toLowerCase().startsWith('hi') && isHindiVoice(v));
    if (prefixHi) return prefixHi;

    const nameHi = voices.find((v) => isHindiVoice(v));
    if (nameHi) return nameHi;

    return null;
  }

  // ENGLISH VOICE SELECTION ALGORITHM
  const indianEn = voices.find((v) => {
    const vLang = (v.lang || '').toLowerCase().replace('_', '-');
    return vLang === 'en-in';
  });
  if (indianEn) return indianEn;

  const anyEn = voices.find((v) => (v.lang || '').toLowerCase().startsWith('en'));
  if (anyEn) return anyEn;

  return voices[0] || null;
}

/**
 * Diagnostic Voice Status for Current Environment
 */
export interface VoiceDiagnosticInfo {
  language: VoiceLanguage;
  requestedLocale: string;
  isAvailable: boolean;
  isVerifiedRegional: boolean;
  voiceName: string;
  voiceLang: string;
  statusLabel: string;
  totalVoicesAvailable: number;
  availableRegionalVoices: string[];
}

export function getVoiceDiagnostics(language: VoiceLanguage): VoiceDiagnosticInfo {
  const targetLocale = LANGUAGE_CODES[language];
  const allVoices = typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis.getVoices()
    : [];

  const regionalNames = allVoices
    .filter((v) => {
      const l = (v.lang || '').toLowerCase();
      const n = (v.name || '').toLowerCase();
      return l.includes('in') || l.startsWith('mr') || l.startsWith('hi') || n.includes('marathi') || n.includes('hindi');
    })
    .map((v) => `${v.name} (${v.lang})`);

  if (language === 'Marathi') {
    const voice = getBestVoice('mr-IN');
    const isAvailable = Boolean(voice && isMarathiVoice(voice));

    return {
      language: 'Marathi',
      requestedLocale: 'mr-IN',
      isAvailable,
      isVerifiedRegional: isAvailable,
      voiceName: voice?.name || 'None detected',
      voiceLang: voice?.lang || 'N/A',
      statusLabel: isAvailable ? '✓ Marathi Voice' : '⚠ Marathi Voice Unavailable',
      totalVoicesAvailable: allVoices.length,
      availableRegionalVoices: regionalNames,
    };
  }

  if (language === 'Hindi') {
    const voice = getBestVoice('hi-IN');
    const isAvailable = Boolean(voice && isHindiVoice(voice));

    return {
      language: 'Hindi',
      requestedLocale: 'hi-IN',
      isAvailable,
      isVerifiedRegional: isAvailable,
      voiceName: voice?.name || 'None detected',
      voiceLang: voice?.lang || 'N/A',
      statusLabel: isAvailable ? '✓ Hindi Voice' : '⚠ Hindi Voice Unavailable',
      totalVoicesAvailable: allVoices.length,
      availableRegionalVoices: regionalNames,
    };
  }

  // English
  const voice = getBestVoice('en-IN');
  const isIndianEn = (voice?.lang || '').toLowerCase().includes('in');
  return {
    language: 'English',
    requestedLocale: 'en-IN',
    isAvailable: Boolean(voice),
    isVerifiedRegional: isIndianEn,
    voiceName: voice?.name || 'System Default',
    voiceLang: voice?.lang || 'en-IN',
    statusLabel: isIndianEn ? '✓ Indian English Voice' : '✓ English Voice',
    totalVoicesAvailable: allVoices.length,
    availableRegionalVoices: regionalNames,
  };
}

export function checkNativeVoiceAvailability(language: VoiceLanguage): {
  isAvailable: boolean;
  voiceName?: string;
  isRegional: boolean;
  note: string;
} {
  const diag = getVoiceDiagnostics(language);
  if (language === 'Marathi') {
    return {
      isAvailable: diag.isAvailable,
      voiceName: diag.voiceName,
      isRegional: diag.isVerifiedRegional,
      note: diag.isAvailable
        ? `Native Marathi voice (${diag.voiceName}) verified.`
        : 'Native Marathi voice is not available on this device.',
    };
  }
  if (language === 'Hindi') {
    return {
      isAvailable: diag.isAvailable,
      voiceName: diag.voiceName,
      isRegional: diag.isVerifiedRegional,
      note: diag.isAvailable
        ? `Native Hindi voice (${diag.voiceName}) verified.`
        : 'Native Hindi voice is not available on this device.',
    };
  }
  return {
    isAvailable: diag.isAvailable,
    voiceName: diag.voiceName,
    isRegional: diag.isVerifiedRegional,
    note: `English voice (${diag.voiceName}) ready.`,
  };
}

// Result structure for speech operations
export interface SpeechResult {
  success: boolean;
  voiceUsed?: string;
  voiceLang?: string;
  isNativeVoice: boolean;
  error?: string;
}

/**
 * Dedicated Marathi Text-to-Speech Function
 * Guaranteed to NEVER use English voice to speak Marathi.
 */
export async function speakMarathi(
  text: string,
  rate: number = 0.92,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<SpeechResult> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.('Speech synthesis not supported');
    return { success: false, isNativeVoice: false, error: 'unsupported' };
  }

  // Cancel any prior speech
  window.speechSynthesis.cancel();

  // Wait for voices to be loaded
  await ensureVoicesLoaded();

  // Select verified Marathi voice
  const marathiVoice = getBestVoice('mr-IN');

  // Verify voice is genuinely Marathi-compatible
  if (!marathiVoice || !isMarathiVoice(marathiVoice)) {
    // NEVER fall back to English for Marathi!
    notifyVoiceUnavailable('Marathi');
    onError?.('Native Marathi voice is not available on this device.');
    return {
      success: false,
      isNativeVoice: false,
      error: 'NO_MARATHI_VOICE',
    };
  }

  return new Promise((resolve) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'mr-IN';
      utterance.voice = marathiVoice;
      utterance.rate = rate;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        onEnd?.();
        resolve({
          success: true,
          voiceUsed: marathiVoice.name,
          voiceLang: marathiVoice.lang,
          isNativeVoice: true,
        });
      };

      utterance.onerror = (err) => {
        onError?.(err);
        resolve({
          success: false,
          voiceUsed: marathiVoice.name,
          voiceLang: marathiVoice.lang,
          isNativeVoice: true,
          error: 'SPEECH_ERROR',
        });
      };

      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      onError?.(err);
      resolve({
        success: false,
        isNativeVoice: false,
        error: err?.message || 'UNKNOWN_ERROR',
      });
    }
  });
}

/**
 * Dedicated Hindi Text-to-Speech Function
 */
export async function speakHindi(
  text: string,
  rate: number = 0.95,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<SpeechResult> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.('Speech synthesis not supported');
    return { success: false, isNativeVoice: false, error: 'unsupported' };
  }

  window.speechSynthesis.cancel();
  await ensureVoicesLoaded();
  const hindiVoice = getBestVoice('hi-IN');

  if (!hindiVoice || !isHindiVoice(hindiVoice)) {
    notifyVoiceUnavailable('Hindi');
    onError?.('Native Hindi voice is not available on this device.');
    return {
      success: false,
      isNativeVoice: false,
      error: 'NO_HINDI_VOICE',
    };
  }

  return new Promise((resolve) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.voice = hindiVoice;
      utterance.rate = rate;
      utterance.pitch = 1.0;

      utterance.onstart = () => onStart?.();
      utterance.onend = () => {
        onEnd?.();
        resolve({
          success: true,
          voiceUsed: hindiVoice.name,
          voiceLang: hindiVoice.lang,
          isNativeVoice: true,
        });
      };
      utterance.onerror = (err) => {
        onError?.(err);
        resolve({
          success: false,
          error: 'SPEECH_ERROR',
          isNativeVoice: true,
        });
      };

      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      onError?.(err);
      resolve({
        success: false,
        isNativeVoice: false,
        error: err?.message,
      });
    }
  });
}

/**
 * Universal Text-to-Speech Engine
 * Automatically routes Marathi to speakMarathi, Hindi to speakHindi, and English to speakEnglish.
 */
export async function speakText(
  text: string,
  language: VoiceLanguage = 'English',
  rate: number = 0.95
): Promise<SpeechResult> {
  if (language === 'Marathi') {
    return speakMarathi(text, rate);
  }
  if (language === 'Hindi') {
    return speakHindi(text, rate);
  }

  // English
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve({ success: false, isNativeVoice: false, error: 'unsupported' });
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = rate;
      utterance.pitch = 1.0;

      const voice = getBestVoice('en-IN');
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        resolve({
          success: true,
          voiceUsed: voice?.name,
          voiceLang: voice?.lang,
          isNativeVoice: true,
        });
      };
      utterance.onerror = () => {
        resolve({ success: false, isNativeVoice: false, error: 'SPEECH_ERROR' });
      };

      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      resolve({ success: false, isNativeVoice: false, error: err?.message });
    }
  });
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// User-friendly speech error handler
export function getFriendlySpeechError(rawError: string): { message: string; blocked: boolean } {
  const err = (rawError || '').toLowerCase();
  if (err.includes('not-allowed') || err.includes('permission')) {
    return {
      message: 'Microphone access is blocked. Please allow microphone in browser settings or continue with touch/keyboard.',
      blocked: true,
    };
  }
  if (err.includes('no-speech')) {
    return {
      message: 'No speech was detected. Please speak closer to the microphone.',
      blocked: false,
    };
  }
  if (err.includes('audio-capture')) {
    return {
      message: 'Microphone hardware is busy or not detected. You can safely continue with touchscreen.',
      blocked: true,
    };
  }
  if (err.includes('network')) {
    return {
      message: 'Voice recognition network connection timed out. Please continue with text input.',
      blocked: false,
    };
  }
  return {
    message: 'Voice input could not be completed. Touch input is fully functional.',
    blocked: false,
  };
}

// Voice Command Types
export type VoiceCommandAction =
  | 'NEXT'
  | 'BACK'
  | 'REPEAT'
  | 'READ_ALL'
  | 'PAUSE'
  | 'RESUME'
  | 'STOP'
  | 'EDIT'
  | 'CONFIRM'
  | 'CANCEL';

/**
 * Multilingual Voice Command Parser
 * Fully supports Marathi native vocabulary:
 * "पुढे जा", "मागे जा", "पुन्हा वाचा", "संपूर्ण फॉर्म वाचा", "थांबा", "पुन्हा सुरू करा", "हो", "नाही", "संपादित करा", "पुष्टी करा"
 */
export function parseVoiceCommand(transcript: string, language: VoiceLanguage): VoiceCommandAction | null {
  const text = transcript.trim().toLowerCase();

  // MARATHI VOICE COMMANDS
  if (language === 'Marathi') {
    // "पुढे जा", "पुढे", "नेक्स्ट", "चालू ठेवा", "पुढील टप्पा"
    if (
      text.includes('पुढे जा') ||
      text.includes('पुढे') ||
      text.includes('नेक्स्ट') ||
      text.includes('पुढील') ||
      text.includes('चालू ठेवा')
    ) {
      return 'NEXT';
    }

    // "मागे जा", "मागे", "परत", "मागील टप्पा"
    if (
      text.includes('मागे जा') ||
      text.includes('मागे') ||
      text.includes('परत') ||
      text.includes('मागील')
    ) {
      return 'BACK';
    }

    // "पुन्हा वाचा", "परत सांगा", "पुन्हा सांगा", "रिपीट"
    if (
      text.includes('पुन्हा वाचा') ||
      text.includes('परत सांगा') ||
      text.includes('पुन्हा सांगा') ||
      text.includes('पुन्हा') ||
      text.includes('रिपीट')
    ) {
      return 'REPEAT';
    }

    // "संपूर्ण फॉर्म वाचा", "सर्व वाचा", "पूर्ण वाचा", "वाचा"
    if (
      text.includes('संपूर्ण फॉर्म वाचा') ||
      text.includes('सर्व वाचा') ||
      text.includes('पूर्ण वाचा') ||
      text.includes('फॉर्म वाचा') ||
      text.includes('संमती वाचा')
    ) {
      return 'READ_ALL';
    }

    // "थांबा", "थांबवा", "पॉज"
    if (text.includes('थांबा') || text.includes('थांबवा') || text.includes('पॉज')) {
      return 'PAUSE';
    }

    // "पुन्हा सुरू करा", "सुरू करा", "सुरू ठेवा", "रिज्यूम"
    if (
      text.includes('पुन्हा सुरू करा') ||
      text.includes('सुरू करा') ||
      text.includes('सुरू ठेवा') ||
      text.includes('रिज्यूम')
    ) {
      return 'RESUME';
    }

    // "थांबवा", "बंद करा", "स्टॉप"
    if (text.includes('बंद करा') || text.includes('स्टॉप')) {
      return 'STOP';
    }

    // "संपादित करा", "बदला", "एडिट"
    if (
      text.includes('संपादित करा') ||
      text.includes('संपादित') ||
      text.includes('बदला') ||
      text.includes('बदल करा') ||
      text.includes('एडिट')
    ) {
      return 'EDIT';
    }

    // "पुष्टी करा", "हो", "होय", "संमती आहे", "खात्री करा", "सबमिट"
    if (
      text.includes('पुष्टी करा') ||
      text.includes('पुष्टी') ||
      text.includes('होय') ||
      text === 'हो' ||
      text.startsWith('हो ') ||
      text.endsWith(' हो') ||
      text.includes('संमती आहे') ||
      text.includes('संमती') ||
      text.includes('खात्री करा') ||
      text.includes('मान्य आहे') ||
      text.includes('सबमिट')
    ) {
      return 'CONFIRM';
    }

    // "नाही", "रद्द करा", "नको", "कॅन्सल"
    if (
      text.includes('नाही') ||
      text.includes('रद्द करा') ||
      text.includes('रद्द') ||
      text.includes('नको') ||
      text.includes('कॅन्सल')
    ) {
      return 'CANCEL';
    }
  }

  // HINDI VOICE COMMANDS
  if (language === 'Hindi') {
    if (text.includes('आगे बढ़ो') || text.includes('आगे') || text.includes('नेक्स्ट') || text.includes('अगला')) return 'NEXT';
    if (text.includes('पीछे जाओ') || text.includes('पीछे') || text.includes('वापस')) return 'BACK';
    if (text.includes('दोबारा पढ़ो') || text.includes('फिर बोलो') || text.includes('रिपीट')) return 'REPEAT';
    if (text.includes('पूरा फॉर्म पढ़ो') || text.includes('पूरा पढ़ो') || text.includes('सब पढ़ो')) return 'READ_ALL';
    if (text.includes('रोक दो') || text.includes('पॉज') || text.includes('रुको')) return 'PAUSE';
    if (text.includes('फिर शुरू करो') || text.includes('जारी रखो') || text.includes('रिज्यूम')) return 'RESUME';
    if (text.includes('बंद करो') || text.includes('स्टॉप')) return 'STOP';
    if (text.includes('संपादित करो') || text.includes('बदलो') || text.includes('एडिट')) return 'EDIT';
    if (text.includes('पुष्टि करें') || text.includes('हाँ') || text.includes('हां') || text.includes('स्वीकार') || text.includes('मंजूर')) return 'CONFIRM';
    if (text.includes('नहीं') || text.includes('रद्द करो') || text.includes('कैंसिल')) return 'CANCEL';
  }

  // ENGLISH VOICE COMMANDS
  if (language === 'English') {
    if (text.includes('next') || text.includes('continue') || text.includes('proceed') || text.includes('forward')) return 'NEXT';
    if (text.includes('back') || text.includes('previous') || text.includes('return')) return 'BACK';
    if (text.includes('repeat') || text.includes('say again') || text.includes('read again')) return 'REPEAT';
    if (text.includes('read entire') || text.includes('read all') || text.includes('read form') || text.includes('read consent')) return 'READ_ALL';
    if (text.includes('pause') || text.includes('wait') || text.includes('hold')) return 'PAUSE';
    if (text.includes('resume') || text.includes('continue reading') || text.includes('play')) return 'RESUME';
    if (text.includes('stop') || text.includes('halt') || text.includes('cancel reading')) return 'STOP';
    if (text.includes('edit') || text.includes('change') || text.includes('modify')) return 'EDIT';
    if (text.includes('confirm') || text.includes('submit') || text.includes('yes') || text.includes('i agree') || text.includes('i consent')) return 'CONFIRM';
    if (text.includes('cancel') || text.includes('no') || text.includes('decline')) return 'CANCEL';
  }

  return null;
}

// Common Hospital Prompts
export const VOICE_PROMPTS: Record<VoiceLanguage, Record<string, string>> = {
  English: {
    welcome: 'Welcome to MediKiosk. Please select your preferred language to begin registration.',
    voiceSetup: 'Microphone and regional voice check. Say hello or proceed to consent.',
    consentRequired: 'Please review the Patient Information Sheet and Written Informed Consent form. You may click Read Entire Form Aloud to listen.',
    consentAccepted: 'Consent recorded successfully. Let us now capture your identity and demographics.',
    namePrompt: 'What is your full name? You can speak your name clearly.',
    mobilePrompt: 'Please enter your 10-digit mobile number.',
    symptomPrompt: 'What brings you to the hospital today? Please describe your chief health complaint.',
    durationPrompt: 'How long have you been experiencing this symptom?',
    allergyPrompt: 'Do you have any known drug or food allergies?',
    scanOffer: 'Would you like to scan your previous prescription or lab report for automatic extraction?',
    documentVerified: 'Document verified. Extracted clinical findings have been attached to your profile.',
    reviewPrompt: 'Please review your registration summary carefully before final submission.',
    tokenGenerated: 'Your registration is complete. Your OPD token is generated. Please proceed to Chamber 3.',
    emergencyWarning: 'Potential urgent symptom detected. Please notify the triage nurse or approach the emergency counter immediately.',
    testSample: 'Hello. Welcome to your hospital registration kiosk. I will guide you through each step.',
  },
  Hindi: {
    welcome: 'मेडीकियोस्क में आपका स्वागत है। कृपया पंजीकरण शुरू करने के लिए अपनी भाषा चुनें।',
    voiceSetup: 'माइक्रोफोन और क्षेत्रीय आवाज परीक्षण। नमस्ते कहें या सहमति की ओर बढ़ें।',
    consentRequired: 'कृपया मरीज सूचना पत्रक और लिखित सहमति प्रपत्र की समीक्षा करें। आप पूरा फॉर्म सुनने के लिए बटन दबा सकते हैं।',
    consentAccepted: 'सहमति सफलतापूर्वक दर्ज की गई। अब हम आपकी व्यक्तिगत जानकारी दर्ज करेंगे।',
    namePrompt: 'आपका पूरा नाम क्या है? आप बोलकर बता सकते हैं।',
    mobilePrompt: 'कृपया अपना 10 अंकों का मोबाइल नंबर दर्ज करें।',
    symptomPrompt: 'आज अस्पताल आने का मुख्य कारण क्या है? कृपया अपनी स्वास्थ्य समस्या बताएं।',
    durationPrompt: 'आपको यह लक्षण कितने समय से महसूस हो रहे हैं?',
    allergyPrompt: 'क्या आपको किसी दवा या भोजन से कोई ज्ञात एलर्जी है?',
    scanOffer: 'क्या आप अपनी पुरानी पर्ची या टेस्ट रिपोर्ट स्कैन करना चाहते हैं?',
    documentVerified: 'दस्तावेज़ सत्यापित हो गया है। विवरण आपकी फाइल से जोड़ दिए गए हैं।',
    reviewPrompt: 'कृपया अपनी जानकारी की समीक्षा करें और पुष्टि करें।',
    tokenGenerated: 'आपका पंजीकरण पूरा हो गया है। आपका ओपीडी टोकन जारी हो गया है। कृपया कक्ष क्रमांक ३ में जाएं।',
    emergencyWarning: 'संभावित आपातकालीन लक्षण पाया गया है। कृपया तुरंत अस्पताल स्टाफ या इमरजेंसी काउंटर से संपर्क करें।',
    testSample: 'नमस्ते। आपके अस्पताल पंजीकरण कियोस्क में आपका स्वागत है। मैं आपको पंजीकरण प्रक्रिया में मार्गदर्शन करूँगा।',
  },
  Marathi: {
    welcome: 'मेडीकियोस्कमध्ये आपले स्वागत आहे. नोंदणी सुरू करण्यासाठी कृपया आपली भाषा निवडा.',
    voiceSetup: 'मायक्रोफोन आणि प्रादेशिक आवाज पडताळणी. हॅलो बोला किंवा संमतीकडे पुढे जा.',
    consentRequired: 'कृपया रुग्ण माहिती पत्रक आणि लेखी संमती अर्ज काळजीपूर्वक वाचा. आपण संपूर्ण फॉर्म ऐकण्यासाठी बटन दाबू शकता.',
    consentAccepted: 'संमती यशस्वीरीत्या नोंदवली गेली आहे. आता आपली वैयक्तिक माहिती नोंदवूया.',
    namePrompt: 'आपले पूर्ण नाव काय आहे? आपण आवाजाद्वारे सांगू शकता.',
    mobilePrompt: 'कृपया आपला 10 अंकी मोबाईल क्रमांक प्रविष्ट करा.',
    symptomPrompt: 'आज रुग्णालयात येण्याचे मुख्य कारण काय आहे? कृपया आपला त्रास सांगा.',
    durationPrompt: 'हा त्रास आपल्याला किती दिवसांपासून होत आहे?',
    allergyPrompt: 'आपल्याला कोणत्याही औषधाची किंवा अन्नाची ॲलर्जी आहे का?',
    scanOffer: 'आपण जुनी औषध चिठ्ठी किंवा तपासणी अहवाल स्कॅन करू इच्छिता का?',
    documentVerified: 'दस्तऐवज पडताळणी पूर्ण झाली आहे आणि तपशील जोडले गेले आहेत.',
    reviewPrompt: 'कृपया आपल्या माहितीची खात्री करा आणि अंतिम टोकन मिळवा.',
    tokenGenerated: 'आपली नोंदणी पूर्ण झाली आहे. आपला ओपीडी टोकन तयार झाला आहे. कृपया कक्ष क्रमांक ३ मध्ये जा.',
    emergencyWarning: 'तातडीची वैद्यकीय मदत आवश्यक असलेले लक्षण आढळले आहे. कृपया त्वरित वैद्यकीय कर्मचाऱ्यांशी संपर्क साधा.',
    testSample: 'नमस्कार. आपल्या आरोग्य नोंदणीसाठी आपले स्वागत आहे. मी आपल्याला संपूर्ण नोंदणी प्रक्रियेत मार्गदर्शन करेन.',
  },
};

// Browser Speech Recognition Helper
export interface SpeechRecognitionResultState {
  transcript: string;
  isFinal: boolean;
}

export class VoiceRecognitionService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentLanguage: VoiceLanguage = 'English';

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public setLanguage(language: VoiceLanguage): void {
    this.currentLanguage = language;
    if (this.recognition) {
      this.recognition.lang = LANGUAGE_CODES[language] || 'en-IN';
    }
  }

  public startListening(
    language: VoiceLanguage,
    onResult: (result: SpeechRecognitionResultState) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ): boolean {
    if (!this.recognition) {
      onError?.('unsupported');
      return false;
    }

    if (this.isListening) {
      this.stop();
    }

    try {
      this.currentLanguage = language;
      // Explicitly configure requested locale (mr-IN for Marathi, hi-IN for Hindi, en-IN for English)
      this.recognition.lang = LANGUAGE_CODES[language] || 'mr-IN';
      this.isListening = true;

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }
        onResult({ transcript, isFinal });
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        onError?.(event.error || 'Speech input error');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd?.();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      this.isListening = false;
      onError?.(err.message || 'audio-capture');
      return false;
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListening = false;
    }
  }
}

export const voiceRecognition = new VoiceRecognitionService();

