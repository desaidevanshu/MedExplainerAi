import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padded?: boolean;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  padded = true,
  elevated = false,
  id,
  ...props
}) => {
  return (
    <div
      id={id || `bento-card-${Math.random().toString(36).substring(2, 7)}`}
      className={`${
        elevated ? 'bg-[#1D1D20]' : 'bg-[#161618]'
      } rounded-3xl border border-[#27272A] shadow-xl text-[#EDEDED] transition-all duration-200 ${
        padded ? 'p-6 sm:p-7' : ''
      } ${
        hoverable
          ? 'hover:border-[#3F3F46] hover:bg-[#1A1A1D] hover:shadow-2xl hover:-translate-y-0.5'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

