import React, { useState } from 'react';
import {
  Users,
  Volume2,
  VolumeX,
  Play,
  Clock,
  CheckCircle,
  AlertOctagon,
  ArrowRight,
  Tv,
} from 'lucide-react';
import { usePatients } from '../../context/PatientContext';
import { TriagePriority } from '../../types';

interface Props {
  onNavigateTab: (tab: string) => void;
}

export const QueueDisplayView: React.FC<Props> = ({ onNavigateTab }) => {
  const { patients, callNextQueuePatient } = usePatients();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState('All');

  const priorityColors: Record<TriagePriority, string> = {
    GREEN: 'bg-emerald-500 text-white',
    YELLOW: 'bg-amber-500 text-white',
    ORANGE: 'bg-orange-500 text-white',
    RED: 'bg-rose-600 text-white animate-pulse',
  };

  const currentlyServing = patients.find((p) => p.status === 'Doctor Review') || patients[0];
  const waitingPatients = patients.filter((p) => p.id !== currentlyServing?.id);

  const handleCallNext = () => {
    callNextQueuePatient();
    if (audioEnabled && 'speechSynthesis' in window && currentlyServing) {
      const utterance = new SpeechSynthesisUtterance(
        `Token number ${currentlyServing.opdToken}, ${currentlyServing.demographics.fullName}, please proceed to Consultation Room 1`
      );
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & TV Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Tv className="w-5 h-5 text-sky-600" />
            Public OPD Queue & Waiting Area Display
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time high-visibility token display for clinic waiting hall & triage monitors
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              audioEnabled
                ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioEnabled ? 'Token Chime On' : 'Chime Muted'}</span>
          </button>

          <button
            onClick={handleCallNext}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Call Next Token
          </button>
        </div>
      </div>

      {/* Hero "NOW SERVING" Banner */}
      {currentlyServing && (
        <div className="p-8 rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-white/20 pb-4 md:pb-0 md:pr-6">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-200 block mb-1">
                Now Serving In Consultation Room 1
              </span>
              <div className="font-mono text-6xl font-black tracking-tight text-white drop-shadow-sm">
                {currentlyServing.opdToken}
              </div>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs">
                Status: {currentlyServing.status}
              </span>
            </div>

            <div className="md:col-span-8 space-y-2 text-center md:text-left">
              <div className="text-2xl font-black text-white">
                {currentlyServing.demographics.fullName}
              </div>
              <div className="text-sm text-sky-100 flex flex-wrap gap-4 justify-center md:justify-start">
                <span>{currentlyServing.demographics.age} Y • {currentlyServing.demographics.gender}</span>
                <span>Reg: {currentlyServing.demographics.registrationNumber}</span>
                <span className="font-semibold">
                  Triage:{' '}
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                      priorityColors[currentlyServing.triage?.priority || 'GREEN']
                    }`}
                  >
                    {currentlyServing.triage?.priority || 'GREEN'}
                  </span>
                </span>
              </div>
              {currentlyServing.symptoms?.chiefComplaint && (
                <p className="text-xs text-sky-100/80 pt-1 italic">
                  "{currentlyServing.symptoms.chiefComplaint}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Next In Line Queue Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Upcoming Tokens In Queue ({waitingPatients.length} Waiting)
          </h2>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Est. Average Consultation: 8-12 min / patient
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {waitingPatients.map((patient, index) => {
            const priority = patient.triage?.priority || 'GREEN';
            const estWait = (index + 1) * 10;

            return (
              <div
                key={patient.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-sky-300 dark:hover:border-sky-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-lg font-black text-sky-700 dark:text-sky-300">
                      {patient.opdToken}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${priorityColors[priority]}`}
                    >
                      {priority}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {patient.demographics.fullName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {patient.demographics.age} Y • {patient.demographics.gender}
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 line-clamp-1">
                    {patient.symptoms?.chiefComplaint || 'Awaiting intake recording'}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Est. Wait:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                    ~{estWait} mins
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
