import React from 'react';
import { ArrowLeft, ArrowRight, X, Sparkles, Check, ChevronRight } from 'lucide-react';
import { useTheme, PRESENTATION_STEPS } from '../../context/ThemeContext';

interface Props {
  onSelectTab?: (tab: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const PresentationModeBar: React.FC<Props> = ({ onSelectTab, onNavigateTab }) => {
  const navigate = onSelectTab || onNavigateTab || (() => {});
  const {
    isPresentationMode,
    togglePresentationMode,
    presentationStep,
    setPresentationStep,
    nextPresentationStep,
    prevPresentationStep,
    activePresentationStepInfo,
  } = useTheme();

  if (!isPresentationMode) return null;

  const handleStepClick = (stepNum: number, targetTab: string) => {
    setPresentationStep(stepNum);
    navigate(targetTab);
  };

  const handleNext = () => {
    nextPresentationStep();
    const nextIdx = Math.min(presentationStep, PRESENTATION_STEPS.length - 1);
    navigate(PRESENTATION_STEPS[nextIdx].tab);
  };

  const handlePrev = () => {
    prevPresentationStep();
    const prevIdx = Math.max(0, presentationStep - 2);
    navigate(PRESENTATION_STEPS[prevIdx].tab);
  };

  return (
    <div className="sticky bottom-0 z-40 w-full bg-slate-900/95 text-white backdrop-blur-md border-t border-purple-500/40 px-4 py-3 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Step Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-purple-500/30">
            {presentationStep}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Hackathon Demo Guide • Step {presentationStep} of {PRESENTATION_STEPS.length}
              </span>
              <span className="text-xs font-bold text-white">• {activePresentationStepInfo.title}</span>
            </div>
            <p className="text-[11px] text-slate-300 hidden sm:block">
              {activePresentationStepInfo.description}
            </p>
          </div>
        </div>

        {/* Center: Step indicators */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
          {PRESENTATION_STEPS.map((step) => {
            const isCurrent = step.step === presentationStep;
            const isCompleted = step.step < presentationStep;

            return (
              <button
                key={step.step}
                onClick={() => handleStepClick(step.step, step.tab)}
                title={`Step ${step.step}: ${step.title}`}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'bg-purple-600 text-white ring-2 ring-purple-300 ring-offset-1 ring-offset-slate-900'
                    : isCompleted
                    ? 'bg-emerald-700 text-white hover:bg-emerald-600'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.step}
              </button>
            );
          })}
        </div>

        {/* Right: Next / Prev Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={presentationStep <= 1}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev Step</span>
          </button>

          <button
            onClick={handleNext}
            disabled={presentationStep >= PRESENTATION_STEPS.length}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-500/20 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={togglePresentationMode}
            title="Exit Demo Guide"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
