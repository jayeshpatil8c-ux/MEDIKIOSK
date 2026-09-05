import { VitalSigns, SafetyAlert, PrescriptionItem } from './types.js';

export function runClinicalSafetyChecks(
  vitals?: VitalSigns,
  knownAllergies: string[] = [],
  prescriptionItems: PrescriptionItem[] = [],
  symptoms: string[] = [],
  patientAge: number = 30
): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];
  const now = new Date().toISOString();

  // 1. Critical Vital Signs Checks
  if (vitals) {
    if (vitals.spO2Percent > 0 && vitals.spO2Percent < 90) {
      alerts.push({
        id: `alert-spo2-${Date.now()}`,
        level: 'CRITICAL',
        title: 'Severe Hypoxemia Detected',
        reason: 'Oxygen saturation (SpO2) is dangerously low. Risk of acute respiratory failure.',
        detectedValue: `${vitals.spO2Percent}% SpO2 (Normal: 95-100%)`,
        actionRequired: 'Immediate supplemental oxygen therapy and rapid physician bedside review required.',
        timestamp: now,
      });
    } else if (vitals.spO2Percent >= 90 && vitals.spO2Percent <= 93) {
      alerts.push({
        id: `alert-spo2-warn-${Date.now()}`,
        level: 'URGENT',
        title: 'Moderate Hypoxia Alert',
        reason: 'Oxygen saturation is below clinical target threshold.',
        detectedValue: `${vitals.spO2Percent}% SpO2`,
        actionRequired: 'Monitor SpO2 continuously; evaluate for airway patency and respiratory distress.',
        timestamp: now,
      });
    }

    if (vitals.bloodPressureSystolic >= 180 || vitals.bloodPressureDiastolic >= 110) {
      alerts.push({
        id: `alert-bp-crit-${Date.now()}`,
        level: 'CRITICAL',
        title: 'Hypertensive Emergency Risk',
        reason: 'Blood pressure reaches hypertensive urgency/emergency thresholds with target organ risk.',
        detectedValue: `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg (Threshold: ≥180/110)`,
        actionRequired: 'Prompt medical evaluation, repeat BP check in quiet setting, assess for neurological or chest symptoms.',
        timestamp: now,
      });
    } else if (vitals.bloodPressureSystolic > 0 && vitals.bloodPressureSystolic < 90) {
      alerts.push({
        id: `alert-bp-hypo-${Date.now()}`,
        level: 'CRITICAL',
        title: 'Hypotension / Shock Warning',
        reason: 'Systolic blood pressure is severely low. Hypoperfusion risk.',
        detectedValue: `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg`,
        actionRequired: 'Evaluate for dehydration, sepsis, or bleeding. Place patient supine and notify medical team.',
        timestamp: now,
      });
    }

    if (vitals.pulseBpm > 130) {
      alerts.push({
        id: `alert-hr-high-${Date.now()}`,
        level: 'URGENT',
        title: 'Marked Tachycardia',
        reason: 'Heart rate significantly elevated above resting safe margins.',
        detectedValue: `${vitals.pulseBpm} BPM (Normal: 60-100 BPM)`,
        actionRequired: 'Perform 12-lead ECG, assess hydration, fever, pain, and arrhythmia signs.',
        timestamp: now,
      });
    } else if (vitals.pulseBpm > 0 && vitals.pulseBpm < 48) {
      alerts.push({
        id: `alert-hr-low-${Date.now()}`,
        level: 'URGENT',
        title: 'Significant Bradycardia',
        reason: 'Heart rate below safe minimum threshold.',
        detectedValue: `${vitals.pulseBpm} BPM`,
        actionRequired: 'Assess perfusion, check medication list (e.g. beta-blockers), alert doctor immediately.',
        timestamp: now,
      });
    }

    if (vitals.temperatureF >= 103.5) {
      alerts.push({
        id: `alert-temp-crit-${Date.now()}`,
        level: 'URGENT',
        title: 'Severe Hyperpyrexia',
        reason: 'Body temperature severely elevated with febrile seizure / delirium risk.',
        detectedValue: `${vitals.temperatureF}°F`,
        actionRequired: 'Physical antipyresis, hydration, immediate antipyretic review by clinician.',
        timestamp: now,
      });
    }

    if (vitals.respiratoryRate >= 28) {
      alerts.push({
        id: `alert-rr-high-${Date.now()}`,
        level: 'URGENT',
        title: 'Tachypnea / Respiratory Distress Indicator',
        reason: 'Elevated respiratory rate suggests compensatory respiratory drive or metabolic acidosis.',
        detectedValue: `${vitals.respiratoryRate} breaths/min (Normal: 12-20)`,
        actionRequired: 'Auscultate chest, assess work of breathing and accessory muscle use.',
        timestamp: now,
      });
    }
  }

  // 2. Drug-Allergy Conflict Detection
  const normalizedAllergies = knownAllergies.map(a => a.toLowerCase().trim());
  for (const item of prescriptionItems) {
    const medLower = item.medicineName.toLowerCase();
    
    // Penicillin cross-reactivity check
    const isPenicillinMed = ['amoxicillin', 'ampicillin', 'augmentin', 'penicillin', 'piperacillin', 'clavulanate'].some(p => medLower.includes(p));
    const hasPenicillinAllergy = normalizedAllergies.some(a => a.includes('penicillin') || a.includes('amox') || a.includes('beta-lactam'));

    if (isPenicillinMed && hasPenicillinAllergy) {
      alerts.push({
        id: `alert-allergy-pen-${Date.now()}-${item.id}`,
        level: 'CRITICAL',
        title: 'Drug-Allergy Conflict: Penicillin Class',
        reason: `Prescribed medicine "${item.medicineName}" conflicts with patient's documented penicillin allergy. Risk of anaphylaxis!`,
        detectedValue: `Allergy: ${knownAllergies.join(', ')} | Prescribed: ${item.medicineName}`,
        actionRequired: 'DO NOT DISPENSE. Clinician must select an alternative non-cross-reacting antibiotic class (e.g., Macrolide or Fluoroquinolone).',
        timestamp: now,
      });
    }

    // NSAID / Sulfa checks
    const isNsaid = ['ibuprofen', 'diclofenac', 'naproxen', 'aspirin', 'aceclofenac', 'ketorolac'].some(n => medLower.includes(n));
    const hasNsaidAllergy = normalizedAllergies.some(a => a.includes('nsaid') || a.includes('aspirin') || a.includes('ibuprofen'));
    if (isNsaid && hasNsaidAllergy) {
      alerts.push({
        id: `alert-allergy-nsaid-${Date.now()}-${item.id}`,
        level: 'CRITICAL',
        title: 'Drug-Allergy Conflict: NSAID Class',
        reason: `Prescribed medicine "${item.medicineName}" is an NSAID which contradicts patient's allergy profile.`,
        detectedValue: `Prescribed: ${item.medicineName}`,
        actionRequired: 'Change analgesic to safe alternative (e.g. Paracetamol) after physician confirmation.',
        timestamp: now,
      });
    }

    // Pediatric Aspirin caution (Reye's Syndrome)
    if (patientAge < 16 && medLower.includes('aspirin')) {
      alerts.push({
        id: `alert-pediatric-aspirin-${Date.now()}`,
        level: 'CRITICAL',
        title: 'Pediatric Safety Warning: Aspirin Contraindicated',
        reason: 'Aspirin is contraindicated in pediatric patients with febrile viral illnesses due to risk of Reye Syndrome.',
        detectedValue: `Patient age: ${patientAge} years`,
        actionRequired: 'Physician override or medication replacement required immediately.',
        timestamp: now,
      });
    }
  }

  // 3. Clinical Red Flag Symptom Combinations
  const symptomText = symptoms.join(' ').toLowerCase();
  if (
    (symptomText.includes('chest pain') || symptomText.includes('heaviness')) &&
    (symptomText.includes('breath') || symptomText.includes('sweat') || symptomText.includes('arm'))
  ) {
    alerts.push({
      id: `alert-cardiac-${Date.now()}`,
      level: 'CRITICAL',
      title: 'Acute Coronary Syndrome (ACS) Red Flag',
      reason: 'Symptom constellation of chest discomfort with radiating pain or diaphoresis requires immediate triage escalation.',
      detectedValue: 'Chest pain + associated autonomic symptoms',
      actionRequired: 'Immediate STAT 12-lead ECG, troponin, sublingual nitrate readiness, emergency physician review.',
      timestamp: now,
    });
  }

  if (symptomText.includes('fever') && (symptomText.includes('stiff neck') || symptomText.includes('photophobia') || symptomText.includes('altered'))) {
    alerts.push({
      id: `alert-meningitis-${Date.now()}`,
      level: 'CRITICAL',
      title: 'Meningeal Irritation Indicator',
      reason: 'Fever accompanied by nuchal rigidity or altered mental status indicates potential central nervous system infection.',
      detectedValue: 'Fever + Neurological/Nuchal signs',
      actionRequired: 'Urgent lumbar puncture evaluation and isolation precautions.',
      timestamp: now,
    });
  }

  // 4. Missing Information Safety Check
  if (knownAllergies.length === 0) {
    alerts.push({
      id: `alert-no-allergies-${Date.now()}`,
      level: 'INFO',
      title: 'Allergy Status Unconfirmed',
      reason: 'No drug or food allergies have been explicitly confirmed in the patient intake record.',
      actionRequired: 'Verify allergy history with the patient or family prior to prescribing.',
      timestamp: now,
    });
  }

  return alerts;
}
