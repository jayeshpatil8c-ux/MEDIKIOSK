import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Stethoscope,
  Building,
  ArrowRight,
  Phone,
  Ticket,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ListFilter,
  UserCheck,
} from 'lucide-react';
import { Appointment, Patient } from '../../types';
import { usePatients } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onNavigateTab: (tab: string) => void;
  onSelectPatient: (patient: Patient, targetTab?: string) => void;
}

export const AppointmentsView: React.FC<Props> = ({ onNavigateTab, onSelectPatient }) => {
  const { appointments, patients, refreshData } = usePatients();
  const { currentUser } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'completed' | 'cancelled' | 'noshow'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // New Appointment Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newDoctor, setNewDoctor] = useState('Dr. Arvind Mehta');
  const [newDepartment, setNewDepartment] = useState('General Medicine');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTimeSlot, setNewTimeSlot] = useState('10:30 AM');
  const [newType, setNewType] = useState('New Consultation');
  const [newPriority, setNewPriority] = useState<'Routine' | 'Urgent'>('Routine');
  const [newReason, setNewReason] = useState('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      // Status & Date Filters
      if (activeFilter === 'today' && app.date !== todayStr) return false;
      if (activeFilter === 'upcoming' && (app.date < todayStr || app.status === 'Completed' || app.status === 'Cancelled')) return false;
      if (activeFilter === 'completed' && app.status !== 'Completed') return false;
      if (activeFilter === 'cancelled' && app.status !== 'Cancelled') return false;
      if (activeFilter === 'noshow' && app.status !== 'No Show') return false;

      // Department & Doctor filter
      if (selectedDepartment !== 'All' && app.department !== selectedDepartment) return false;
      if (selectedDoctor !== 'All' && app.doctorName !== selectedDoctor) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = app.patientName.toLowerCase().includes(q);
        const matchId = app.patientId.toLowerCase().includes(q);
        const matchDoc = app.doctorName.toLowerCase().includes(q);
        const matchReason = app.reason.toLowerCase().includes(q);
        const matchToken = app.tokenNumber?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchDoc && !matchReason && !matchToken) return false;
      }

      return true;
    });
  }, [appointments, activeFilter, todayStr, selectedDepartment, selectedDoctor, searchQuery]);

  // Statistics counters
  const stats = useMemo(() => {
    const todayList = appointments.filter((a) => a.date === todayStr);
    return {
      todayTotal: todayList.length,
      todayWaiting: todayList.filter((a) => a.status === 'Scheduled' || a.status === 'Waiting').length,
      todayInConsultation: todayList.filter((a) => a.status === 'In Consultation').length,
      todayCompleted: todayList.filter((a) => a.status === 'Completed').length,
      todayNoShow: todayList.filter((a) => a.status === 'No Show').length,
    };
  }, [appointments, todayStr]);

  // Handle appointment status changes
  const handleCheckIn = async (appId: string) => {
    try {
      await fetch(`/api/appointments/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Checked In' }),
      });
      await refreshData();
    } catch {
      alert('Failed to check-in appointment');
    }
  };

  const handleComplete = async (appId: string) => {
    try {
      await fetch(`/api/appointments/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' }),
      });
      await refreshData();
    } catch {
      alert('Failed to complete appointment');
    }
  };

  const handleMarkNoShow = async (appId: string) => {
    try {
      await fetch(`/api/appointments/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'No Show' }),
      });
      await refreshData();
    } catch {
      alert('Failed to update status');
    }
  };

  const handleOpenPatientRecord = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      onSelectPatient(patient, 'doctor');
    } else {
      alert('Patient clinical record not found in directory');
    }
  };

  // Create new appointment
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) {
      alert('Patient name is required');
      return;
    }

    try {
      const payload = {
        patientId: selectedPatientId || `pat-temp-${Date.now()}`,
        patientName: newPatientName.trim(),
        phone: newPatientPhone.trim() || '+91 98000 00000',
        department: newDepartment,
        doctorName: newDoctor,
        date: newDate,
        timeSlot: newTimeSlot,
        status: 'Scheduled',
        reason: newReason.trim() || `${newType} — Routine checkup`,
        type: newType,
        priority: newPriority,
        tokenNumber: `APT-${Math.floor(100 + Math.random() * 900)}`,
      };

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create appointment');
      await refreshData();
      setIsNewModalOpen(false);
      // Reset form
      setNewPatientName('');
      setNewPatientPhone('');
      setSelectedPatientId('');
      setNewReason('');
    } catch (err: any) {
      alert(err.message || 'Error booking appointment');
    }
  };

  const departments = ['All', 'General Medicine', 'Ayurveda', 'Homeopathy', 'Pediatrics', 'Cardiology', 'Orthopedics'];
  const doctors = ['All', 'Dr. Arvind Mehta', 'Sister Meena Pillai', 'Vaidya Devraj Joshi', 'Dr. Sunita Deshmukh'];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            OPD Clinical Scheduling
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Appointment Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time schedule, walk-in check-in, queue synchronization, and consultation handoff.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl border border-slate-300/60 dark:border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Calendar View
            </button>
          </div>

          <button
            id="btn-new-appointment"
            onClick={() => setIsNewModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* Real-time Status Metric Cards (NO HARDCODED NUMBERS) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today Total</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.todayTotal}
          </span>
          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium block mt-0.5">
            Scheduled for today
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Awaiting Check-in</span>
          <span className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {stats.todayWaiting}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Not yet checked in</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">In Consultation</span>
          <span className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {stats.todayInConsultation}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Currently with Doctor</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Completed</span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.todayCompleted}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Consultations finished</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">No Show / Cancelled</span>
          <span className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {stats.todayNoShow}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Missed appointments</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          {(
            [
              { id: 'today', label: "Today's Schedule" },
              { id: 'all', label: 'All Appointments' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
              { id: 'noshow', label: 'No Shows' },
              { id: 'cancelled', label: 'Cancelled' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === tab.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient name, ID, OPD token, doctor, or chief complaint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              {departments.map((dep) => (
                <option key={dep} value={dep}>
                  Dept: {dep}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              {doctors.map((doc) => (
                <option key={doc} value={doc}>
                  Doctor: {doc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appointment Display (List vs Calendar) */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                No Appointments Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No scheduled consultations match your active filter criteria. You can book a new appointment
                or reset the filters.
              </p>
              <button
                onClick={() => {
                  setActiveFilter('all');
                  setSelectedDepartment('All');
                  setSelectedDoctor('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredAppointments.map((app) => {
              const isToday = app.date === todayStr;
              return (
                <div
                  key={app.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-cyan-500/50 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 flex-shrink-0 font-bold text-xs">
                      {app.tokenNumber || 'APT'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {app.patientName}
                        </h3>
                        {app.phone && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {app.phone}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            app.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : app.status === 'In Consultation'
                              ? 'bg-blue-500/20 text-blue-400 animate-pulse'
                              : app.status === 'Checked In'
                              ? 'bg-purple-500/20 text-purple-400'
                              : app.status === 'No Show' || app.status === 'Cancelled'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                          {app.doctorName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {app.department}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          {app.timeSlot} ({app.date})
                        </span>
                      </div>

                      {app.reason && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl mt-1">
                          <strong>Chief Reason:</strong> {app.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                    {app.status === 'Scheduled' && (
                      <button
                        onClick={() => handleCheckIn(app.id)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Check-in to Queue
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenPatientRecord(app.patientId)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      Open Clinical Station
                    </button>

                    {app.status !== 'Completed' && app.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleComplete(app.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/20 text-slate-600 dark:text-slate-300 hover:text-emerald-400 text-xs font-semibold transition-colors"
                        title="Mark Completed"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}

                    {app.status === 'Scheduled' && (
                      <button
                        onClick={() => handleMarkNoShow(app.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 text-slate-600 dark:text-slate-300 hover:text-rose-400 text-xs font-semibold transition-colors"
                        title="Mark No Show"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Calendar Schedule View */
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-cyan-500" />
              OPD Timetable Schedule ({todayStr})
            </h3>
            <span className="text-xs text-slate-400">Total: {filteredAppointments.length} slots</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['09:00 AM - 11:00 AM (Morning)', '11:00 AM - 01:00 PM (Midday)', '02:00 PM - 05:00 PM (Afternoon)'].map(
              (session, sIdx) => {
                const sessionApps = filteredAppointments.filter((_, idx) => idx % 3 === sIdx);
                return (
                  <div
                    key={session}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 pb-2 border-b border-slate-200 dark:border-slate-700">
                      {session}
                    </div>

                    {sessionApps.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No appointments in this slot</p>
                    ) : (
                      sessionApps.map((a) => (
                        <div
                          key={a.id}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                            <span>{a.patientName}</span>
                            <span className="text-cyan-500 text-[10px]">{a.timeSlot}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex justify-between">
                            <span>{a.doctorName}</span>
                            <span className="font-semibold text-purple-400">{a.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* New Appointment Booking Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-500" />
                  Schedule New OPD Consultation
                </h3>
                <p className="text-xs text-slate-500">
                  Book patient slot and synchronize with live queue
                </p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              {/* Patient Selection shortcut from existing registered patients */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Registered Patient (Optional Shortcut)
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setSelectedPatientId(pid);
                    const p = patients.find((pat) => pat.id === pid);
                    if (p) {
                      setNewPatientName(p.demographics.fullName);
                      setNewPatientPhone(p.demographics.phone);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">-- Choose from existing directory --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.demographics.fullName} ({p.opdToken} • {p.demographics.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    placeholder="e.g., Rahul Patil"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newPatientPhone}
                    onChange={(e) => setNewPatientPhone(e.target.value)}
                    placeholder="+91 98XXX XXXXX"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Ayurveda">Ayurveda</option>
                    <option value="Homeopathy">Homeopathy</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Cardiology">Cardiology</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Consulting Doctor
                  </label>
                  <select
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Dr. Arvind Mehta">Dr. Arvind Mehta (MD General Medicine)</option>
                    <option value="Vaidya Devraj Joshi">Vaidya Devraj Joshi (BAMS Ayurveda)</option>
                    <option value="Dr. Sunita Deshmukh">Dr. Sunita Deshmukh (BHMS Homeopathy)</option>
                    <option value="Sister Meena Pillai">Sister Meena Pillai (Triage Lead)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Visit / Symptoms
                </label>
                <textarea
                  rows={2}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g., Follow-up for gastritis and review lab reports"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-500/20"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
