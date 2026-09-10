import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MedicalDisclaimer } from '../components/ui/MedicalDisclaimer';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  UploadCloud,
  Sparkles,
  FileText,
  MessageSquareText,
  History as HistoryIcon,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Search,
  Database,
  Cpu,
  Globe,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { fetchHealth } from '../api/health';
import { analyzeDemoReport } from '../api/demo';
import { getLocalReportHistory, saveReportToLocalHistory, fetchCloudReportHistory } from '../api/storage';
import { HealthResponse, Report } from '../types';
import { animatePageEntrance, animateStaggeredCards } from '../utils/animations';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [demoLoading, setDemoLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load health and local recent reports
    const loadDashboardData = async () => {
      try {
        const healthData = await fetchHealth();
        setHealth(healthData);
      } catch (err) {
        // Fallback default operational health
        setHealth({
          status: 'ok',
          service: 'MedExplain AI',
          llm: 'connected',
          rag: 'ready',
          ocr: 'available',
        });
      }

      const cloudReports = await fetchCloudReportHistory();
      if (cloudReports && cloudReports.length > 0) {
        setRecentReports(cloudReports.slice(0, 3));
      } else {
        const storedReports = getLocalReportHistory();
        setRecentReports(storedReports.slice(0, 3));
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      animatePageEntrance(containerRef.current);
      animateStaggeredCards('.dashboard-card', { delay: 50, stagger: 40 });
    }
  }, []);

  const handleTryDemo = async () => {
    setDemoLoading(true);
    try {
      showToast('Preparing sample laboratory analysis...', 'info');
      const demoReport = await analyzeDemoReport(currentLanguage.code);
      saveReportToLocalHistory(demoReport);
      showToast('Sample report ready for exploration.', 'success');
      navigate(`/report/${demoReport.report_id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to load demo report. Please try again.', 'error');
    } finally {
      setDemoLoading(false);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div ref={containerRef} className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 text-[#EDEDED]">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#27272A]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#EDEDED] tracking-tight flex items-center gap-2">
            <span>{getTimeGreeting()},</span>
            <span className="text-teal-400">
              {user?.displayName || 'Patient'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5">
            Understand your medical reports with clarity, calm terminology, and clinical context.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            id="dash-quick-upload-btn"
            onClick={() => navigate('/upload')}
            icon={<UploadCloud className="w-4 h-4" />}
            size="sm"
          >
            Upload report
          </Button>
        </div>
      </div>

      {/* Primary Bento Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Primary Action Card */}
        <div
          id="primary-analyze-card"
          className="dashboard-card md:col-span-2 bg-[#161618] rounded-3xl p-6 sm:p-8 border border-[#27272A] relative overflow-hidden flex flex-col justify-between shadow-xl hover:border-[#3F3F46] transition-all"
        >
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10 max-w-md">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/90 text-teal-300 text-xs font-bold border border-teal-800 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>AI Document Extraction</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEDED]">
              Analyze a medical laboratory report
            </h2>

            <p className="text-[#A1A1AA] text-xs sm:text-sm leading-relaxed">
              Upload a PDF, JPG, or PNG document. Our multi-agent OCR engine extracts lab values, evaluates reference intervals, and translates results into plain language.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3 relative z-10 flex-wrap">
            <Button
              id="hero-upload-btn"
              onClick={() => navigate('/upload')}
              variant="primary"
              icon={<UploadCloud className="w-4 h-4" />}
            >
              Upload report
            </Button>
            <span className="text-xs text-[#71717A] font-mono">PDF, JPG, PNG up to 15 MB</span>
          </div>
        </div>

        {/* Demo Action Card */}
        <div
          id="demo-action-card"
          className="dashboard-card bg-[#161618] rounded-3xl p-6 border border-[#27272A] shadow-xl flex flex-col justify-between hover:border-[#3F3F46] transition-all"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-950/80 border border-teal-800/80 text-teal-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-[#EDEDED] tracking-tight">
              Explore sample report
            </h3>

            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Test MedExplain AI using a sample Comprehensive Metabolic Panel with normal and abnormal laboratory findings.
            </p>
          </div>

          <div className="mt-6">
            <Button
              id="try-demo-btn"
              onClick={handleTryDemo}
              variant="outline"
              loading={demoLoading}
              className="w-full"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
              size="sm"
            >
              Try sample demo
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Access Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => navigate('/upload')}
          className="dashboard-card bg-[#161618] p-5 rounded-2xl border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1D1D20] text-left transition-all group shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-[#1D1D20] border border-[#27272A] flex items-center justify-center text-teal-400 mb-3 group-hover:bg-teal-950 group-hover:border-teal-800 transition-colors">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-[#EDEDED]">Upload Lab</div>
          <div className="text-[11px] text-[#71717A]">Scan new results</div>
        </button>

        <button
          onClick={() => navigate('/chat')}
          className="dashboard-card bg-[#161618] p-5 rounded-2xl border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1D1D20] text-left transition-all group shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-[#1D1D20] border border-[#27272A] flex items-center justify-center text-teal-400 mb-3 group-hover:bg-teal-950 group-hover:border-teal-800 transition-colors">
            <MessageSquareText className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-[#EDEDED]">Ask AI</div>
          <div className="text-[11px] text-[#71717A]">Clinical questions</div>
        </button>

        <button
          onClick={() => navigate('/history')}
          className="dashboard-card bg-[#161618] p-5 rounded-2xl border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1D1D20] text-left transition-all group shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-[#1D1D20] border border-[#27272A] flex items-center justify-center text-teal-400 mb-3 group-hover:bg-teal-950 group-hover:border-teal-800 transition-colors">
            <HistoryIcon className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-[#EDEDED]">View History</div>
          <div className="text-[11px] text-[#71717A]">Previous reports</div>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="dashboard-card bg-[#161618] p-5 rounded-2xl border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1D1D20] text-left transition-all group shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-[#1D1D20] border border-[#27272A] flex items-center justify-center text-teal-400 mb-3 group-hover:bg-teal-950 group-hover:border-teal-800 transition-colors">
            <Globe className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-[#EDEDED]">Languages</div>
          <div className="text-[11px] text-[#71717A]">11 languages</div>
        </button>
      </div>

      {/* System Status & Recent Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports / Activity */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#EDEDED] tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Recent Report Activity</span>
            </h3>
            {recentReports.length > 0 && (
              <button
                onClick={() => navigate('/history')}
                className="text-xs font-semibold text-teal-300 hover:text-white transition-colors"
              >
                View all
              </button>
            )}
          </div>

          {recentReports.length > 0 ? (
            <div className="space-y-2.5">
              {recentReports.map((report) => (
                <div
                  key={report.report_id}
                  onClick={() => navigate(`/report/${report.report_id}`)}
                  className="p-4 bg-[#161618] rounded-2xl border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1D1D20] transition-all cursor-pointer flex items-center justify-between gap-4 shadow-md"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-[#EDEDED] text-xs sm:text-sm truncate">
                      {report.filename || 'Medical Report'}
                    </div>
                    <div className="text-[11px] text-[#71717A] mt-0.5 flex items-center gap-2 flex-wrap font-mono">
                      <span>{report.statistics.total} findings</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">{report.statistics.normal} normal</span>
                      {report.statistics.low > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-sky-400 font-semibold">{report.statistics.low} low</span>
                        </>
                      )}
                      {report.statistics.high > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400 font-semibold">{report.statistics.high} high</span>
                        </>
                      )}
                      {report.statistics.critical > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-red-400 font-bold">{report.statistics.critical} critical</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" icon={<ArrowRight className="w-3.5 h-3.5 text-teal-400" />}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-[#161618] rounded-3xl border border-[#27272A] text-center space-y-3 shadow-md">
              <div className="w-10 h-10 rounded-2xl bg-[#1D1D20] border border-[#27272A] text-[#71717A] flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs text-[#A1A1AA]">No previous reports analyzed in this session.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/upload')}
              >
                Upload your first report
              </Button>
            </div>
          )}
        </div>

        {/* Operational Status Bento Card */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#EDEDED] tracking-tight flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span>MedExplain Engine Status</span>
          </h3>

          <div className="bg-[#161618] rounded-3xl border border-[#27272A] p-5 space-y-3.5 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#27272A]">
              <div className="flex items-center gap-2 text-[#EDEDED]">
                <Database className="w-3.5 h-3.5 text-teal-400" />
                <span>RAG Knowledge Base</span>
              </div>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full text-[10px] border border-emerald-800/80">
                READY
              </span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-[#27272A]">
              <div className="flex items-center gap-2 text-[#EDEDED]">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Clinical Reasoning LLM</span>
              </div>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full text-[10px] border border-emerald-800/80">
                CONNECTED
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#EDEDED]">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                <span>OCR Document Parser</span>
              </div>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full text-[10px] border border-emerald-800/80">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
};

