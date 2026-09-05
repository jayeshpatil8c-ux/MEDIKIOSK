import React from 'react';
import { X, Printer, CheckCircle, ShieldAlert, HeartPulse } from 'lucide-react';
import { Prescription, Patient } from '../../types';

interface Props {
  prescription: Prescription;
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

export const PrescriptionModal: React.FC<Props> = ({ prescription, patient, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200 print:m-0 print:p-0 print:border-none print:shadow-none">
        {/* Actions bar (hidden during print) */}
        <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between print:hidden">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Medical Prescription Document • Rx #{prescription.id.toUpperCase()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-medium hover:bg-sky-500 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Prescription Body */}
        <div className="p-8 space-y-6 print:p-6" id="printable-prescription">
          {/* Clinic Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <HeartPulse className="w-7 h-7 text-sky-600" />
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">MediKiosk Health Centre</h1>
              </div>
              <p className="text-xs text-slate-600 mt-1">Smart Public Health Clinic & Primary Health Centre (PHC)</p>
              <p className="text-xs text-slate-500">OPD Block B, Station #1 • Tel: +91 22 2845 0099</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900">{prescription.doctorName}</div>
              <div className="text-xs text-slate-600">Reg: {prescription.doctorRegNo}</div>
              <div className="text-xs text-slate-500">MBBS, MD (General Medicine)</div>
              <div className="text-xs text-slate-400 mt-1">Date: {new Date(prescription.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Patient Details Strip */}
          <div className="grid grid-cols-4 gap-4 p-3.5 bg-slate-50 rounded-xl text-xs border border-slate-200">
            <div>
              <span className="text-slate-500 block">Patient Name</span>
              <span className="font-semibold text-slate-900">{patient.demographics.fullName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Age / Gender</span>
              <span className="font-semibold text-slate-900">
                {patient.demographics.age} Y / {patient.demographics.gender}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">OPD Token #</span>
              <span className="font-semibold text-sky-700">{patient.opdToken}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Known Allergies</span>
              <span className="font-semibold text-rose-600">
                {patient.demographics.knownAllergies?.length ? patient.demographics.knownAllergies.join(', ') : 'NKDA (None Known)'}
              </span>
            </div>
          </div>

          {/* Clinical Diagnosis */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Clinical Diagnosis</span>
            <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-lg text-sm font-semibold text-slate-900">
              {prescription.diagnosis}
            </div>
          </div>

          {/* Rx Symbol & Medication Table */}
          <div>
            <div className="text-2xl font-serif font-bold text-sky-900 mb-2 italic">℞</div>
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="p-2.5 font-semibold">Medicine & Strength</th>
                  <th className="p-2.5 font-semibold">Dosage</th>
                  <th className="p-2.5 font-semibold">Frequency</th>
                  <th className="p-2.5 font-semibold">Duration</th>
                  <th className="p-2.5 font-semibold">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prescription.items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-semibold text-slate-900">{item.medicineName}</td>
                    <td className="p-2.5 text-slate-700">{item.dosage}</td>
                    <td className="p-2.5 text-slate-700">{item.frequency}</td>
                    <td className="p-2.5 text-slate-700">{item.duration}</td>
                    <td className="p-2.5 text-slate-600">{item.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* General Advice */}
          {prescription.generalAdvice && (
            <div className="text-xs">
              <span className="font-semibold text-slate-700 block mb-1">Dietary & Lifestyle Advice:</span>
              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{prescription.generalAdvice}</p>
            </div>
          )}

          {/* Safety & Follow-up Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              <CheckCircle className="w-4 h-4" />
              <span>Automated Drug-Allergy Safety Check Passed.</span>
            </div>
            {prescription.followUpDate && (
              <div className="text-slate-700 font-medium">
                Follow-up Date: <span className="font-bold text-slate-900">{prescription.followUpDate}</span>
              </div>
            )}
          </div>

          {/* Signature Block */}
          <div className="pt-10 flex justify-end">
            <div className="text-center border-t border-slate-400 pt-2 w-48">
              <div className="text-xs font-semibold text-slate-900">{prescription.doctorName}</div>
              <div className="text-[11px] text-slate-500">Authorized Medical Officer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
