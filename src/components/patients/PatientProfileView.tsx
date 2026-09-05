import React, { useState } from 'react';
import {
  User,
  Activity,
  FileText,
  ShieldAlert,
  Edit,
  ArrowLeft,
  Calendar,
  Phone,
  Heart,
  Stethoscope,
  Share2,
  CheckCircle2,
  Clock,
  Printer,
} from 'lucide-react';
import { Patient, Prescription } from '../../types';
import { EditDemographicsModal } from '../common/EditDemographicsModal';
import { PrescriptionModal } from '../common/PrescriptionModal';
import { usePatients } from '../../context/PatientContext';

interface Props {
  patient: Patient;
  onBack: () => void;
  onNavigateTab: (tab: string) => void;
}

export const PatientProfileView: React.FC<Props> = ({ patient, onBack, onNavigateTab }) => {
  const { auditLogs } = usePatients();
  const [isEditingDemographics, setIsEditingDemographics] = useState(false);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  const patientAudit = auditLogs.filter((log) => log.patientId === patient.id);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </button>

        <button
          onClick={() => setIsEditingDemographics(true)}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit Patient Details
        </button>
      </div>

      {/* Main Patient Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black text-2xl shadow-sm">
              {patient.demographics.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {patient.demographics.fullName}
                </h1>
                <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
                  {patient.opdToken}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {patient.demographics.age} Years • {patient.demographics.gender} • Blood Group: <strong className="text-slate-800 dark:text-slate-200">{patient.demographics.bloodGroup || 'Not set'}</strong>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Reg: {patient.demographics.registrationNumber} • ABHA ID: {patient.demographics.abhaId || 'Unlinked'}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              Status: {patient.status}
            </span>
            <span className="text-[11px] text-slate-400">
              Registered: {new Date(patient.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Allergy Warning if applicable */}
        {patient.demographics.knownAllergies?.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-300 font-bold">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>
              DOCUMENTED ADVERSE ALLERGIES: {patient.demographics.knownAllergies.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Grid: Demographics + Health Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Demographics */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <User className="w-4 h-4 text-sky-500" />
            Contact & Address Details
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Phone:</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{patient.demographics.phone}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Email:</span>
              <span className="font-medium text-slate-900 dark:text-white">{patient.demographics.email || 'None'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Address:</span>
              <span className="font-medium text-slate-900 dark:text-white text-right max-w-xs">{patient.demographics.address || 'Rural PHC Jurisdiction'}</span>
            </div>
            {patient.demographics.emergencyContact && (
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Emergency Contact:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {patient.demographics.emergencyContact.name} ({patient.demographics.emergencyContact.relationship}) • {patient.demographics.emergencyContact.phone}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chronic Conditions & Current Meds */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500" />
            Baseline Health Profile
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px] mb-1">Existing Chronic Conditions:</span>
              <div className="flex flex-wrap gap-1.5">
                {patient.demographics.existingConditions?.length > 0 ? (
                  patient.demographics.existingConditions.map((c, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">No chronic illnesses recorded</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] mb-1">Routine Current Medications:</span>
              <div className="flex flex-wrap gap-1.5">
                {patient.demographics.currentMedications?.length > 0 ? (
                  patient.demographics.currentMedications.map((m, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-mono">
                      {m}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">None reported</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Triage & Vitals Snapshot */}
      {patient.triage && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-500" />
              Triage Assessment & Physiological Vitals
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Priority: {patient.triage.priority}
            </span>
          </div>

          {patient.triage.vitalSigns && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 block">SpO2</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{patient.triage.vitalSigns.spO2Percent}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 block">BP</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {patient.triage.vitalSigns.bloodPressureSystolic}/{patient.triage.vitalSigns.bloodPressureDiastolic}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 block">Pulse</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{patient.triage.vitalSigns.pulseBpm} bpm</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 block">Temperature</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{patient.triage.vitalSigns.temperatureF}°F</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 block">Resp. Rate</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{patient.triage.vitalSigns.respiratoryRate}/min</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 block">Weight</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{patient.triage.vitalSigns.weightKg} kg</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 block">BMI</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{patient.triage.vitalSigns.bmi || '22.0'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Patient Specific Audit Events */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-sky-500" />
          Patient Case Audit Trail ({patientAudit.length} Events)
        </h2>

        <div className="space-y-2 text-xs">
          {patientAudit.map((log) => (
            <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-sky-600 mr-2">{log.action}</span>
                <span className="text-slate-600 dark:text-slate-300">by {log.userName} ({log.userRole})</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Demographics Modal */}
      <EditDemographicsModal
        patient={patient}
        isOpen={isEditingDemographics}
        onClose={() => setIsEditingDemographics(false)}
      />
    </div>
  );
};
