import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { usePatients } from '../../context/PatientContext';

export const AnalyticsView: React.FC = () => {
  const { patients } = usePatients();
  const [hoveredPoint, setHoveredPoint] = useState<{ hour: string; patients: number; x: number; y: number } | null>(null);

  // Compute triage distribution from active patients
  const triageCounts = {
    GREEN: patients.filter((p) => p.triage?.priority === 'GREEN').length,
    YELLOW: patients.filter((p) => p.triage?.priority === 'YELLOW').length,
    ORANGE: patients.filter((p) => p.triage?.priority === 'ORANGE').length,
    RED: patients.filter((p) => p.triage?.priority === 'RED').length,
  };

  const totalTriage = (triageCounts.GREEN + triageCounts.YELLOW + triageCounts.ORANGE + triageCounts.RED) || 4;

  const triageData = [
    { name: 'GREEN (Standard)', count: triageCounts.GREEN || 2, color: '#10b981', ringColor: 'stroke-emerald-500' },
    { name: 'YELLOW (Urgent)', count: triageCounts.YELLOW || 1, color: '#f59e0b', ringColor: 'stroke-amber-500' },
    { name: 'ORANGE (Very Urgent)', count: triageCounts.ORANGE || 1, color: '#f97316', ringColor: 'stroke-orange-500' },
    { name: 'RED (Emergency)', count: triageCounts.RED || 1, color: '#ef4444', ringColor: 'stroke-rose-500' },
  ];

  // Hourly Patient Traffic
  const trafficData = [
    { hour: '08:00 AM', patients: 14 },
    { hour: '09:00 AM', patients: 28 },
    { hour: '10:00 AM', patients: 48 },
    { hour: '11:00 AM', patients: 56 },
    { hour: '12:00 PM', patients: 38 },
    { hour: '01:00 PM', patients: 24 },
    { hour: '02:00 PM', patients: 36 },
    { hour: '03:00 PM', patients: 44 },
    { hour: '04:00 PM', patients: 30 },
  ];

  const maxTraffic = Math.max(...trafficData.map((d) => d.patients));

  // SVG dimensions for traffic chart
  const svgWidth = 600;
  const svgHeight = 220;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const points = trafficData.map((d, i) => {
    const x = padLeft + (i / (trafficData.length - 1)) * plotWidth;
    const y = padTop + plotHeight - (d.patients / maxTraffic) * plotHeight;
    return { ...d, x, y };
  });

  const linePath = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padTop + plotHeight} L ${points[0].x} ${padTop + plotHeight} Z`;

  // Chief Complaints Frequency Breakdown
  const complaints = [
    { name: 'Acute Chest Pain / Angina', count: 18, pct: 85, color: 'bg-rose-500' },
    { name: 'High-Grade Pyrexia (Viral / Dengue)', count: 42, pct: 95, color: 'bg-amber-500' },
    { name: 'Acute Dyspnea / Bronchospasm', count: 24, pct: 70, color: 'bg-orange-500' },
    { name: 'Acute Gastroenteritis & Dehydration', count: 31, pct: 78, color: 'bg-sky-500' },
    { name: 'Hypertensive Urgency', count: 15, pct: 50, color: 'bg-indigo-500' },
    { name: 'Arthralgia & Chronic Musculoskeletal', count: 27, pct: 68, color: 'bg-emerald-500' },
  ];

  const totalSafetyAlerts = patients.reduce((acc, p) => acc + (p.safetyAlerts?.length || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sky-600" />
          Clinical Operations & Health Trends Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Executive hospital intelligence: triage distributions, AI clinical concordance, and patient influx telemetry
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Consultations</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">284</div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.8% vs last week
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">AI Concordance Rate</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">94.2%</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Physician-validated diagnosis</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Avg. Door-to-Doctor Time</span>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">11.4 min</div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">-3.2 min vs benchmark</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Rule-Based Safety Interventions</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {totalSafetyAlerts || 14}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Allergies & vitals flagged</span>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly OPD Traffic (Custom Responsive SVG Area Chart) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-500" />
              Hourly Patient Flow & Registration Density
            </h2>
            <span className="text-xs text-slate-400">Peak hours: 10:00 AM - 12:00 PM</span>
          </div>

          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = padTop + plotHeight * (1 - ratio);
                return (
                  <g key={i}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={svgWidth - padRight}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-800/80"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] fill-slate-400 font-mono"
                    >
                      {Math.round(maxTraffic * ratio)}
                    </text>
                  </g>
                );
              })}

              {/* Area & Line */}
              <path d={areaPath} fill="url(#areaGradient)" />
              <path d={linePath} fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />

              {/* Interactive Dots */}
              {points.map((pt, i) => (
                <g key={i} className="cursor-pointer">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#0284c7"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all hover:r-6"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  <text
                    x={pt.x}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-400"
                  >
                    {pt.hour.split(' ')[0]}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-full px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold shadow-lg"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                }}
              >
                {hoveredPoint.hour}: {hoveredPoint.patients} Patients
              </div>
            )}
          </div>
        </div>

        {/* Triage Severity Distribution */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-500" />
            Triage Severity Distribution
          </h2>

          {/* Clean Donut Simulation */}
          <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="12" className="dark:stroke-slate-800" />
              {/* Green segment */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#10b981"
                strokeWidth="12"
                strokeDasharray={`${(triageCounts.GREEN / totalTriage) * 238} 238`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              {/* Yellow segment */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="12"
                strokeDasharray={`${(triageCounts.YELLOW / totalTriage) * 238} 238`}
                strokeDashoffset={`-${(triageCounts.GREEN / totalTriage) * 238}`}
              />
              {/* Orange segment */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#f97316"
                strokeWidth="12"
                strokeDasharray={`${(triageCounts.ORANGE / totalTriage) * 238} 238`}
                strokeDashoffset={`-${((triageCounts.GREEN + triageCounts.YELLOW) / totalTriage) * 238}`}
              />
              {/* Red segment */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#ef4444"
                strokeWidth="12"
                strokeDasharray={`${(triageCounts.RED / totalTriage) * 238} 238`}
                strokeDashoffset={`-${((triageCounts.GREEN + triageCounts.YELLOW + triageCounts.ORANGE) / totalTriage) * 238}`}
              />
            </svg>

            <div className="absolute text-center">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {patients.length}
              </span>
              <span className="text-[10px] text-slate-400 block font-semibold">CASES</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {triageData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{item.count} cases</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chief Complaints Frequency */}
        <div className="lg:col-span-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Most Frequent Presenting Chief Complaints (Past 30 Days)
            </h2>
            <span className="text-xs text-slate-400">Total 157 symptom episodes analyzed</span>
          </div>

          <div className="space-y-3">
            {complaints.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                  <span className="font-mono text-slate-500 font-bold">{item.count} cases ({item.pct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
