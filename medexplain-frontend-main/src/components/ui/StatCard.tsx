import React, { useEffect, useRef } from 'react';
import { animateNumberCount } from '../../utils/animations';

interface StatCardProps {
  label: string;
  count: number;
  type?: 'total' | 'normal' | 'low' | 'high' | 'critical' | 'unknown';
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  count,
  type = 'total',
  icon,
  active = false,
  onClick,
}) => {
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (numberRef.current) {
      animateNumberCount(numberRef.current, count, 500);
    }
  }, [count]);

  const typeConfig = {
    total: {
      border: 'border-[#27272A]',
      activeBorder: 'border-[#EDEDED] ring-1 ring-[#EDEDED]/30 bg-[#1D1D20]',
      pill: 'bg-[#27272A] text-[#EDEDED]',
      dot: 'bg-[#EDEDED]',
      textColor: 'text-[#EDEDED]',
    },
    normal: {
      border: 'border-[#27272A]',
      activeBorder: 'border-emerald-500/80 ring-1 ring-emerald-500/30 bg-emerald-950/20',
      pill: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60',
      dot: 'bg-[#00FF41]',
      textColor: 'text-emerald-400',
    },
    low: {
      border: 'border-[#27272A]',
      activeBorder: 'border-amber-500/80 ring-1 ring-amber-500/30 bg-amber-950/20',
      pill: 'bg-amber-950/60 text-amber-300 border border-amber-800/60',
      dot: 'bg-amber-400',
      textColor: 'text-amber-400',
    },
    high: {
      border: 'border-[#27272A]',
      activeBorder: 'border-rose-500/80 ring-1 ring-rose-500/30 bg-rose-950/20',
      pill: 'bg-rose-950/60 text-rose-300 border border-rose-800/60',
      dot: 'bg-rose-400',
      textColor: 'text-rose-400',
    },
    critical: {
      border: 'border-red-900/80',
      activeBorder: 'border-red-500 ring-2 ring-red-500/40 bg-red-950/30',
      pill: 'bg-red-950 text-red-200 font-semibold border border-red-700',
      dot: 'bg-red-500 animate-pulse',
      textColor: 'text-red-400',
    },
    unknown: {
      border: 'border-[#27272A]',
      activeBorder: 'border-[#52525B] ring-1 ring-[#52525B]/30 bg-[#1D1D20]',
      pill: 'bg-[#27272A] text-[#A1A1AA]',
      dot: 'bg-[#71717A]',
      textColor: 'text-[#A1A1AA]',
    },
  };

  const current = typeConfig[type];

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative bg-[#161618] rounded-2xl p-5 border transition-all duration-200 ${
        active ? current.activeBorder : current.border
      } ${
        onClick
          ? 'cursor-pointer hover:border-[#3F3F46] hover:bg-[#1A1A1D] hover:shadow-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-500'
          : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#71717A] truncate">
          {label}
        </span>
        {icon ? (
          <div className="text-[#A1A1AA] shrink-0">{icon}</div>
        ) : (
          <span className={`w-2 h-2 rounded-full ${current.dot} shrink-0`} />
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span ref={numberRef} className={`text-2xl sm:text-3xl font-bold tracking-tight ${current.textColor}`}>
          {count}
        </span>
      </div>
    </div>
  );
};

