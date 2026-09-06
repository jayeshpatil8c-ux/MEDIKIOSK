import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Mic, ShieldAlert, Volume2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { VoiceLanguage, getFriendlySpeechError, speakText, voiceRecognition } from '../../../utils/speechHelper';
import { CarePathway, COMPLAINT_OPTIONS, ClinicalInterviewState, evaluateUrgency, getInterviewQuestions, normalizeComplaint } from '../../../utils/clinicalInterview';
import { useQuestionVoice } from '../../../hooks/useQuestionVoice';

interface Props {
  reasonForVisit: 'unwell' | 'followup' | 'review' | 'routine'; setReasonForVisit: (value: 'unwell' | 'followup' | 'review' | 'routine') => void;
  chiefComplaint: string; setChiefComplaint: (value: string) => void;
  symptomDuration: string; setSymptomDuration: (value: string) => void;
  symptomSeverity: 'Mild' | 'Moderate' | 'Severe'; setSymptomSeverity: (value: 'Mild' | 'Moderate' | 'Severe') => void;
  symptomLocation: string; setSymptomLocation: (value: string) => void;
  hasSecondaryComplaint: boolean; setHasSecondaryComplaint: (value: boolean) => void;
  secondaryComplaint: string; setSecondaryComplaint: (value: string) => void;
  urgencyScreen: 'No' | 'Yes'; setUrgencyScreen: (value: 'No' | 'Yes') => void;
  selectedLanguage: VoiceLanguage; onBack: () => void; onContinue: () => void;
  carePathway: CarePathway; setCarePathway: (value: CarePathway) => void;
  interviewState: ClinicalInterviewState; setInterviewState: (value: ClinicalInterviewState) => void;
}

const yesNo = ['Yes', 'No'];

export const AdaptiveHealthStep: React.FC<Props> = (props) => {
  const { isVoiceEnabled } = useLanguage();
  const [mode, setMode] = useState<'pathway' | 'complaint' | 'questions'>('pathway');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [value, setValue] = useState('');
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState('');
  const questions = useMemo(() => getInterviewQuestions(props.interviewState.complaintKey, props.carePathway), [props.interviewState.complaintKey, props.carePathway]);
  const question = questions[questionIndex];
  const questionText = question?.text[props.selectedLanguage] || question?.text.English || '';
  useQuestionVoice(question ? `${props.interviewState.complaintKey}-${question.id}` : `complaint-${mode}`, questionText, props.selectedLanguage, isVoiceEnabled && mode === 'questions', setNotice);

  useEffect(() => { if (question) { const answer = props.interviewState.answers[question.id]; setValue(Array.isArray(answer) ? answer.join(', ') : String(answer || '')); } }, [question, props.interviewState.answers]);

  const updateAnswer = (answer: string | string[]) => {
    if (!question) return;
    const answers = { ...props.interviewState.answers, [question.id]: answer };
    const risk = evaluateUrgency(props.interviewState.complaintKey, answers);
    props.setInterviewState({ ...props.interviewState, answers, ...risk });
    if (question.id === 'onset' || question.id.endsWith('_onset')) props.setSymptomDuration(String(answer));
    if (question.id === 'severity') props.setSymptomSeverity(Number(answer) >= 8 ? 'Severe' : Number(answer) >= 5 ? 'Moderate' : 'Mild');
    if (question.id === 'site' || question.id.endsWith('_site')) props.setSymptomLocation(String(answer));
    setValue(Array.isArray(answer) ? answer.join(', ') : answer);
  };
  const nextQuestion = () => {
    if (question?.required && !value.trim()) { setNotice(props.selectedLanguage === 'Marathi' ? 'कृपया उत्तर द्या.' : props.selectedLanguage === 'Hindi' ? 'कृपया उत्तर दें।' : 'Please provide an answer.'); return; }
    setNotice(''); if (questionIndex < questions.length - 1) setQuestionIndex((index) => index + 1); else props.onContinue();
  };
  const applyVoiceAnswer = (transcript: string) => {
    if (!question) return;
    const normalized = transcript.trim().toLowerCase();
    if (question.inputType === 'yes_no') {
      const yes = ['yes', 'हो', 'होय', 'हाँ', 'हां'].some((word) => normalized.includes(word));
      const no = ['no', 'नाही', 'नहीं', 'नको'].some((word) => normalized.includes(word));
      if (yes !== no) { updateAnswer(yes ? 'Yes' : 'No'); return; }
    }
    if (question.inputType === 'single_choice' || question.inputType === 'multi_choice') {
      const matches = (question.options || []).filter((option) => normalized.includes(option.toLowerCase()));
      if (matches.length) { updateAnswer(question.inputType === 'multi_choice' ? matches : matches[0]); return; }
    }
    updateAnswer(transcript);
  };
  const captureVoice = () => {
    if (!voiceRecognition.isSupported()) { setNotice('Voice input is unavailable on this device. You can type or tap to continue.'); return; }
    if (listening) { voiceRecognition.stop(); setListening(false); return; }
    setListening(true); setNotice('Listening...');
    voiceRecognition.startListening(props.selectedLanguage, (result) => { if (mode === 'complaint') props.setChiefComplaint(result.transcript); else applyVoiceAnswer(result.transcript); setListening(false); voiceRecognition.stop(); setNotice('Captured. Please confirm or edit your answer.'); }, (error) => { setListening(false); setNotice(getFriendlySpeechError(error).message); });
  };
  const chooseComplaint = (key: string, label: string) => {
    const normalized = key === 'other' ? normalizeComplaint(props.chiefComplaint) : key;
    props.setChiefComplaint(props.chiefComplaint || label);
    props.setInterviewState({ ...props.interviewState, complaintKey: normalized }); setMode('questions'); setQuestionIndex(0); setValue('');
  };
  const renderInput = () => {
    if (!question) return null;
    if (question.inputType === 'yes_no') return <div className="grid grid-cols-2 gap-3">{yesNo.map((option) => <button key={option} type="button" onClick={() => { updateAnswer(option); setTimeout(nextQuestion, 0); }} className={`py-4 rounded-2xl border-2 font-black ${value === option ? 'bg-cyan-600 text-white border-cyan-600' : 'border-slate-200 dark:border-slate-700'}`}>{option}</button>)}</div>;
    if (question.inputType === 'single_choice') return <div className="grid grid-cols-2 gap-3">{question.options?.map((option) => <button key={option} type="button" onClick={() => { updateAnswer(option); setTimeout(nextQuestion, 0); }} className={`p-4 rounded-2xl border-2 text-left font-bold ${value === option ? 'bg-cyan-600 text-white border-cyan-600' : 'border-slate-200 dark:border-slate-700'}`}>{option}</button>)}</div>;
    if (question.inputType === 'multi_choice') {
      const selected = value ? value.split(', ').filter(Boolean) : [];
      return <div className="space-y-3"><div className="grid grid-cols-2 gap-3">{question.options?.map((option) => <button key={option} type="button" onClick={() => updateAnswer(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option])} className={`p-4 rounded-2xl border-2 text-left font-bold ${selected.includes(option) ? 'bg-cyan-600 text-white border-cyan-600' : 'border-slate-200 dark:border-slate-700'}`}>{option}</button>)}</div><button type="button" onClick={nextQuestion} className="w-full py-4 rounded-2xl bg-cyan-600 text-white font-black">Continue <ArrowRight className="inline w-4 h-4" /></button></div>;
    }
    return <div className="space-y-3"><div className="flex gap-2"><input autoFocus type={question.inputType === 'number' ? 'number' : 'text'} min={question.inputType === 'number' ? 0 : undefined} max={question.inputType === 'number' ? 10 : undefined} value={value} onChange={(event) => updateAnswer(event.target.value)} placeholder={question.inputType === 'number' ? '0–10' : 'Type your answer'} className="flex-1 px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" /><button type="button" onClick={captureVoice} className={`px-4 rounded-2xl border ${listening ? 'bg-rose-500 text-white' : 'border-cyan-500 text-cyan-600'}`}><Mic className="w-5 h-5" /></button></div><button type="button" onClick={nextQuestion} className="w-full py-4 rounded-2xl bg-cyan-600 text-white font-black">Continue <ArrowRight className="inline w-4 h-4" /></button></div>;
  };
  return <div className="space-y-6 animate-fadeIn">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4"><div><span className="text-[10px] uppercase font-black tracking-wider text-cyan-600">Step 5 of 10 • Clinical interview</span><h2 className="text-2xl font-black text-slate-900 dark:text-white">{mode === 'pathway' ? 'How would you like to proceed?' : mode === 'complaint' ? 'What brings you here today?' : 'Your health interview'}</h2></div><div className="flex items-center gap-2 text-xs font-bold"><span>{props.carePathway === 'ayurveda' ? '🌿 Ayurveda' : '🩺 Allopathy'}</span>{isVoiceEnabled && <span className="text-cyan-600"><Volume2 className="inline w-4 h-4" /> Voice on</span>}</div></div>
    {mode === 'pathway' && <div className="grid sm:grid-cols-2 gap-4"><button type="button" onClick={() => { props.setCarePathway('allopathy'); setMode('complaint'); }} className="p-7 rounded-3xl border-2 border-cyan-500 bg-cyan-500/10 text-left"><div className="text-4xl mb-4">🩺</div><div className="text-lg font-black">Allopathy / General Medicine</div><div className="text-sm text-slate-500">Modern medical consultation</div></button><button type="button" onClick={() => { props.setCarePathway('ayurveda'); setMode('complaint'); }} className="p-7 rounded-3xl border-2 border-emerald-500 bg-emerald-500/10 text-left"><div className="text-4xl mb-4">🌿</div><div className="text-lg font-black">Ayurveda / AYUSH</div><div className="text-sm text-slate-500">Traditional Ayurvedic consultation</div></button></div>}
    {mode === 'complaint' && <><p className="text-slate-500">Choose the closest option, speak, or type in your own words. We will ask only relevant follow-up questions.</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{COMPLAINT_OPTIONS.map((option) => <button type="button" key={option.key} onClick={() => chooseComplaint(option.key, option.label)} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-left hover:border-cyan-500"><div className="text-2xl">{option.icon}</div><div className="text-xs font-black mt-2">{option.label}</div></button>)}</div><div className="flex gap-2"><input value={props.chiefComplaint} onChange={(event) => props.setChiefComplaint(event.target.value)} placeholder="Describe another problem" className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" /><button type="button" onClick={captureVoice} className="px-4 rounded-2xl border border-cyan-500 text-cyan-600"><Mic className="w-5 h-5" /></button><button type="button" onClick={() => chooseComplaint('other', props.chiefComplaint || 'Other')} className="px-5 rounded-2xl bg-cyan-600 text-white font-black">Start</button></div></>}
    {mode === 'questions' && question && <><div className="flex items-center justify-between text-xs font-bold text-slate-500"><span>{question.category}</span><span>{questionIndex + 1} of {questions.length}</span></div><div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-cyan-500 transition-all" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div><div className="p-6 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-800/70 text-center"><div className="flex justify-center gap-3 mb-5"><button type="button" onClick={() => void speakText(questionText, props.selectedLanguage)} className="p-4 rounded-full bg-cyan-500/10 text-cyan-600" title="Read this question aloud"><Volume2 className="w-6 h-6" /></button><button type="button" onClick={captureVoice} className={`px-5 rounded-2xl border font-bold ${listening ? 'bg-rose-500 text-white border-rose-500' : 'border-cyan-500 text-cyan-600'}`}><Mic className="inline w-5 h-5 mr-2" />{listening ? 'Listening...' : 'Answer by voice'}</button></div><h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{questionText}</h3><div className="mt-8 text-left">{renderInput()}</div></div>{props.interviewState.urgency === 'IMMEDIATE' && <div className="p-5 rounded-3xl border-2 border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300"><div className="font-black text-lg"><ShieldAlert className="inline w-5 h-5 mr-2" />Clinical Safety Alert</div><p className="mt-2 text-sm">Potential clinical red flag detected. Immediate clinical review recommended. Please alert clinical staff. Decision support only — clinician review required.</p><p className="mt-2 text-xs font-bold">Why flagged: {props.interviewState.evidence.join('; ')}</p></div>}</>}
    {notice && <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-sm">{notice}</div>}
    <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800"><button type="button" onClick={props.onBack} className="px-4 py-3 rounded-2xl text-sm font-bold"><ArrowLeft className="inline w-4 h-4" /> Back</button>{mode === 'questions' && <div className="text-xs font-bold text-emerald-600 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> Structured answers are saved as you go</div>}</div>
  </div>;
};
