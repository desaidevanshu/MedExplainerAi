import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface MedicalDisclaimerProps {
  compact?: boolean;
  className?: string;
  customText?: string;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({
  compact = false,
  className = '',
  customText,
}) => {
  const defaultText =
    customText ||
    'MedExplain AI provides educational information and does not replace professional medical advice, diagnosis, or treatment. Always discuss your laboratory results with your qualified healthcare provider.';

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 text-xs text-[#71717A] py-2 ${className}`}
        role="note"
      >
        <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
        <span className="leading-tight">{defaultText}</span>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#161618] rounded-2xl p-5 border border-[#27272A] text-[#A1A1AA] text-xs leading-relaxed flex items-start gap-3.5 shadow-md ${className}`}
      role="note"
    >
      <div className="w-8 h-8 rounded-xl bg-teal-950/80 border border-teal-800/80 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
        <Info className="w-4 h-4" />
      </div>
      <div>
        <span className="font-bold text-[#EDEDED] text-xs uppercase tracking-wider block mb-1">
          Medical & Educational Disclaimer
        </span>
        <p className="text-[#A1A1AA] leading-relaxed">{defaultText}</p>
      </div>
    </div>
  );
};

