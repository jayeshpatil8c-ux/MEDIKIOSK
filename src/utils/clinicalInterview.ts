import { VoiceLanguage } from './speechHelper';
import { AyurvedaCase } from '../types';

export type CarePathway = 'allopathy' | 'ayurveda';
export type InterviewInputType = 'single_choice' | 'text' | 'number' | 'yes_no' | 'multi_choice';
export type Urgency = 'ROUTINE' | 'PRIORITY' | 'URGENT' | 'IMMEDIATE';

export interface InterviewQuestion {
  id: string;
  category: string;
  inputType: InterviewInputType;
  options?: string[];
  required?: boolean;
  clinicalRelevance: string;
  redFlagRule?: string;
  text: Record<VoiceLanguage, string>;
}

export interface ClinicalInterviewState {
  carePathway: CarePathway;
  complaintKey: string;
  answers: Record<string, string | string[]>;
  redFlags: string[];
  urgency: Urgency;
  evidence: string[];
}

const text = (en: string, hi: string, mr: string): Record<VoiceLanguage, string> => ({ English: en, Hindi: hi, Marathi: mr });

export const COMPLAINT_OPTIONS = [
  { key: 'fever', label: 'Fever', icon: '🌡️' }, { key: 'cough', label: 'Cough', icon: '🫁' },
  { key: 'breathing', label: 'Breathing difficulty', icon: '🌬️' }, { key: 'chest_pain', label: 'Chest discomfort', icon: '🫀' },
  { key: 'headache', label: 'Headache', icon: '🧠' }, { key: 'abdominal_pain', label: 'Digestive problem', icon: '🩺' },
  { key: 'vomiting', label: 'Vomiting', icon: '↗️' }, { key: 'diarrhea', label: 'Loose stools', icon: '💧' },
  { key: 'dizziness', label: 'Dizziness', icon: '🌀' }, { key: 'weakness', label: 'Fatigue', icon: '⚡' },
  { key: 'joint_pain', label: 'Joint discomfort', icon: '🦴' }, { key: 'back_pain', label: 'Back pain', icon: '🧍' },
  { key: 'skin', label: 'Skin problem', icon: '◌' }, { key: 'urinary', label: 'Urinary concern', icon: '💧' },
  { key: 'menstrual', label: 'Menstrual concern', icon: '🌸' }, { key: 'sleep', label: 'Sleep problem', icon: '☾' },
];

const commonQuestions: InterviewQuestion[] = [
  { id: 'onset', category: 'HPI', inputType: 'text', required: true, clinicalRelevance: 'Onset and duration', text: text('When did this problem start?', 'यह समस्या कब शुरू हुई?', 'ही समस्या कधी सुरू झाली?') },
  { id: 'severity', category: 'HPI', inputType: 'number', required: true, clinicalRelevance: 'Patient-reported severity', text: text('How severe is it, from 0 to 10?', 'यह कितनी तेज है, 0 से 10 तक?', 'हे किती तीव्र आहे, ० ते १० पैकी?') },
];

const allopathyTrees: Record<string, InterviewQuestion[]> = {
  chest_pain: [
    { id: 'site', category: 'SOCRATES', inputType: 'text', required: true, clinicalRelevance: 'Site', text: text('Where exactly do you feel the discomfort?', 'आपको यह परेशानी ठीक कहाँ महसूस होती है?', 'हा त्रास नेमका कुठे जाणवतो?') },
    { id: 'character', category: 'SOCRATES', inputType: 'single_choice', options: ['Pressure', 'Tightness', 'Burning', 'Sharp', 'Dull', 'Other'], clinicalRelevance: 'Character', text: text('What does it feel like?', 'यह कैसा महसूस होता है?', 'हे कसे जाणवते?') },
    { id: 'radiation', category: 'SOCRATES', inputType: 'text', clinicalRelevance: 'Radiation', text: text('Does it move anywhere else?', 'क्या यह कहीं और फैलता है?', 'हा त्रास दुसरीकडे पसरतो का?') },
    { id: 'breathlessness', category: 'Safety', inputType: 'yes_no', clinicalRelevance: 'Breathing difficulty', redFlagRule: 'chest_breathlessness', text: text('Are you having breathing difficulty?', 'क्या आपको सांस लेने में परेशानी है?', 'तुम्हाला श्वास घेण्यास त्रास होतोय का?') },
    { id: 'sudden', category: 'Safety', inputType: 'yes_no', clinicalRelevance: 'Sudden onset', redFlagRule: 'sudden_severe', text: text('Did it begin suddenly?', 'क्या यह अचानक शुरू हुआ?', 'हे अचानक सुरू झाले का?') },
  ],
  breathing: [
    { id: 'breathing_onset', category: 'HPI', inputType: 'text', required: true, clinicalRelevance: 'Onset', text: text('When did the breathing difficulty start?', 'सांस लेने की परेशानी कब शुरू हुई?', 'श्वास घेण्याचा त्रास कधी सुरू झाला?') },
    { id: 'breathing_sudden', category: 'Safety', inputType: 'yes_no', redFlagRule: 'sudden_breathlessness', clinicalRelevance: 'Sudden onset', text: text('Did it begin suddenly?', 'क्या यह अचानक शुरू हुआ?', 'हे अचानक सुरू झाले का?') },
    { id: 'breathing_worse', category: 'Safety', inputType: 'yes_no', redFlagRule: 'worsening_breathlessness', clinicalRelevance: 'Progression', text: text('Is it getting worse?', 'क्या यह बढ़ रहा है?', 'हा त्रास वाढतोय का?') },
  ],
  fever: [
    { id: 'fever_pattern', category: 'HPI', inputType: 'single_choice', options: ['Continuous', 'Comes and goes', 'Not sure'], clinicalRelevance: 'Fever pattern', text: text('Is the fever continuous or does it come and go?', 'बुखार लगातार रहता है या आता-जाता है?', 'ताप सतत असतो की येतो-जातो?') },
    { id: 'fever_breathing', category: 'Safety', inputType: 'yes_no', redFlagRule: 'fever_breathlessness', clinicalRelevance: 'Breathing difficulty', text: text('Do you have breathing difficulty?', 'क्या आपको सांस लेने में परेशानी है?', 'तुम्हाला श्वास घेण्यास त्रास होतोय का?') },
  ],
  headache: [
    { id: 'headache_site', category: 'HPI', inputType: 'text', clinicalRelevance: 'Site', text: text('Where is the headache?', 'सिर में दर्द कहाँ है?', 'डोके कुठे दुखते?') },
    { id: 'sudden', category: 'Safety', inputType: 'yes_no', redFlagRule: 'sudden_severe', clinicalRelevance: 'Sudden onset', text: text('Did it begin suddenly?', 'क्या यह अचानक शुरू हुआ?', 'हे अचानक सुरू झाले का?') },
  ],
  abdominal_pain: [
    { id: 'abdomen_site', category: 'HPI', inputType: 'text', clinicalRelevance: 'Site', text: text('Where exactly is the stomach discomfort?', 'पेट में परेशानी ठीक कहाँ है?', 'पोटात त्रास नेमका कुठे आहे?') },
    { id: 'food_relation', category: 'HPI', inputType: 'text', clinicalRelevance: 'Food relationship', text: text('Is it related to eating?', 'क्या इसका संबंध खाने से है?', 'याचा खाण्याशी संबंध आहे का?') },
    { id: 'abdominal_bleeding', category: 'Safety', inputType: 'yes_no', redFlagRule: 'severe_bleeding', clinicalRelevance: 'Bleeding', text: text('Have you seen blood in vomit or stool?', 'क्या उल्टी या मल में खून दिखा?', 'उलटीत किंवा शौचात रक्त दिसले का?') },
  ],
};

const ayurvedaQuestions: InterviewQuestion[] = [
  { id: 'roga_onset', category: 'Roga Itihasa • Present complaint', inputType: 'text', required: true, clinicalRelevance: 'Onset and duration', text: text('When did this concern begin?', 'यह समस्या कब शुरू हुई?', 'ही तक्रार कधी सुरू झाली?') },
  { id: 'roga_course', category: 'Roga Itihasa • Present complaint', inputType: 'single_choice', options: ['Sudden', 'Gradual', 'Not sure'], clinicalRelevance: 'Onset pattern', text: text('Did it begin suddenly or gradually?', 'यह अचानक शुरू हुई या धीरे-धीरे?', 'ही अचानक सुरू झाली की हळूहळू?') },
  { id: 'roga_timing', category: 'Roga Itihasa • Kala', inputType: 'single_choice', options: ['Morning', 'Afternoon', 'Evening', 'Night', 'Varies'], clinicalRelevance: 'Time pattern', text: text('At what time of day is it usually worse?', 'दिन में किस समय यह अधिक बढ़ती है?', 'दिवसाच्या कोणत्या वेळी हा त्रास वाढतो?') },
  { id: 'nidana_diet', category: 'Nidana • Reported factors', inputType: 'multi_choice', options: ['Irregular meals', 'Heavy meals', 'Spicy or oily food', 'Poor sleep', 'Stress', 'No clear factor'], clinicalRelevance: 'Reported factors, not causes', text: text('Have you noticed any of these when symptoms change?', 'लक्षणे बदलताना यापैकी काही जाणवते का?', 'लक्षणे बदलताना यापैकी काही जाणवते का?') },
  { id: 'agni', category: 'Agni • Digestive capacity', inputType: 'single_choice', options: ['Regular', 'Irregular', 'Very strong', 'Low', 'Variable'], clinicalRelevance: 'Preliminary Agni observation', text: text('How is your appetite usually?', 'आपकी भूख आमतौर पर कैसी रहती है?', 'आपली भूक साधारणपणे कशी असते?') },
  { id: 'after_meals', category: 'Agni • Digestive capacity', inputType: 'multi_choice', options: ['Comfortable', 'Heavy', 'Bloated', 'Burning', 'Sleepy', 'Other'], clinicalRelevance: 'Post-meal observation', text: text('How do you usually feel after meals?', 'खाने के बाद आपको कैसा महसूस होता है?', 'जेवल्यानंतर आपल्याला कसे वाटते?') },
  { id: 'ama_screen', category: 'Ama-related symptom screen', inputType: 'multi_choice', options: ['Heaviness', 'Coated tongue', 'Reduced appetite', 'Indigestion', 'Bloating', 'Fatigue', 'None noticed'], clinicalRelevance: 'Patient-reported observations only', text: text('Have you noticed any of these symptoms?', 'क्या आपने इनमें से कोई लक्षण देखे हैं?', 'यापैकी कोणती लक्षणे जाणवतात?') },
  { id: 'koshtha', category: 'Koshtha • Bowel tendency', inputType: 'single_choice', options: ['Regular and easy', 'Hard or infrequent', 'Loose or frequent', 'Variable'], clinicalRelevance: 'Preliminary Koshta observation', text: text('How are your bowel movements usually?', 'आपका मल त्याग आमतौर पर कैसा रहता है?', 'तुमचे मलप्रवर्तन साधारण कसे असते?') },
  { id: 'mala', category: 'Mala • Stool observations', inputType: 'multi_choice', options: ['Formed', 'Hard', 'Loose', 'Watery', 'Variable', 'Blood noticed', 'Mucus noticed'], clinicalRelevance: 'Stool observation and safety screening', redFlagRule: 'severe_bleeding', text: text('How would you describe your stool?', 'आप अपने मल का वर्णन कैसे करेंगे?', 'आपल्या मलाचे वर्णन कसे कराल?') },
  { id: 'mutra', category: 'Mutra • Urinary history', inputType: 'multi_choice', options: ['Regular', 'Burning', 'Urgency', 'Frequent', 'Night-time urination', 'Appearance changed', 'Blood noticed'], clinicalRelevance: 'Urinary observation and safety screening', redFlagRule: 'urinary_bleeding', text: text('Have you noticed any change in urination?', 'क्या पेशाब में कोई बदलाव देखा है?', 'लघवीमध्ये काही बदल जाणवला आहे का?') },
  { id: 'nidra', category: 'Nidra • Sleep', inputType: 'single_choice', options: ['Restful', 'Difficulty falling asleep', 'Wakes during night', 'Short sleep', 'Daytime sleepy'], clinicalRelevance: 'Sleep pattern', text: text('How would you describe your sleep?', 'आपकी नींद कैसी रहती है?', 'आपली झोप कशी असते?') },
  { id: 'meal_timing', category: 'Ahara • Food profile', inputType: 'single_choice', options: ['Regular', 'Often late', 'Often skipped', 'Variable'], clinicalRelevance: 'Meal timing', text: text('Are your meal timings regular?', 'क्या आपके भोजन का समय नियमित है?', 'आपच्या जेवणाच्या वेळा नियमित आहेत का?') },
  { id: 'food_suitability', category: 'Satmya • Food suitability', inputType: 'text', clinicalRelevance: 'Food suitability and reported triggers', text: text('Which foods suit you well, and which seem to worsen your symptoms?', 'कौन से भोजन आपको अनुकूल लगते हैं और कौन से लक्षण बढ़ाते हैं?', 'कोणते पदार्थ आपल्याला मानवतात आणि कोणते त्रास वाढवतात?') },
  { id: 'vihara_activity', category: 'Vihara • Lifestyle', inputType: 'single_choice', options: ['Rarely active', 'Sometimes active', 'Regularly active', 'Very active'], clinicalRelevance: 'Activity pattern', text: text('How much physical activity do you usually do?', 'आप आमतौर पर कितनी शारीरिक गतिविधि करते हैं?', 'आप साधारण किती शारीरिक हालचाल करता?') },
  { id: 'dinacharya', category: 'Dinacharya • Daily routine', inputType: 'text', clinicalRelevance: 'Daily routine', text: text('Please describe your usual wake, work, meal, and sleep routine.', 'अपनी सामान्य जागने, काम, भोजन और सोने की दिनचर्या बताएं।', 'आपली उठण्याची, कामाची, जेवणाची आणि झोपेची दिनचर्या सांगा.') },
  { id: 'ritucharya', category: 'Ritucharya • Seasonal pattern', inputType: 'single_choice', options: ['Summer', 'Monsoon', 'Winter', 'Spring', 'No clear seasonal change'], clinicalRelevance: 'Seasonal pattern', text: text('Which season tends to change your symptoms?', 'किस ऋतु में आपके लक्षण बदलते हैं?', 'कोणत्या ऋतूत आपल्या तक्रारी बदलतात?') },
  { id: 'prakriti', category: 'Prakriti • Natural constitution', inputType: 'multi_choice', options: ['Often restless or light', 'Often warm or intense', 'Often steady or heavy'], clinicalRelevance: 'Preliminary constitutional observation', text: text('Which descriptions feel most like your usual nature?', 'इनमें से कौन सा वर्णन आपके सामान्य स्वभाव से मिलता है?', 'यापैकी कोणते वर्णन तुमच्या नेहमीच्या प्रकृतीशी जुळते?') },
  { id: 'prakriti_body', category: 'Prakriti • Natural constitution', inputType: 'multi_choice', options: ['Light or variable build', 'Warm or sensitive skin', 'Steady or broad build', 'Variable appetite', 'Strong appetite', 'Slow appetite'], clinicalRelevance: 'Observable constitutional indicators', text: text('Which descriptions have usually been true for you over many years?', 'कौन से वर्णन कई वर्षों से आपके लिए सामान्य रहे हैं?', 'अनेक वर्षांपासून आपल्याबद्दल कोणती वर्णने खरी आहेत?') },
  { id: 'vikriti_current', category: 'Vikriti • Current symptom pattern', inputType: 'multi_choice', options: ['Dryness or gas', 'Burning or heat', 'Heaviness or mucus', 'Restlessness', 'Irritation', 'Sluggishness'], clinicalRelevance: 'Current observations, not a diagnosis', text: text('Which symptoms are more noticeable recently?', 'हाल में कौन से लक्षण अधिक महसूस हो रहे हैं?', 'अलीकडे कोणती लक्षणे अधिक जाणवतात?') },
  { id: 'satva', category: 'Satva • Mental wellbeing', inputType: 'single_choice', options: ['Low stress', 'Moderate stress', 'High stress', 'Prefer not to say'], clinicalRelevance: 'Sensitive wellbeing screen, not psychiatric diagnosis', text: text('How would you describe your current stress level?', 'आप अपने वर्तमान तनाव का वर्णन कैसे करेंगे?', 'आपला सध्याचा ताण कसा आहे?') },
  { id: 'vyayama_shakti', category: 'Vyayama Shakti • Exercise capacity', inputType: 'single_choice', options: ['Comfortable with routine activity', 'Some fatigue with activity', 'Can do little activity', 'Prefer practitioner assessment'], clinicalRelevance: 'Preliminary exercise capacity', text: text('How much physical activity can you comfortably perform?', 'आप आराम से कितनी शारीरिक गतिविधि कर सकते हैं?', 'आप किती शारीरिक हालचाल आरामात करू शकता?') },
  { id: 'satmya', category: 'Satmya • Foods and habits', inputType: 'text', clinicalRelevance: 'Foods and habits that suit the patient', text: text('Which foods or habits help you feel well?', 'कौन से भोजन या आदतें आपको अच्छा महसूस कराती हैं?', 'कोणते पदार्थ किंवा सवयी आपल्याला बरे वाटायला मदत करतात?') },
  { id: 'desha', category: 'Desha • Environment', inputType: 'text', clinicalRelevance: 'Region and living/occupational environment', text: text('What kind of region and environment do you live and work in?', 'आप किस क्षेत्र और वातावरण में रहते और काम करते हैं?', 'आपण कोणत्या प्रदेशात आणि वातावरणात राहता व काम करता?') },
  { id: 'ashtavidha_patient', category: 'Ashtavidha Pariksha • Patient history', inputType: 'text', clinicalRelevance: 'Patient-reported observations; examination remains pending', text: text('Is there anything about your tongue, voice, appearance, touch, or urine you want the practitioner to know?', 'जीभ, आवाज, रूप, स्पर्श या पेशाब के बारे में कोई बात चिकित्सक को बताना चाहेंगे?', 'जीभ, आवाज, रूप, स्पर्श किंवा लघवीबद्दल वैद्यांना सांगायचे काही आहे का?') },
  { id: 'previous_ayurveda', category: 'Previous Ayurvedic care', inputType: 'text', clinicalRelevance: 'Previous treatment history', text: text('Have you had Ayurvedic treatment before? Please describe it if you wish.', 'क्या आपने पहले आयुर्वेदिक उपचार लिया है? चाहें तो बताएं।', 'आपण यापूर्वी आयुर्वेदिक उपचार घेतला आहे का? सांगू इच्छित असल्यास सांगा.') },
];

const ayurvedaBranches: Record<string, InterviewQuestion[]> = {
  abdominal_pain: [{ id: 'food_bloating', category: 'Digestive branch • Ahara and Agni', inputType: 'yes_no', clinicalRelevance: 'Bloating and food relationship', text: text('Does bloating or discomfort increase after meals?', 'क्या खाने के बाद पेट फूलना या परेशानी बढ़ती है?', 'जेवल्यानंतर पोट फुगणे किंवा त्रास वाढतो का?') }],
  joint_pain: [{ id: 'joint_movement', category: 'Joint branch • Vata-oriented observations', inputType: 'multi_choice', options: ['Stiffness', 'Swelling', 'Worse with movement', 'Worse with weather', 'Affects sleep'], clinicalRelevance: 'Joint symptom observations', text: text('What do you notice about the joint discomfort?', 'जोड़ों की परेशानी में आपको क्या महसूस होता है?', 'सांध्यांच्या त्रासाबद्दल आपल्याला काय जाणवते?') }],
  breathing: [{ id: 'respiratory_branch', category: 'Respiratory branch • Safety bridge', inputType: 'multi_choice', options: ['Cough', 'Sputum', 'Breathlessness', 'Worse by season', 'Affects sleep'], clinicalRelevance: 'Respiratory observations', text: text('Which breathing-related symptoms do you notice?', 'सांस से जुड़े कौन से लक्षण हैं?', 'श्वासाशी संबंधित कोणती लक्षणे जाणवतात?') }],
  skin: [{ id: 'skin_branch', category: 'Skin branch', inputType: 'multi_choice', options: ['Itching', 'Dryness', 'Burning', 'Redness', 'Seasonal change', 'Food association'], clinicalRelevance: 'Skin symptom observations', text: text('What do you notice about the skin problem?', 'त्वचा की समस्या में आपको क्या महसूस होता है?', 'त्वचेच्या तक्रारीत आपल्याला काय जाणवते?') }],
  sleep: [{ id: 'sleep_branch', category: 'Sleep branch', inputType: 'multi_choice', options: ['Difficulty falling asleep', 'Night waking', 'Daytime sleepiness', 'Stress-related', 'Screen use before sleep'], clinicalRelevance: 'Sleep observations', text: text('What best describes your sleep concern?', 'नींद की परेशानी का सबसे अच्छा वर्णन क्या है?', 'झोपेच्या तक्रारीचे योग्य वर्णन कोणते?') }],
};

export function getInterviewQuestions(complaintKey: string, carePathway: CarePathway = 'allopathy'): InterviewQuestion[] {
  if (carePathway === 'ayurveda') return [...commonQuestions, ...(allopathyTrees[complaintKey] || []), ...(ayurvedaBranches[complaintKey] || []), ...ayurvedaQuestions];
  return [...commonQuestions, ...(allopathyTrees[complaintKey] || [])];
}

export function normalizeComplaint(input: string): string {
  const value = input.toLowerCase();
  if (/chest|छाती|छातीत/.test(value)) return 'chest_pain'; if (/breath|श्वास|सांस/.test(value)) return 'breathing';
  if (/fever|ताप|बुखार/.test(value)) return 'fever'; if (/cough|खोकला|खांसी/.test(value)) return 'cough';
  if (/head|डोके|सिर/.test(value)) return 'headache'; if (/stomach|abdomen|पोट|पेट|digest|पचन/.test(value)) return 'abdominal_pain';
  if (/vomit|उलटी|उल्टी/.test(value)) return 'vomiting'; if (/diarr|जुलाब|दस्त/.test(value)) return 'diarrhea';
  if (/dizz|चक्कर|गरगर/.test(value)) return 'dizziness'; if (/joint|सांधा|जोड़/.test(value)) return 'joint_pain';
  if (/skin|त्वचा|त्वचे/.test(value)) return 'skin'; if (/sleep|झोप|नींद/.test(value)) return 'sleep';
  if (/back|पाठ|पीठ/.test(value)) return 'back_pain'; return 'other';
}

export function evaluateUrgency(complaintKey: string, answers: Record<string, string | string[]>): { urgency: Urgency; redFlags: string[]; evidence: string[] } {
  const yes = (key: string) => answers[key] === 'Yes';
  const has = (key: string, value: string) => String(answers[key] || '').includes(value);
  const redFlags: string[] = []; const evidence: string[] = [];
  if ((complaintKey === 'chest_pain' && yes('breathlessness')) || (complaintKey === 'breathing' && (yes('fainting') || has('respiratory_branch', 'Breathlessness')))) { redFlags.push('cardiorespiratory symptoms'); evidence.push('reported chest or breathing difficulty with an associated symptom'); }
  if (complaintKey === 'breathing' && (yes('breathing_sudden') || yes('breathing_worse'))) { redFlags.push('respiratory warning pattern'); evidence.push('reported sudden or worsening breathing symptom'); }
  if ((complaintKey === 'chest_pain' || complaintKey === 'headache') && yes('sudden')) { redFlags.push('sudden onset'); evidence.push('reported sudden onset'); }
  if (yes('abdominal_bleeding') || has('mala', 'Blood') || has('mutra', 'Blood')) { redFlags.push('reported bleeding'); evidence.push('reported blood in stool, vomit, or urine'); }
  if (complaintKey === 'fever' && yes('fever_breathing')) { redFlags.push('fever with breathing difficulty'); evidence.push('reported fever with breathing difficulty'); }
  if (redFlags.length) return { urgency: 'IMMEDIATE', redFlags, evidence };
  if (complaintKey === 'chest_pain' || complaintKey === 'breathing' || ['8', '9', '10'].includes(String(answers.severity))) return { urgency: 'PRIORITY', redFlags, evidence: ['complaint requires clinician review'] };
  return { urgency: 'ROUTINE', redFlags, evidence: [] };
}

export function buildInterviewSummary(state: ClinicalInterviewState): string {
  const answers = Object.entries(state.answers).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; ');
  return `Care pathway: ${state.carePathway}. Complaint: ${state.complaintKey}. ${answers || 'No follow-up answers recorded.'} AI-generated draft — clinician review required.`;
}

export function buildAyurvedaCase(state: ClinicalInterviewState, chiefComplaint: string, now = new Date().toISOString()): AyurvedaCase {
  const answers = state.answers;
  const grouped = (keys: string[]) => Object.fromEntries(keys.filter((key) => answers[key] !== undefined).map((key) => [key, answers[key]]));
  const prakritiAnswers = grouped(['prakriti', 'prakriti_body']);
  const agniAnswers = grouped(['agni', 'appetite', 'after_meals']);
  const doshaText = String(prakritiAnswers.prakriti || '');
  const preliminaryPattern = doshaText.includes('restless') && doshaText.includes('warm') ? 'Vata-Pitta observations' : doshaText.includes('heavy') ? 'Kapha-oriented observations' : 'Preliminary pattern unclear';
  const agniText = String(agniAnswers.agni || '');
  const preliminaryAgni = agniText.includes('Irregular') || agniText.includes('Variable') ? 'Vishama Agni observation' : agniText.includes('Low') ? 'Manda Agni observation' : agniText.includes('Very strong') ? 'Tikshna Agni observation' : 'Agni pattern incomplete';
  const pending = (value: string) => ({ value, source: 'Practitioner pending' as const });
  return {
    chiefComplaint,
    rogaItihasa: grouped(['roga_onset', 'roga_course', 'roga_timing', 'onset', 'severity']), nidanaHistory: grouped(['nidana_diet']),
    prakriti: { observations: prakritiAnswers, preliminaryPattern, completeness: Math.min(100, Math.round((Object.keys(prakritiAnswers).length / 2) * 100)), status: 'Awaiting practitioner confirmation' },
    vikriti: { observations: grouped(['vikriti_current', 'ama_screen']), preliminaryPattern: 'Potential current symptom pattern — practitioner review required', status: 'Awaiting practitioner confirmation' },
    agni: { observations: agniAnswers, preliminaryAssessment: preliminaryAgni, status: 'Awaiting practitioner confirmation' },
    amaScreen: grouped(['ama_screen']), koshta: grouped(['koshtha']), mala: grouped(['mala']), mutra: grouped(['mutra']), nidra: grouped(['nidra']), ahara: grouped(['meal_timing', 'food_suitability', 'appetite', 'after_meals']), vihara: grouped(['vihara_activity']), dinacharya: grouped(['dinacharya']), ritucharya: grouped(['ritucharya']), satmya: grouped(['satmya', 'food_suitability']), satva: grouped(['satva']), desha: grouped(['desha']), kala: grouped(['roga_timing', 'ritucharya']),
    ashtavidha: { nadi: pending('Pending practitioner examination'), mutra: { value: String(answers.mutra || ''), source: 'Patient reported' }, mala: { value: String(answers.mala || ''), source: 'Patient reported' }, jihva: { value: String(answers.ashtavidha_patient || 'Pending practitioner examination'), source: 'Patient reported' }, shabda: pending('Pending practitioner examination'), sparsha: pending('Pending practitioner examination'), drik: pending('Pending practitioner examination'), akriti: pending('Pending practitioner examination') },
    dashavidha: Object.fromEntries(['prakriti', 'vikriti', 'sara', 'samhanana', 'pramana', 'satmya', 'satva', 'aharaShakti', 'vyayamaShakti', 'vaya'].map((key) => [key, { value: key === 'prakriti' ? preliminaryPattern : 'Pending practitioner confirmation', source: 'Practitioner pending' as const }])),
    srotas: [], practitionerObservations: '', practitionerAssessment: '', safetyFlags: state.evidence, documents: [], status: 'Awaiting practitioner review', createdAt: now, updatedAt: now,
  };
}
