import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`text-center py-12 px-4 max-w-md mx-auto flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-600 mb-4 shadow-2xs">
        {icon}
      </div>

      <h3 className="text-base font-semibold text-stone-900 mb-1.5 tracking-tight">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-stone-600 mb-6 leading-relaxed max-w-sm">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
        {actionText && onAction && (
          <Button
            onClick={onAction}
            icon={actionIcon}
            className="w-full sm:w-auto"
            size="md"
          >
            {actionText}
          </Button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <Button
            variant="outline"
            onClick={onSecondaryAction}
            className="w-full sm:w-auto"
            size="md"
          >
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
};
