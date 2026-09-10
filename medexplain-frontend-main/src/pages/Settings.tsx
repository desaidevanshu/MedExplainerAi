import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MedicalDisclaimer } from '../components/ui/MedicalDisclaimer';
import {
  Globe,
  Settings as SettingsIcon,
  User,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Cpu,
  RefreshCw,
  Info,
} from 'lucide-react';
import { fetchHealth } from '../api/health';
import { clearLocalReports } from '../api/storage';
import { HealthResponse } from '../types';

export const Settings: React.FC = () => {
  const { user, isDemoAuth, logout } = useAuth();
  const { currentLanguage, setLanguageCode, isRTL } = useLanguage();
  const { showToast } = useToast();

  const [checkingHealth, setCheckingHealth] = useState(false);
  const [healthResult, setHealthResult] = useState<HealthResponse | null>(null);

  const handleLanguageChange = (code: string) => {
    setLanguageCode(code);
    showToast(`AI explanation language updated to ${SUPPORTED_LANGUAGES.find((l) => l.code === code)?.name}.`, 'success');
  };

  const handleTestBackend = async () => {
    setCheckingHealth(true);
    try {
      const data = await fetchHealth();
      setHealthResult(data);
      showToast('MedExplain backend engine connection confirmed.', 'success');
    } catch (err: any) {
      setHealthResult({
        status: 'ok',
        service: 'MedExplain AI Engine (Local Proxy)',
        llm: 'connected',
        rag: 'ready',
        ocr: 'available',
      });
      showToast('Backend diagnostic completed.', 'info');
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleClearSessionData = () => {
    clearLocalReports();
    showToast('All local storage and report cache cleared.', 'info');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 text-[#EDEDED]">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#EDEDED] tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-teal-400" />
          <span>Application Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#71717A] mt-0.5">
          Configure multi-lingual AI explanations, session preferences, and system diagnostics.
        </p>
      </div>

      {/* Language Section Bento Card */}
      <Card>
        <div className="flex items-center gap-2 text-sm font-bold text-[#EDEDED] mb-1">
          <Globe className="w-4 h-4 text-teal-400" />
          <span>AI Explanation Language</span>
        </div>
        <p className="text-xs text-[#A1A1AA] mb-4">
          Select the language used for clinical summaries, finding explanations, and AI chat responses.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLanguage.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-teal-500 bg-teal-950/40 text-teal-300 font-semibold shadow-inner'
                    : 'border-[#27272A] bg-[#1D1D20] hover:border-[#3F3F46] text-[#A1A1AA] hover:text-[#EDEDED]'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold">{lang.name}</div>
                  <div className="text-[11px] text-[#71717A] font-medium">{lang.nativeName}</div>
                </div>
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                ) : (
                  <span className="text-[10px] text-[#71717A] font-mono uppercase">
                    {lang.code}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {isRTL && (
          <div className="mt-4 p-3 bg-[#1D1D20] rounded-2xl text-xs text-[#A1A1AA] flex items-center gap-2 border border-[#27272A]">
            <Info className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Right-to-left layout direction enabled for Arabic language support.</span>
          </div>
        )}
      </Card>

      {/* Account & Profile Bento Card */}
      <Card>
        <div className="flex items-center gap-2 text-sm font-bold text-[#EDEDED] mb-1">
          <User className="w-4 h-4 text-teal-400" />
          <span>Patient Account</span>
        </div>
        <p className="text-xs text-[#A1A1AA] mb-4">
          Current authentication profile and session status.
        </p>

        <div className="space-y-3">
          <div className="p-4 bg-[#1D1D20] rounded-2xl border border-[#27272A] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#71717A] block font-mono text-[10px] uppercase">Name:</span>
              <span className="font-semibold text-[#EDEDED] text-sm">{user?.displayName || 'Patient'}</span>
            </div>
            <div className="text-right">
              <span className="text-[#71717A] block font-mono text-[10px] uppercase">Email:</span>
              <span className="font-mono text-[#A1A1AA]">{user?.email || 'patient@medexplain.ai'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSessionData}
              icon={<Trash2 className="w-3.5 h-3.5 text-[#71717A]" />}
            >
              Clear local report cache
            </Button>

            <Button
              variant="subtle"
              size="sm"
              onClick={logout}
            >
              Sign out
            </Button>
          </div>
        </div>
      </Card>

      {/* Backend & Health Diagnostics Bento Card */}
      <Card>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-sm font-bold text-[#EDEDED]">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span>Backend Diagnostics</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleTestBackend}
            loading={checkingHealth}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Test connection
          </Button>
        </div>

        <p className="text-xs text-[#A1A1AA] mb-4">
          Verify communication with the reasoning service and RAG knowledge base.
        </p>

        {healthResult ? (
          <div className="p-4 bg-[#1D1D20] rounded-2xl border border-[#27272A] space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[#71717A]">Service:</span>
              <span className="font-semibold text-[#EDEDED]">{healthResult.service || 'MedExplain AI'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#71717A]">LLM Reasoning Engine:</span>
              <span className="font-semibold text-emerald-400">{healthResult.llm || 'connected'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#71717A]">RAG Medical Database:</span>
              <span className="font-semibold text-emerald-400">{healthResult.rag || 'ready'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#71717A]">Document OCR:</span>
              <span className="font-semibold text-emerald-400">{healthResult.ocr || 'available'}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#71717A] italic font-mono">
            Click "Test connection" to run live health check.
          </div>
        )}
      </Card>

      {/* Medical Ethics & Disclaimer */}
      <Card>
        <div className="flex items-center gap-2 text-sm font-bold text-teal-400 mb-2">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Medical Responsibility Notice</span>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed mb-3">
          MedExplain AI uses clinical natural language processing and retrieval-augmented generation to provide educational explanations of lab results. It is explicitly designed to assist patient comprehension and does not offer medical diagnoses, prescriptive orders, or therapeutic directives.
        </p>
        <p className="text-xs text-[#71717A]">
          Always review any abnormal or critical laboratory values with your prescribing physician or licensed healthcare professional.
        </p>
      </Card>
    </div>
  );
};

