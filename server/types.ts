export type UserRole = 'Doctor' | 'Nurse' | 'AYUSH Vaidya' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export type TriagePriority = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
export type CarePathway = 'allopathy' | 'ayurveda';

export type PatientStatus = 
  | 'Registered'
  | 'Intake Completed'
  | 'In Triage'
  | 'Triage Completed'
  | 'Waiting for Doctor'
  | 'Doctor Review'
  | 'Doctor Approved'
  | 'AYUSH Consultation'
  | 'Prescription Issued'
  | 'Referred'
  | 'Case Closed';

export interface PatientDemographics {
  fullName: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  preferredLanguage: 'English' | 'Hindi' | 'Marathi';
  bloodGroup?: string;
  knownAllergies?: string[];
  existingConditions?: string[];
  currentMedications?: string[];
  abhaId?: string;
  registrationNumber: string;
}

export interface VitalSigns {
  temperatureF: number;
  pulseBpm: number;
  respiratoryRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  spO2Percent: number;
  weightKg: number;
  heightCm: number;
  bmi?: number;
  recordedAt: string;
  recordedBy: string;
}

export interface SymptomRecord {
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  medicalHistory: string[];
  medicationHistory: string[];
  knownAllergies: string[];
  lifestyle: {
    smoking: boolean;
    alcohol: boolean;
    diet: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Other';
    physicalActivity: 'Sedentary' | 'Moderate' | 'Active';
  };
  previousTreatment?: string;
  intakeNotes?: string;
  inputMethod?: 'Text' | 'Voice' | 'Assisted';
  languageUsed?: 'English' | 'Hindi' | 'Marathi';
  recordedAt: string;
  carePathway?: CarePathway;
  structuredHistory?: Record<string, string | string[]>;
  urgency?: 'ROUTINE' | 'PRIORITY' | 'URGENT' | 'IMMEDIATE';
  redFlagEvidence?: string[];
  ayurvedaCase?: AyurvedaCase;
}

export interface AyurvedaCase {
  patientId?: string;
  chiefComplaint: string;
  rogaItihasa: Record<string, string | string[]>;
  nidanaHistory: Record<string, string | string[]>;
  prakriti: { observations: Record<string, string | string[]>; preliminaryPattern: string; completeness: number; status: 'Awaiting practitioner confirmation' };
  vikriti: { observations: Record<string, string | string[]>; preliminaryPattern: string; status: 'Awaiting practitioner confirmation' };
  agni: { observations: Record<string, string | string[]>; preliminaryAssessment: string; status: 'Awaiting practitioner confirmation' };
  amaScreen: Record<string, string | string[]>;
  koshta: Record<string, string | string[]>;
  mala: Record<string, string | string[]>;
  mutra: Record<string, string | string[]>;
  nidra: Record<string, string | string[]>;
  ahara: Record<string, string | string[]>;
  vihara: Record<string, string | string[]>;
  dinacharya: Record<string, string | string[]>;
  ritucharya: Record<string, string | string[]>;
  satmya: Record<string, string | string[]>;
  satva: Record<string, string | string[]>;
  desha: Record<string, string | string[]>;
  kala: Record<string, string | string[]>;
  ashtavidha: Record<string, { value: string; source: 'Patient reported' | 'Practitioner pending' }>;
  dashavidha: Record<string, { value: string; source: 'AI structured' | 'Practitioner pending' }>;
  srotas: string[];
  practitionerObservations: string;
  practitionerAssessment: string;
  safetyFlags: string[];
  documents: string[];
  status: 'Draft' | 'Awaiting practitioner review' | 'Practitioner confirmed';
  createdAt: string;
  updatedAt: string;
}

export interface TriageRecord {
  priority: TriagePriority;
  vitalSigns: VitalSigns;
  nurseNotes: string;
  mobilityStatus: 'Ambulatory' | 'Wheelchair' | 'Stretcher';
  consciousLevel: 'Alert' | 'Verbal' | 'Pain' | 'Unresponsive';
  triageTime: string;
  triagedBy: string;
}

export interface SafetyAlert {
  id: string;
  level: 'INFO' | 'WARNING' | 'URGENT' | 'CRITICAL';
  title: string;
  reason: string;
  detectedValue?: string;
  actionRequired: string;
  timestamp: string;
  acknowledged?: boolean;
}

export interface AIAnalysis {
  chiefComplaintSummary: string;
  keySymptoms: string[];
  relevantHistorySummary: string;
  vitalsInterpretation: string;
  potentialRiskIndicators: string[];
  possibleDifferentialConsiderations: string[];
  suggestedQuestionsForDoctor: string[];
  potentialRedFlags: string[];
  recommendedNextReviewSteps: string[];
  disclaimer: string;
  generatedAt: string;
  modelUsed: string;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  doctorRegNo: string;
  diagnosis: string;
  items: PrescriptionItem[];
  generalAdvice: string;
  followUpDate?: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  referredBy: string;
  referredByRole: UserRole;
  referralReason: string;
  targetDepartment: string;
  suggestedFacility: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  notes: string;
  status: 'Pending' | 'Accepted' | 'Completed';
  createdAt: string;
}

export interface AyushAssessment {
  prakritiType: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha' | 'Tridosha';
  doshaImbalance: string[];
  ayurvedicNotes: string;
  lifestyleGuidance: string[];
  dietaryRecommendations: string[];
  herbalFormulations: string[];
  referralToDoctorRecommended: boolean;
  assessedBy: string;
  assessedAt: string;
}

export interface DoctorReview {
  verified: boolean;
  approved: boolean;
  clinicalNotes: string;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  investigationsRequested?: string[];
  treatmentPlan: string;
  reviewedBy: string;
  reviewedAt: string;
}

export interface PatientVisit {
  id: string;
  visitNumber: string;
  tokenNumber: string;
  date: string;
  department: string;
  doctorName: string;
  chiefComplaint: string;
  status: 'Completed' | 'In Consultation' | 'Cancelled';
  vitals?: VitalSigns;
  clinicalNotes?: string;
  diagnosis?: string;
  prescription?: Prescription;
  followUpDate?: string;
}

export interface Patient {
  id: string;
  opdToken: string;
  status: PatientStatus;
  demographics: PatientDemographics;
  symptoms?: SymptomRecord;
  triage?: TriageRecord;
  aiAnalysis?: AIAnalysis;
  safetyAlerts: SafetyAlert[];
  doctorReview?: DoctorReview;
  ayushAssessment?: AyushAssessment;
  prescription?: Prescription;
  referral?: Referral;
  visits?: PatientVisit[];
  consent?: any;
  documents?: any[];
  createdAt: string;
  updatedAt: string;
  carePathway?: CarePathway;
}

export interface OPDToken {
  id: string;
  tokenNumber: string;
  patientId: string;
  patientName: string;
  department: string;
  priority: TriagePriority;
  status: 'Waiting' | 'In Triage' | 'Waiting for Doctor' | 'In Consultation' | 'Completed';
  assignedDoctor?: string;
  issueTime: string;
  estimatedWaitMinutes: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  department: string;
  doctorName: string;
  date: string;
  timeSlot: string;
  status: 'Scheduled' | 'Checked In' | 'In Consultation' | 'Completed' | 'Cancelled' | 'No Show';
  reason: string;
  tokenNumber?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  entity: string;
  entityId: string;
  changedFields?: string[];
  previousValue?: string;
  newValue?: string;
  details?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  read: boolean;
  link?: string;
  patientId?: string;
}
