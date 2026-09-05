import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  Camera,
  CheckCircle,
  AlertCircle,
  Eye,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Edit2,
  Trash2,
} from 'lucide-react';
import { VoiceLanguage } from '../../../utils/speechHelper';
import { MedicalDocument } from '../../../types';

interface Props {
  scannedDocuments: MedicalDocument[];
  setScannedDocuments: (docs: MedicalDocument[]) => void;
  selectedLanguage: VoiceLanguage;
  onBack: () => void;
  onContinue: () => void;
}

export const DocumentScannerStep: React.FC<Props> = ({
  scannedDocuments,
  setScannedDocuments,
  onBack,
  onContinue,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'sample' | 'upload' | 'camera'>('sample');
  const [selectedReportId, setSelectedReportId] = useState<string>('cbc_fbs');
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  // Pre-configured Sample Clinical Reports for instant demo
  const sampleReports: {
    id: string;
    title: string;
    type: 'lab_report' | 'prescription' | 'discharge_summary' | 'imaging';
    date: string;
    confidence: number;
    labValues: { test: string; result: string; normal: string; isAbnormal: boolean }[];
    diagnoses: string[];
    medications: string[];
  }[] = [
    {
      id: 'cbc_fbs',
      title: 'Lab Report: CBC & Fasting Blood Sugar (FBS)',
      type: 'lab_report',
      date: '2026-03-01',
      confidence: 97.2,
      labValues: [
        { test: 'Fasting Blood Sugar (FBS)', result: '142 mg/dL', normal: '70-100 mg/dL', isAbnormal: true },
        { test: 'HbA1c Glycated Hemoglobin', result: '7.2 %', normal: '< 5.7 %', isAbnormal: true },
        { test: 'Serum Creatinine', result: '0.9 mg/dL', normal: '0.7-1.3 mg/dL', isAbnormal: false },
        { test: 'Hemoglobin (Hb)', result: '13.8 g/dL', normal: '13.0-17.0 g/dL', isAbnormal: false },
      ],
      diagnoses: ['Impaired Fasting Glucose', 'Type 2 Diabetes (Mild)'],
      medications: ['Metformin 500mg (OD)'],
    },
    {
      id: 'endoscopy',
      title: 'Upper GI Endoscopy & Biopsy Report',
      type: 'imaging',
      date: '2026-02-15',
      confidence: 95.8,
      labValues: [
        { test: 'Antral Mucosa', result: 'Hyperemic with erosions', normal: 'Normal pink mucosa', isAbnormal: true },
        { test: 'Rapid Urease Test (RUT)', result: 'POSITIVE (+)', normal: 'Negative', isAbnormal: true },
      ],
      diagnoses: ['Erosive Antral Gastritis', 'Helicobacter pylori Infection'],
      medications: ['Robinia 30 candidate', 'Proton Pump Inhibitor'],
    },
    {
      id: 'prescription',
      title: 'Previous Outpatient Prescription Slip',
      type: 'prescription',
      date: '2026-02-28',
      confidence: 94.6,
      labValues: [],
      diagnoses: ['Chronic Acid Peptic Disease', 'Non-Ulcer Dyspepsia'],
      medications: ['Pantoprazole 40mg (OD AC)', 'Domperidone 10mg (BD)', 'Antacid Gel (TDS)'],
    },
  ];

  const handleSimulateOCR = (reportId: string) => {
    setIsScanning(true);
    const target = sampleReports.find((r) => r.id === reportId);
    if (!target) return;

    setTimeout(() => {
      const newDoc: MedicalDocument = {
        id: `doc_${Date.now()}`,
        name: target.title,
        title: target.title,
        category: target.type === 'lab_report' ? 'Lab Report' : target.type === 'prescription' ? 'Prescription' : 'Imaging Report',
        uploadedAt: new Date().toISOString(),
        date: target.date,
        source: 'Scanner',
        confidence: target.confidence / 100,
        verificationStatus: 'Patient Confirmed',
        extractedData: {
          diagnoses: target.diagnoses,
          medications: target.medications,
          tests: target.labValues.map((v) => ({
            name: v.test,
            value: v.result,
            normalRange: v.normal,
            flag: v.isAbnormal ? 'High' : 'Normal',
          })),
          confidenceScore: target.confidence,
        },
      };

      setScannedDocuments([...scannedDocuments, newDoc]);
      setIsScanning(false);
    }, 1200);
  };

  const handleRemoveDoc = (id: string) => {
    setScannedDocuments(scannedDocuments.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileCheck className="w-3.5 h-3.5" />
            Step 7 of 10 • Document Scanning & OCR
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Clinical Records & Medical Report OCR
          </h2>
          <p className="text-xs text-slate-500">
            Scan physical reports, lab tests, or previous prescriptions. MediKiosk OCR parses test results and medications automatically.
          </p>
        </div>
      </div>

      {/* OCR Method Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('sample')}
          className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'sample'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Built-in Clinical Samples</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'upload'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload File (PDF / Image)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('camera')}
          className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'camera'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Kiosk Camera Scanner</span>
        </button>
      </div>

      {/* Tab 1: Sample Clinical Reports */}
      {activeTab === 'sample' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sampleReports.map((report) => {
              const isSelected = selectedReportId === report.id;
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReportId(report.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                    <span className="uppercase">{report.type.replace('_', ' ')}</span>
                    <span className="text-cyan-600 dark:text-cyan-400">OCR ~{report.confidence}%</span>
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mb-2">
                    {report.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>Date: {report.date}</div>
                    <div>Diagnoses: {report.diagnoses.join(', ')}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Selected: <strong>{sampleReports.find((r) => r.id === selectedReportId)?.title}</strong>
            </div>
            <button
              type="button"
              id="btn-run-ocr"
              disabled={isScanning}
              onClick={() => handleSimulateOCR(selectedReportId)}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isScanning ? 'Extracting Lab & Prescriptions...' : 'Run OCR & Attach to File'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Upload File */}
      {activeTab === 'upload' && (
        <div className="p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/40">
          <UploadCloud className="w-10 h-10 text-cyan-500 mx-auto" />
          <div className="text-xs text-slate-600 dark:text-slate-300">
            Drag and drop clinical PDF reports or photos of prescriptions here, or touch to browse.
          </div>
          <button
            type="button"
            onClick={() => handleSimulateOCR('cbc_fbs')}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
          >
            Select Document File
          </button>
        </div>
      )}

      {/* Tab 3: Camera Scanner */}
      {activeTab === 'camera' && (
        <div className="p-6 rounded-3xl bg-slate-950 text-white text-center space-y-3">
          <div className="w-full h-48 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-col gap-2">
            <Camera className="w-8 h-8 text-cyan-400 animate-pulse" />
            <span className="text-xs text-slate-400">Position clinical document under kiosk high-res camera scanner</span>
          </div>
          <button
            type="button"
            onClick={() => handleSimulateOCR('endoscopy')}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-md"
          >
            Capture Document Snapshot
          </button>
        </div>
      )}

      {/* Attached & Verified Documents List with OCR Results */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-cyan-500" />
            Extracted Clinical Documents ({scannedDocuments.length})
          </h3>
        </div>

        {scannedDocuments.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
            No documents attached yet. You can attach a report or continue to ABHA generation.
          </div>
        ) : (
          <div className="space-y-3">
            {scannedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-slate-900 dark:text-white">{doc.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      Verified ({(doc.confidence * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Extracted Lab Values Table */}
                {doc.extractedData?.tests && doc.extractedData.tests.length > 0 && (
                  <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                        <tr>
                          <th className="py-1.5 px-3">Test Parameter</th>
                          <th className="py-1.5 px-3">Extracted Result</th>
                          <th className="py-1.5 px-3">Standard Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {doc.extractedData.tests.map((res: any, rIdx: number) => (
                          <tr key={rIdx}>
                            <td className="py-1.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                              {typeof res === 'string' ? res : res.name}
                            </td>
                            <td className="py-1.5 px-3 font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                              {typeof res === 'string' ? '-' : res.value}
                            </td>
                            <td className="py-1.5 px-3 text-slate-500">
                              {typeof res === 'string' ? '-' : res.normalRange}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Extracted Medications & Diagnoses Chips */}
                <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                  {doc.extractedData?.diagnoses?.map((d, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium"
                    >
                      Diagnosis: {d}
                    </span>
                  ))}
                  {doc.extractedData?.medications?.map((m, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 font-medium"
                    >
                      Rx: {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Medical History
        </button>

        <button
          type="button"
          id="btn-docs-continue"
          onClick={onContinue}
          className="px-7 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all"
        >
          <span>Continue to ABHA ID</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
