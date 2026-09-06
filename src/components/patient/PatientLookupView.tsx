import React, { useState } from 'react';
import {
  Search,
  User,
  Phone,
  CreditCard,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import { usePatients } from '../../context/PatientContext';
import { Patient } from '../../types';

interface Props {
  onSelectExistingPatient: (patient: Patient, isSameProblem: boolean) => void;
  onBackToNewRegistration: () => void;
}

export const PatientLookupView: React.FC<Props> = ({
  onSelectExistingPatient,
  onBackToNewRegistration,
}) => {
  const { patients, opdTokens } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [visitTypeChosen, setVisitTypeChosen] = useState<'same' | 'new' | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const term = searchTerm.trim().toLowerCase();
    const matched = patients.find(
      (p) =>
        p.demographics.phone.includes(term) ||
        p.demographics.fullName.toLowerCase().includes(term) ||
        p.demographics.abhaId?.toLowerCase().includes(term) ||
        p.opdToken?.toLowerCase() === term
    );

    setFoundPatient(matched || null);
    setHasSearched(true);
    setVisitTypeChosen(null);
  };

  const handleConfirm = () => {
    if (foundPatient && visitTypeChosen) {
      onSelectExistingPatient(foundPatient, visitTypeChosen === 'same');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
            Existing Patient Check-In
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            Find Your Hospital Record
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enter your mobile number, ABHA ID, or Token number to retrieve your existing file.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHasSearched(false);
              }}
              placeholder="e.g. 9876543210 or ABHA ID or Rajesh"
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Quick test records:</span>
            {patients.slice(0, 3).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSearchTerm(p.demographics.phone);
                  setFoundPatient(p);
                  setHasSearched(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-600 border border-slate-200 dark:border-slate-700 text-[11px]"
              >
                {p.demographics.fullName} ({p.demographics.phone})
              </button>
            ))}
          </div>
        </form>

        {/* Results Section */}
        {hasSearched && (
          <div className="pt-2">
            {foundPatient ? (
              <div className="space-y-4 border border-sky-500/30 rounded-2xl p-5 bg-sky-50/40 dark:bg-sky-950/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-lg">
                      {foundPatient.demographics.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {foundPatient.demographics.fullName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{foundPatient.demographics.age} yrs, {foundPatient.demographics.gender}</span>
                        <span>•</span>
                        <span>{foundPatient.demographics.phone}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified File
                  </span>
                </div>

                {/* Previous History Brief */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Last Chief Complaint</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {foundPatient.symptoms?.chiefComplaint || 'Routine Medical Visit'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Recent Token</span>
                    <span className="font-medium text-sky-600 dark:text-sky-400 font-mono">
                      {foundPatient.opdToken || 'OPD-GENERAL'}
                    </span>
                  </div>
                </div>

                {/* Question: Is this visit for same or new problem? */}
                <div className="pt-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Reason for Today's Visit:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVisitTypeChosen('same')}
                      className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center text-center gap-1.5 transition-all ${
                        visitTypeChosen === 'same'
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/30'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4 text-sky-500" />
                      <span>Follow-up / Same Complaint</span>
                      <span className="text-[10px] text-slate-400">Review previous prescription & symptoms</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisitTypeChosen('new')}
                      className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center text-center gap-1.5 transition-all ${
                        visitTypeChosen === 'new'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <span>New Health Complaint</span>
                      <span className="text-[10px] text-slate-400">Describe new symptoms or concerns</span>
                    </button>
                  </div>
                </div>

                {/* Continue button */}
                <div className="pt-3">
                  <button
                    disabled={!visitTypeChosen}
                    onClick={handleConfirm}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      visitTypeChosen
                        ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/25'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Proceed to Assessment with Saved Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    No matching patient record found
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    We couldn't find an existing file matching "{searchTerm}".
                  </p>
                </div>
                <button
                  onClick={onBackToNewRegistration}
                  className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold"
                >
                  Start New Patient Registration
                </button>
              </div>
            )}
          </div>
        )}

        {/* Back navigation */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToNewRegistration}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            ← Register as a New Patient Instead
          </button>
        </div>
      </div>
    </div>
  );
};
