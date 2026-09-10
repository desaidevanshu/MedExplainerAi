import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type?: ToastType;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string) => {
      const id = 'toast-' + Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, message, type, title };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast viewport */}
      <div
        id="toast-container"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3"
      >
        {toasts.map((t) => {
          const isError = t.type === 'error';
          const isSuccess = t.type === 'success';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
                isError
                  ? 'bg-rose-950/90 border-rose-800/60 text-rose-200'
                  : isSuccess
                  ? 'bg-emerald-950/90 border-emerald-800/60 text-emerald-200'
                  : isWarning
                  ? 'bg-amber-950/90 border-amber-800/60 text-amber-200'
                  : 'bg-[#161618]/95 border-[#27272A] text-[#EDEDED]'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {!isError && !isSuccess && !isWarning && <Info className="w-4 h-4 text-teal-400" />}
              </div>
              <div className="flex-1 text-xs">
                {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
                <div className={`${isError || isSuccess || isWarning ? 'opacity-90' : 'text-[#A1A1AA]'} leading-relaxed`}>{t.message}</div>
              </div>
              <button
                id={`dismiss-toast-${t.id}`}
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 text-[#71717A] hover:text-[#EDEDED] rounded-lg transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
