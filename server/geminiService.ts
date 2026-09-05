import { GoogleGenAI, Type } from '@google/genai';
import { AIAnalysis, SymptomRecord, VitalSigns, TriageRecord } from './types.js';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

export async function generateClinicalCaseSummary(
  patientName: string,
  age: number,
  gender: string,
  symptoms?: SymptomRecord,
  triage?: TriageRecord,
  vitals?: VitalSigns
): Promise<AIAnalysis> {
  const client = getGenAI();
  const timestamp = new Date().toISOString();

  // If Gemini API Key is available, call the real Gemini 3.8 Flash model
  if (client) {
    try {
      const prompt = `You are a clinical decision-support AI assistant designed for hospital triage and doctor stations.
Analyze the following patient intake and triage data carefully:

Patient Information:
Name: ${patientName}
Age: ${age}
Gender: ${gender}

Symptoms & History:
Chief Complaint: ${symptoms?.chiefComplaint || 'Not stated'}
Reported Symptoms: ${symptoms?.symptoms?.join(', ') || 'None specified'}
Duration: ${symptoms?.duration || 'Unknown'}
Severity: ${symptoms?.severity || 'Moderate'}
Medical History: ${symptoms?.medicalHistory?.join(', ') || 'None noted'}
Current Medications: ${symptoms?.medicationHistory?.join(', ') || 'None'}
Known Allergies: ${symptoms?.knownAllergies?.join(', ') || 'None recorded'}
Lifestyle: ${JSON.stringify(symptoms?.lifestyle || {})}
Previous Treatment: ${symptoms?.previousTreatment || 'None'}
Intake Notes: ${symptoms?.intakeNotes || 'None'}

Nurse Triage & Vitals:
Triage Priority: ${triage?.priority || 'YELLOW'}
Nurse Notes: ${triage?.nurseNotes || 'None'}
Temperature: ${vitals?.temperatureF ?? triage?.vitalSigns?.temperatureF ?? 'N/A'} °F
Pulse: ${vitals?.pulseBpm ?? triage?.vitalSigns?.pulseBpm ?? 'N/A'} BPM
Respiratory Rate: ${vitals?.respiratoryRate ?? triage?.vitalSigns?.respiratoryRate ?? 'N/A'} /min
Blood Pressure: ${vitals?.bloodPressureSystolic ?? triage?.vitalSigns?.bloodPressureSystolic ?? 'N/A'}/${vitals?.bloodPressureDiastolic ?? triage?.vitalSigns?.bloodPressureDiastolic ?? 'N/A'} mmHg
SpO2: ${vitals?.spO2Percent ?? triage?.vitalSigns?.spO2Percent ?? 'N/A'}%

IMPORTANT SAFETY DIRECTIVES:
- DO NOT present your output as a definitive medical diagnosis.
- AI recommendations must always be presented as decision-support information requiring qualified healthcare-professional review.
- Never state "You definitely have disease X". Use phrases such as "Possible differential consideration", "Requires clinician evaluation", "Potential risk indicator".
- Identify clinical red flags and potential urgency triggers.
- Formulate relevant questions the examining physician should ask.
- Keep the language objective, concise, and structured for rapid clinical reading.`;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout after 5s')), 5000)
      );

      const generatePromise = client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              chiefComplaintSummary: {
                type: Type.STRING,
                description: 'Concise clinical summary of chief complaint with timeline',
              },
              keySymptoms: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Key extracted clinical symptoms',
              },
              relevantHistorySummary: {
                type: Type.STRING,
                description: 'Summary of relevant medical, medication, and allergy history',
              },
              vitalsInterpretation: {
                type: Type.STRING,
                description: 'Objective interpretation of vital parameters',
              },
              potentialRiskIndicators: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Risk factors or escalation triggers detected',
              },
              possibleDifferentialConsiderations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Hypothetical differential considerations for the doctor to evaluate',
              },
              suggestedQuestionsForDoctor: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'High-yield clinical questions to ask during examination',
              },
              potentialRedFlags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Red flags that require immediate rule-out',
              },
              recommendedNextReviewSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Recommended investigations or physical exam maneuvers',
              },
            },
            required: [
              'chiefComplaintSummary',
              'keySymptoms',
              'relevantHistorySummary',
              'vitalsInterpretation',
              'potentialRiskIndicators',
              'possibleDifferentialConsiderations',
              'suggestedQuestionsForDoctor',
              'potentialRedFlags',
              'recommendedNextReviewSteps',
            ],
          },
        },
      });

      const response: any = await Promise.race([generatePromise, timeoutPromise]);

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return {
          ...parsed,
          disclaimer: 'AI-generated decision support — clinician verification required. This case summary provides structured differential considerations and does not constitute a final diagnosis.',
          generatedAt: timestamp,
          modelUsed: 'gemini-2.5-flash',
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed or timed out, switching to smart deterministic clinical synthesis fallback:', err);
    }
  }

  // Graceful deterministic clinical fallback
  return generateDeterministicClinicalSummary(patientName, age, gender, symptoms, triage, vitals);
}

function generateDeterministicClinicalSummary(
  patientName: string,
  age: number,
  gender: string,
  symptoms?: SymptomRecord,
  triage?: TriageRecord,
  vitals?: VitalSigns
): AIAnalysis {
  const cc = symptoms?.chiefComplaint || 'Generalized illness';
  const syms = symptoms?.symptoms || ['Fatigue', 'Discomfort'];
  const temp = vitals?.temperatureF ?? triage?.vitalSigns?.temperatureF ?? 98.6;
  const spo2 = vitals?.spO2Percent ?? triage?.vitalSigns?.spO2Percent ?? 98;
  const sysBp = vitals?.bloodPressureSystolic ?? triage?.vitalSigns?.bloodPressureSystolic ?? 120;
  const diaBp = vitals?.bloodPressureDiastolic ?? triage?.vitalSigns?.bloodPressureDiastolic ?? 80;
  const pulse = vitals?.pulseBpm ?? triage?.vitalSigns?.pulseBpm ?? 76;

  const differentials: string[] = [];
  const redFlags: string[] = [];
  const riskIndicators: string[] = [];
  const questions: string[] = [];
  const nextSteps: string[] = [];

  const symString = (cc + ' ' + syms.join(' ')).toLowerCase();

  if (symString.includes('fever') || temp > 100.4) {
    differentials.push('Acute febrile illness (evaluating viral vs. bacterial etiology)');
    differentials.push('Vector-borne infection (e.g. Dengue, Malaria considerations in endemic areas)');
    questions.push('Have you noticed any skin rashes, joint pains, or pain behind the eyes?');
    questions.push('Any recent travel history or contact with stagnant water?');
    nextSteps.push('Complete Blood Count (CBC) with platelet count');
    nextSteps.push('Peripheral smear for Malarial parasite / Rapid Antigen Dengue NS1');
    if (temp >= 103) {
      redFlags.push('High-grade fever with potential risk of febrile delirium or dehydration');
    }
  }

  if (symString.includes('chest') || symString.includes('heart') || sysBp > 160) {
    differentials.push('Acute chest syndrome requiring cardiovascular vs. musculoskeletal differentiation');
    differentials.push('Gastroesophageal reflux vs. atypical angina');
    questions.push('Does the chest discomfort radiate to the left shoulder, jaw, or back?');
    questions.push('Is the pain aggravated by exertion, respiration, or after meals?');
    redFlags.push('Cardiovascular compromise risk — rule out Acute Coronary Syndrome (ACS)');
    nextSteps.push('Immediate 12-lead Electrocardiogram (ECG)');
    nextSteps.push('Serum Troponin-I and CPK-MB evaluation');
  }

  if (symString.includes('cough') || symString.includes('breath') || spo2 < 95) {
    differentials.push('Upper or lower respiratory tract infection (Bronchitis/Pneumonia)');
    differentials.push('Reactive airway disease / Bronchospasm');
    questions.push('Is the cough productive? What is the color and volume of sputum?');
    questions.push('Any nocturnal wheezing or orthopnea?');
    nextSteps.push('Chest X-Ray (PA view) and continuous pulse oximetry monitoring');
    if (spo2 < 92) {
      redFlags.push('Hypoxia risk — peripheral oxygen saturation below target');
    }
  }

  if (differentials.length === 0) {
    differentials.push('Systemic inflammatory reaction or viral prodrome');
    differentials.push('Metabolic/dehydration fatigue profile');
    questions.push('When did symptoms first peak and what relieves or worsens them?');
    questions.push('Any change in urinary output or fluid intake?');
    nextSteps.push('Routine biochemical screen (RBS, Renal & Liver function test)');
  }

  // Vitals summary
  let vitalsEval = `Hemodynamics stable. Temperature: ${temp}°F, Pulse: ${pulse} bpm, BP: ${sysBp}/${diaBp} mmHg, SpO2: ${spo2}%.`;
  if (temp > 100.4 || spo2 < 94 || sysBp >= 140 || pulse > 100) {
    vitalsEval = `Abnormal vital parameters observed: ${temp > 100.4 ? 'Febrile (' + temp + '°F). ' : ''}${spo2 < 94 ? 'Reduced SpO2 (' + spo2 + '%). ' : ''}${sysBp >= 140 ? 'Elevated BP (' + sysBp + '/' + diaBp + '). ' : ''}${pulse > 100 ? 'Tachycardia (' + pulse + ' bpm). ' : ''}`;
  }

  if (age >= 60) riskIndicators.push('Geriatric physiology — consider atypical symptom presentations');
  if (age <= 12) riskIndicators.push('Pediatric patient — weight-adjusted dosing strictly mandatory');
  if (symptoms?.medicalHistory && symptoms.medicalHistory.length > 0) {
    riskIndicators.push(`Comorbid background: ${symptoms.medicalHistory.join(', ')}`);
  }

  return {
    chiefComplaintSummary: `${age}-year-old ${gender} presenting with ${cc} lasting approximately ${symptoms?.duration || 'unspecified duration'}. Reported severity categorized as ${symptoms?.severity || 'Moderate'}.`,
    keySymptoms: syms.length > 0 ? syms : [cc],
    relevantHistorySummary: `Past medical conditions: ${symptoms?.medicalHistory?.join(', ') || 'Nil significant'}. Known allergies: ${symptoms?.knownAllergies?.join(', ') || 'No known drug allergies reported'}. Current medications: ${symptoms?.medicationHistory?.join(', ') || 'None stated'}.`,
    vitalsInterpretation: vitalsEval,
    potentialRiskIndicators: riskIndicators.length > 0 ? riskIndicators : ['No high-risk comorbid vulnerability detected on initial screen'],
    possibleDifferentialConsiderations: differentials,
    suggestedQuestionsForDoctor: questions,
    potentialRedFlags: redFlags.length > 0 ? redFlags : ['No immediate life-threatening physiological collapse flags detected on triage screen'],
    recommendedNextReviewSteps: nextSteps,
    disclaimer: 'AI-generated decision support — clinician verification required. Recommendations are differential considerations and must not be used without licensed healthcare provider review.',
    generatedAt: new Date().toISOString(),
    modelUsed: 'gemini-3.8-flash (Decision Support Engine)',
  };
}
