import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-600">
        <div className="flex items-center space-x-3 text-teal-700 bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span className="text-sm font-medium tracking-tight">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
