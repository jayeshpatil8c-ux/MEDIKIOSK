import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Download,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  User,
  FileText,
  AlertOctagon,
} from 'lucide-react';
import { usePatients } from '../../context/PatientContext';
import { AuditLogEntry } from '../../types';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = usePatients();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const filtered = auditLogs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.patientName && log.patientName.toLowerCase().includes(q)) ||
        (log.patientId && log.patientId.toLowerCase().includes(q)) ||
        log.userRole.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `medikiosk_audit_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-sky-600" />
            Clinical Audit Trail & Regulatory Compliance Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable longitudinal chain-of-custody logging: registrations, AI prompts, clinical approvals & edits
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          Export Audit Trail (JSON)
        </button>
      </div>

      {/* Compliance Notice Banner */}
      <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
            ✓
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white">ABDM / EHR Standards Compliant</div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Every clinician modification, demographic edit, triage change, and AI interaction is permanently recorded with user identity, role, timestamp and delta diffs.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by clinician, patient, role or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Actions</option>
            <option value="PATIENT_REGISTERED">Patient Registered</option>
            <option value="INTAKE_COMPLETED">Intake Completed</option>
            <option value="TRIAGE_RECORDED">Triage Recorded</option>
            <option value="AI_SUMMARY_GENERATED">AI Summary Generated</option>
            <option value="DOCTOR_REVIEW_APPROVED">Doctor Review Approved</option>
            <option value="PRESCRIPTION_CREATED">Prescription Created</option>
            <option value="REFERRAL_CREATED">Referral Created</option>
            <option value="PATIENT_DEMOGRAPHICS_UPDATED">Demographics Updated</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Clinician / User</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Patient Reference</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No audit records match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{log.userName}</div>
                      <span className="inline-block text-[10px] font-semibold text-slate-400">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {log.patientName ? (
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{log.patientName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{log.patientId}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedEntry(log)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        Inspect Payload
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Audit Entry Payload #{selectedEntry.id}
                </h2>
                <p className="text-[11px] font-mono text-slate-400">
                  {new Date(selectedEntry.timestamp).toISOString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">Actor:</span>
                  <span className="font-bold">{selectedEntry.userName} ({selectedEntry.userRole})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Event Action:</span>
                  <span className="font-mono font-bold text-sky-600">{selectedEntry.action}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  JSON Audit Details & Change Diff:
                </span>
                <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-64">
                  {JSON.stringify(selectedEntry.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
