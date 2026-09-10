import React from 'react';
import { FindingStatus } from '../../types';
import { Check, ArrowDown, ArrowUp, AlertCircle, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: FindingStatus;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
  showIcon = true,
}) => {
  const normalizedStatus = (status || 'UNKNOWN').toUpperCase() as FindingStatus;

  const sizeClasses = size === 'sm' 
    ? 'text-[11px] px-2.5 py-0.5 gap-1 font-semibold tracking-wide' 
    : 'text-xs px-3 py-1 gap-1.5 font-semibold tracking-wide';

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  switch (normalizedStatus) {
    case 'NORMAL':
      return (
        <span
          className={`inline-flex items-center whitespace-nowrap rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-xs ${sizeClasses} ${className}`}
          title="Result is within standard reference interval"
        >
          {showIcon && <Check className={`${iconSize} text-[#00FF41] shrink-0`} />}
          <span>Normal</span>
        </span>
      );

    case 'LOW':
      return (
        <span
          className={`inline-flex items-center whitespace-nowrap rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/60 shadow-xs ${sizeClasses} ${className}`}
          title="Result is below standard reference interval"
        >
          {showIcon && <ArrowDown className={`${iconSize} text-amber-400 shrink-0`} />}
          <span>Low</span>
        </span>
      );

    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center whitespace-nowrap rounded-full bg-rose-950/80 text-rose-300 border border-rose-700/60 shadow-xs ${sizeClasses} ${className}`}
          title="Result is above standard reference interval"
        >
          {showIcon && <ArrowUp className={`${iconSize} text-rose-400 shrink-0`} />}
          <span>High</span>
        </span>
      );

    case 'CRITICAL':
      return (
        <span
          className={`inline-flex items-center whitespace-nowrap rounded-full bg-red-950 text-red-200 border border-red-500 shadow-md animate-pulse ${sizeClasses} ${className}`}
          title="Critical finding requiring healthcare professional attention"
        >
          {showIcon && <AlertCircle className={`${iconSize} text-red-400 shrink-0`} />}
          <span>Critical</span>
        </span>
      );

    case 'UNKNOWN':
    default:
      return (
        <span
          className={`inline-flex items-center whitespace-nowrap rounded-full bg-[#1D1D20] text-[#A1A1AA] border border-[#27272A] ${sizeClasses} ${className}`}
          title="Reference interval undetermined"
        >
          {showIcon && <HelpCircle className={`${iconSize} text-[#71717A] shrink-0`} />}
          <span>Undetermined</span>
        </span>
      );
  }
};

