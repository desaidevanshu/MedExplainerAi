import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Circle, FileText, Sparkles, Brain, Stethoscope, ShieldCheck } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  { id: 'upload', label: 'Securely receiving document', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'read', label: 'Reading structured OCR layout', icon: <FileText className="w-4 h-4" /> },
  { id: 'extract', label: 'Extracting laboratory values & reference ranges', icon: <Brain className="w-4 h-4" /> },
  { id: 'understand', label: 'Synthesizing plain-language clinical insights', icon: <Stethoscope className="w-4 h-4" /> },
  { id: 'explain', label: 'Preparing patient-friendly summary & questions', icon: <Sparkles className="w-4 h-4" /> },
];

export const ProcessingSequence: React.FC<{ filename?: string }> = ({ filename }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Step transition for visual reassurance while real async request is in progress
    const timer1 = setTimeout(() => setCurrentStepIndex(1), 1400);
    const timer2 = setTimeout(() => setCurrentStepIndex(2), 3500);
    const timer3 = setTimeout(() => setCurrentStepIndex(3), 6500);
    const timer4 = setTimeout(() => setCurrentStepIndex(4), 10000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div
      id="processing-sequence"
      className="max-w-md mx-auto bg-[#161618] rounded-3xl border border-[#27272A] p-6 sm:p-8 shadow-2xl text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-teal-950/80 border border-teal-800/80 flex items-center justify-center mx-auto mb-4 text-teal-400">
        <Loader2 className="w-7 h-7 animate-spin text-teal-400" />
      </div>

      <h3 className="text-lg font-bold text-[#EDEDED] tracking-tight">
        Analyzing your medical report
      </h3>
      {filename && (
        <p className="text-xs text-[#71717A] mt-1 font-mono truncate max-w-xs mx-auto">
          {filename}
        </p>
      )}

      <p className="text-xs text-[#A1A1AA] mt-2 mb-6 leading-relaxed">
        This may take a brief moment. We are preparing a calm, clear explanation of your results.
      </p>

      {/* Sequential progress stages */}
      <div className="space-y-3 text-left max-w-xs mx-auto">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 text-xs transition-colors duration-300 ${
                isDone
                  ? 'text-[#EDEDED] font-medium'
                  : isCurrent
                  ? 'text-teal-300 font-semibold'
                  : 'text-[#52525B]'
              }`}
            >
              <div className="shrink-0">
                {isDone && <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />}
                {isCurrent && <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />}
                {isPending && <Circle className="w-4 h-4 text-[#3F3F46]" />}
              </div>
              <span className="truncate">{step.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-[#27272A] text-[11px] text-[#71717A]">
        Educational analysis only • Does not replace physician consultation
      </div>
    </div>
  );
};

