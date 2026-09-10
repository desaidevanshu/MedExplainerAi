import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { MedicalDisclaimer } from '../components/ui/MedicalDisclaimer';
import {
  History as HistoryIcon,
  UploadCloud,
  FileText,
  ArrowRight,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';
import { getLocalReportHistory, clearLocalReports, fetchCloudReportHistory } from '../api/storage';
import { useToast } from '../context/ToastContext';
import { Report } from '../types';
import { animatePageEntrance } from '../utils/animations';

export const History: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    async function init() {
      const cloudData = await fetchCloudReportHistory();
      if (cloudData && cloudData.length > 0) {
        setReports(cloudData);
      } else {
        const data = getLocalReportHistory();
        setReports(data);
      }
      animatePageEntrance('#history-container');
    }
    init();
  }, []);

  const handleClearHistory = () => {
    clearLocalReports();
    setReports([]);
    showToast('Report history cleared.', 'info');
  };

  return (
    <div id="history-container" className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 text-[#EDEDED]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#27272A]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#EDEDED] tracking-tight flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-teal-400" />
            <span>Report History</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] mt-0.5">
            Access previous medical reports analyzed during your sessions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {reports.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              icon={<Trash2 className="w-3.5 h-3.5 text-[#71717A]" />}
            >
              Clear history
            </Button>
          )}

          <Button
            onClick={() => navigate('/upload')}
            size="sm"
            icon={<UploadCloud className="w-4 h-4" />}
          >
            Upload new report
          </Button>
        </div>
      </div>

      {/* Reports Bento List or Empty State */}
      {reports.length > 0 ? (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.report_id}
              onClick={() => navigate(`/report/${report.report_id}`)}
              className="p-5 bg-[#161618] rounded-3xl border border-[#27272A] hover:border-teal-500 hover:shadow-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-[#1D1D20] border border-[#27272A] text-teal-400 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                  <FileText className="w-6 h-6" />
                </div>

                <div className="min-w-0">
                  <div className="font-semibold text-[#EDEDED] text-sm sm:text-base truncate group-hover:text-teal-300 transition-colors">
                    {report.filename || 'Medical Laboratory Report'}
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-[#71717A] mt-1.5 flex-wrap font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#71717A]" />
                      {new Date(report.created_at || Date.now()).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>

                    <span>•</span>
                    <span className="font-medium text-[#A1A1AA]">
                      {report.statistics.total} findings
                    </span>

                    <span>•</span>
                    <span className="text-emerald-400 font-medium">
                      {report.statistics.normal} normal
                    </span>

                    {report.statistics.low + report.statistics.high > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400 font-medium">
                          {report.statistics.low + report.statistics.high} outside range
                        </span>
                      </>
                    )}

                    {report.statistics.critical > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-rose-400 font-semibold">
                          {report.statistics.critical} critical
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  iconPosition="right"
                >
                  Open report
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#161618] rounded-3xl border border-[#27272A] p-8">
          <EmptyState
            icon={<FileText className="w-7 h-7 text-teal-400" />}
            title="No report history yet"
            description="When you analyze medical laboratory reports, they will be saved here for quick reference during your session."
            actionText="Upload a report"
            onAction={() => navigate('/upload')}
            actionIcon={<UploadCloud className="w-4 h-4" />}
            secondaryActionText="Explore demo report"
            onSecondaryAction={() => navigate('/dashboard')}
          />
        </div>
      )}

      {/* Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
};

