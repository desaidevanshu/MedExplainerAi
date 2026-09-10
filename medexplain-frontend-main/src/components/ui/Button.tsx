import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle' | 'danger' | 'ghost' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  iconPosition = 'left',
  className = '',
  id,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 h-8',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-sm sm:text-base px-6 py-3 gap-2.5 h-12',
  };

  const variantStyles = {
    primary:
      'bg-[#EDEDED] hover:bg-white text-[#0A0A0B] font-semibold shadow-md border border-white/20 hover:shadow-lg',
    secondary:
      'bg-[#27272A] hover:bg-[#3F3F46] text-[#EDEDED] border border-[#3F3F46]',
    outline:
      'bg-[#161618] hover:bg-[#1D1D20] text-[#EDEDED] border border-[#27272A] hover:border-[#3F3F46] shadow-sm',
    subtle:
      'bg-[#1D1D20] hover:bg-[#27272A] text-[#A1A1AA] hover:text-[#EDEDED] border border-transparent',
    danger:
      'bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/60 shadow-sm',
    ghost:
      'bg-transparent hover:bg-[#1D1D20] text-[#A1A1AA] hover:text-[#EDEDED] border border-transparent',
    emerald:
      'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 shadow-sm',
  };

  return (
    <button
      id={id || `btn-${Math.random().toString(36).substring(2, 7)}`}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};

