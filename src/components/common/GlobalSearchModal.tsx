import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, ArrowRight, Activity, Clock, ShieldAlert } from 'lucide-react';
import { usePatients } from '../../context/PatientContext';
import { Patient } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patient: Patient, targetTab?: string) => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ isOpen, onClose, onSelectPatient }) => {
  const { patients } = usePatients();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = patients.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      p.demographics.fullName.toLowerCase().includes(q) ||
      p.opdToken.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.demographics.phone.includes(q) ||
      p.demographics.registrationNumber.toLowerCase().includes(q) ||
      (p.demographics.abhaId && p.demographics.abhaId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-sky-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search patient by name, OPD token (e.g. T-101), phone, ABHA ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No patients found matching "{query}"
            </div>
          ) : (
            filtered.map((patient) => {
              const priority = patient.triage?.priority || 'GREEN';
              const priorityColors: Record<string, string> = {
                GREEN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                YELLOW: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                ORANGE: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
                RED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
              };

              return (
                <div
                  key={patient.id}
                  onClick={() => {
                    onSelectPatient(patient, 'profile');
                    onClose();
                  }}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm">
                      {patient.demographics.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {patient.demographics.fullName}
                        </span>
                        <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-md">
                          {patient.opdToken}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColors[priority] || priorityColors.GREEN}`}>
                          {priority}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3">
                        <span>{patient.demographics.age} Y • {patient.demographics.gender}</span>
                        <span>Ph: {patient.demographics.phone}</span>
                        {patient.demographics.abhaId && <span>ABHA: {patient.demographics.abhaId}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">Open Case</span>
                    <ArrowRight className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Press ESC to exit</span>
          <span>Showing {filtered.length} matched records</span>
        </div>
      </div>
    </div>
  );
};
