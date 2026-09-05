import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Filter,
  Eye,
  Edit,
  Activity,
  Stethoscope,
  ClipboardList,
  AlertOctagon,
  ShieldAlert,
  ArrowUpDown,
  User,
} from 'lucide-react';
import { Patient, TriagePriority, PatientStatus } from '../../types';
import { usePatients } from '../../context/PatientContext';
import { EditDemographicsModal } from '../common/EditDemographicsModal';

interface Props {
  onSelectPatient: (patient: Patient, tab?: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const PatientListView: React.FC<Props> = ({ onSelectPatient, onNavigateTab }) => {
  const { patients } = usePatients();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const filtered = patients.filter((p) => {
    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        p.demographics.fullName.toLowerCase().includes(q) ||
        p.opdToken.toLowerCase().includes(q) ||
        p.demographics.phone.includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.demographics.abhaId && p.demographics.abhaId.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Status filter
    if (statusFilter !== 'ALL' && p.status !== statusFilter) {
      return false;
    }

    // Priority filter
    if (priorityFilter !== 'ALL' && p.triage?.priority !== priorityFilter) {
      return false;
    }

    return true;
  });

  const priorityColors: Record<TriagePriority, string> = {
    GREEN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
    YELLOW: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
    ORANGE: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300',
    RED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 animate-pulse',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Patient Registry & Clinical Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total {patients.length} registered patient records in active clinic database
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('registration')}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Register New Patient
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, OPD token (e.g. T-101), phone, ABHA ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Status filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Clinical Statuses</option>
              <option value="Registered">Registered</option>
              <option value="Intake Completed">Intake Completed</option>
              <option value="In Triage">In Triage</option>
              <option value="Waiting for Doctor">Waiting for Doctor</option>
              <option value="Doctor Review">Doctor Review</option>
              <option value="Doctor Approved">Doctor Approved</option>
              <option value="AYUSH Consultation">AYUSH Consultation</option>
              <option value="Prescription Issued">Prescription Issued</option>
              <option value="Case Closed">Case Closed</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="md:col-span-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Triage Priorities</option>
              <option value="RED">RED (Immediate / Emergency)</option>
              <option value="ORANGE">ORANGE (Very Urgent)</option>
              <option value="YELLOW">YELLOW (Urgent)</option>
              <option value="GREEN">GREEN (Standard)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">Token & Patient</th>
                <th className="py-3 px-4">Contact & ABHA</th>
                <th className="py-3 px-4">Triage Priority</th>
                <th className="py-3 px-4">Chief Complaint</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No patient records match the selected query.
                  </td>
                </tr>
              ) : (
                filtered.map((patient) => {
                  const priority = patient.triage?.priority || 'GREEN';

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Token & Patient Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/40">
                            {patient.opdToken}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {patient.demographics.fullName}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {patient.demographics.age} Y • {patient.demographics.gender} • Reg: {patient.demographics.registrationNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact & ABHA */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {patient.demographics.phone}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {patient.demographics.abhaId ? `ABHA: ${patient.demographics.abhaId}` : 'No ABHA linked'}
                        </div>
                      </td>

                      {/* Triage Priority */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                            priorityColors[priority]
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {priority}
                        </span>
                        {patient.safetyAlerts.length > 0 && (
                          <span className="block text-[10px] font-semibold text-rose-600 dark:text-rose-400 mt-1">
                            {patient.safetyAlerts.length} Safety Alert{patient.safetyAlerts.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </td>

                      {/* Chief Complaint */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate font-medium text-slate-900 dark:text-white">
                          {patient.symptoms?.chiefComplaint || 'Pending Intake'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {patient.symptoms?.symptoms?.slice(0, 3).join(', ') || 'No symptoms recorded'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {patient.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onSelectPatient(patient, 'profile')}
                            title="View Full Profile"
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setEditingPatient(patient)}
                            title="Edit Patient Details"
                            className="p-1.5 rounded-lg text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onSelectPatient(patient, 'triage')}
                            title="Triage & Vitals"
                            className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                          >
                            <Activity className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onSelectPatient(patient, 'doctor')}
                            title="Doctor Station"
                            className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          >
                            <Stethoscope className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demographic Editing Modal */}
      {editingPatient && (
        <EditDemographicsModal
          patient={editingPatient}
          isOpen={Boolean(editingPatient)}
          onClose={() => setEditingPatient(null)}
        />
      )}
    </div>
  );
};
