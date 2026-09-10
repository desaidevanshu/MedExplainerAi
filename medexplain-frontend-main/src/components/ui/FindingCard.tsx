import React, { useState, useRef, useEffect } from 'react';
import { Finding } from '../../types';
import { StatusBadge } from './StatusBadge';
import { ChevronDown, MessageSquare, HelpCircle, BookOpen, AlertTriangle, Info } from 'lucide-react';
import { animateAccordion } from '../../utils/animations';

interface FindingCardProps {
  finding: Finding;
  onAskAi?: (findingName: string) => void;
  defaultExpanded?: boolean;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  onAskAi,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasDeepContent = Boolean(
    finding.explanation ||
    finding.possible_significance ||
    (finding.doctor_questions && finding.doctor_questions.length > 0) ||
    (finding.sources && finding.sources.length > 0)
  );

  const isExpandable = hasDeepContent || Boolean(onAskAi);

  const toggleExpand = () => {
    if (!isExpandable) return;
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (contentRef.current) {
      animateAccordion(contentRef.current, nextState, 260);
    }
  };

  const isAbnormal = finding.status === 'HIGH' || finding.status === 'LOW' || finding.status === 'CRITICAL';
  const isCritical = finding.status === 'CRITICAL';

  return (
    <div
      className={`bg-[#161618] rounded-2xl border transition-all duration-200 ${isCritical
        ? 'border-red-600/80 shadow-lg'
        : isAbnormal
          ? 'border-[#3F3F46]'
          : 'border-[#27272A]'
        } hover:border-[#52525B] hover:shadow-md`}
    >
      {/* Header Row */}
      <div
        onClick={toggleExpand}
        role={isExpandable ? 'button' : undefined}
        tabIndex={isExpandable ? 0 : undefined}
        aria-expanded={isExpandable ? isExpanded : undefined}
        onKeyDown={(e) => {
          if (isExpandable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            toggleExpand();
          }
        }}
        className={`p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isExpandable ? 'cursor-pointer select-none' : ''
          }`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-bold text-[#EDEDED] text-base tracking-tight truncate">
              {finding.name}
            </h3>
            <StatusBadge status={finding.status} size="sm" />
          </div>

          <div className="mt-1.5 flex items-center gap-4 text-xs text-[#71717A] flex-wrap font-mono">
            {finding.reference_range && (
              <span>
                Standard reference:{' '}
                <span className="font-semibold text-[#A1A1AA]">
                  {finding.reference_range} {finding.unit || ''}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Value Display */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
          <div className="text-left sm:text-right">
            <div className="text-xl font-bold text-[#EDEDED] tracking-tight font-mono">
              {finding.value !== undefined && finding.value !== null
                ? finding.value
                : '—'}
              {finding.unit ? (
                <span className="text-xs font-normal text-[#71717A] ml-1.5 font-sans">
                  {finding.unit}
                </span>
              ) : null}
            </div>
          </div>

          {isExpandable && (
            <div
              className={`p-2 rounded-xl bg-[#1D1D20] text-[#71717A] hover:text-[#EDEDED] transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#EDEDED] bg-[#27272A]' : ''
                }`}
              aria-hidden="true"
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Expandable Explanation Details */}
      <div
        ref={contentRef}
        style={{ display: defaultExpanded ? 'block' : 'none' }}
        className="overflow-hidden border-t border-[#27272A]"
      >
        <div className="p-5 sm:p-6 bg-[#1D1D20] space-y-4 text-xs sm:text-sm">
          {/* Missing Content Helper for Normal Metrics */}
          {!hasDeepContent && finding.status === 'NORMAL' && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-950/10 border border-emerald-900/30 text-emerald-200/50 text-xs leading-relaxed">
              <Info className="w-3.5 h-3.5 text-emerald-500/40 shrink-0 mt-0.5" />
              <div>
                This result appears to be within standard accepted ranges. To conserve systems bandwidth, full textual breakdowns are skipped for normal results, but you can dynamically ask the AI for a personalized explanation below.
              </div>
            </div>
          )}

          {/* Missing Content Helper for Unknown/Unclassified Metrics */}
          {!hasDeepContent && (!finding.status || finding.status === 'UNKNOWN') && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#161618] border border-[#27272A] text-[#A1A1AA] text-xs leading-relaxed">
              <Info className="w-3.5 h-3.5 text-[#71717A] shrink-0 mt-0.5" />
              <div>
                The clinical status of this metric could not be automatically classified against standard reference ranges. Full textual breakdowns were skipped, but you can dynamically ask the AI for a personalized explanation below.
              </div>
            </div>
          )}

          {/* Critical Care Note if critical */}
          {isCritical && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-red-300">Priority consultation recommended:</span> This result differs significantly from standard laboratory ranges. Please share this report promptly with your healthcare team.
              </div>
            </div>
          )}

          {/* Plain Language Meaning */}
          {finding.explanation && (
            <div>
              <h4 className="font-semibold text-[#A1A1AA] mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                What this means
              </h4>
              <p className="text-[#EDEDED] leading-relaxed font-normal">
                {finding.explanation}
              </p>
            </div>
          )}

          {/* Possible Significance */}
          {finding.possible_significance && (
            <div>
              <h4 className="font-semibold text-[#A1A1AA] mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                Clinical Context
              </h4>
              <p className="text-[#EDEDED] leading-relaxed font-normal">
                {finding.possible_significance}
              </p>
            </div>
          )}

          {/* Questions to Ask Doctor */}
          {finding.doctor_questions && finding.doctor_questions.length > 0 && (
            <div>
              <h4 className="font-semibold text-[#A1A1AA] mb-2 text-[11px] uppercase tracking-wider">
                Suggested questions for your doctor
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-[#D4D4D8]">
                {finding.doctor_questions.map((q, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources if present */}
          {finding.sources && finding.sources.length > 0 && (
            <div className="pt-3 border-t border-[#27272A] flex items-center gap-2 text-xs text-[#71717A] flex-wrap">
              <span className="font-medium text-[#A1A1AA]">Reference:</span>
              {finding.sources.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-[#161618] border border-[#27272A] rounded-lg text-[#D4D4D8] text-xs font-mono"
                >
                  {s.title || s.name || s.source || 'Medical Knowledge Base'}
                </span>
              ))}
            </div>
          )}

          {/* Action Footer */}
          {onAskAi && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAskAi(finding.name);
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 hover:text-white bg-teal-950/80 hover:bg-teal-900 px-3.5 py-2 rounded-xl border border-teal-800/80 transition-all shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                <span>Ask AI about {finding.name}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

