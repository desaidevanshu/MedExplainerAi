import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProcessingSequence } from '../components/ui/ProcessingSequence';
import { MedicalDisclaimer } from '../components/ui/MedicalDisclaimer';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Globe,
} from 'lucide-react';
import {
  uploadReportFile,
  validateMedicalFile,
  ACCEPTED_FILE_EXTENSIONS,
} from '../api/upload';
import { analyzeReportFile } from '../api/analysis';
import { analyzeDemoReport } from '../api/demo';
import { saveReportToLocalHistory } from '../api/storage';

export const Upload: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState<boolean>(false);
  const [selectedReportType, setSelectedReportType] = useState<string>('AUTO');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    setErrorMsg(null);
    const validation = validateMedicalFile(selectedFile);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid file format.');
      showToast(validation.error || 'Invalid file', 'error');
      return;
    }
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartAnalysis = async () => {
    if (!file) {
      showToast('Please select a medical report file first.', 'warning');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // 1. Upload to backend
      const uploadResult = await uploadReportFile(file);

      // 2. Analyze using file_id and chosen language
      const targetParam = selectedReportType !== 'AUTO' ? selectedReportType : undefined;
      const report = await analyzeReportFile(uploadResult.file_id, currentLanguage.code, targetParam);
      report.filename = file.name;

      // 3. Save to local storage history
      saveReportToLocalHistory(report);

      showToast('Analysis completed successfully.', 'success');
      navigate(`/report/${report.report_id}`);
    } catch (err: any) {
      const msg = err.message || 'We could not process that file. Please verify the format and try again.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExploreDemo = async () => {
    setDemoLoading(true);
    try {
      const demoReport = await analyzeDemoReport(currentLanguage.code);
      saveReportToLocalHistory(demoReport);
      showToast('Sample report loaded.', 'success');
      navigate(`/report/${demoReport.report_id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to load demo report.', 'error');
    } finally {
      setDemoLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isProcessing) {
    return (
      <div className="p-6 sm:p-12 flex items-center justify-center min-h-[70vh]">
        <ProcessingSequence filename={file?.name} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 text-[#EDEDED]">
      {/* Header */}
      <div className="pb-2 border-b border-[#27272A]">
        <h1 className="text-xl sm:text-2xl font-bold text-[#EDEDED] tracking-tight">
          Upload Medical Laboratory Report
        </h1>
        <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
          Upload blood panels, pathology summaries, or diagnostic tests for plain-language interpretation.
        </p>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Analysis Issue</span>
              <span>{errorMsg}</span>
            </div>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-red-400 hover:text-red-200 p-1"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Drag-Drop Bento Box */}
      <div
        id="upload-dropzone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
        className={`bg-[#161618] rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer shadow-xl ${dragActive
            ? 'border-teal-500 bg-teal-950/30 ring-4 ring-teal-500/20'
            : file
              ? 'border-[#3F3F46] bg-[#161618]'
              : 'border-[#27272A] hover:border-teal-500/60 hover:bg-[#1D1D20]'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          onChange={handleFileChange}
          className="hidden"
          id="medical-file-input"
        />

        {!file ? (
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-teal-950/80 border border-teal-800/80 text-teal-400 flex items-center justify-center mx-auto shadow-lg">
              <UploadCloud className="w-8 h-8 text-teal-400" />
            </div>

            <div>
              <div className="font-bold text-[#EDEDED] text-base">
                Click to browse or drag and drop your report
              </div>
              <p className="text-xs text-[#71717A] mt-1 font-mono">
                Supported formats: PDF, JPG, PNG (up to 15 MB)
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Select file from device
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#1D1D20] rounded-2xl border border-[#27272A] text-left">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-teal-950/90 border border-teal-800 text-teal-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-[#EDEDED] truncate">
                    {file.name}
                  </div>
                  <div className="text-[11px] text-[#71717A] font-mono">
                    {formatFileSize(file.size)} • {file.type || 'Document'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="p-2 rounded-xl text-[#71717A] hover:text-red-400 hover:bg-[#27272A] transition-colors"
                title="Remove file"
                aria-label="Remove selected file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Analysis Language selection */}
            <div className="flex items-center justify-between text-xs text-[#A1A1AA] px-1">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                Analysis explanation language:
              </span>
              <span className="font-mono font-semibold text-teal-300 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-800/80">
                {currentLanguage.name} ({currentLanguage.nativeName})
              </span>
            </div>

            {/* Target Profile Overrider */}
            <div className="flex items-center justify-between text-xs text-[#A1A1AA] px-1 mt-2">
              <span className="flex items-center gap-1.5 font-bold">
                <FileText className="w-3.5 h-3.5 text-teal-400" />
                Target Analysis Profile:
              </span>
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="bg-teal-950/80 text-teal-300 font-mono font-semibold border border-teal-800/80 rounded-xl px-2 py-1 outline-hidden"
              >
                <option value="AUTO">Auto-scan entire file</option>
                <option value="Complete Blood Count CBC">CBC (Complete Blood)</option>
                <option value="Urine Urinalysis">Urine Routine</option>
                <option value="Metabolic Electrolyte">Metabolic Panel</option>
                <option value="Lipid Profile">Lipid Profile</option>
                <option value="Thyroid TSH">Thyroid Function</option>
              </select>
            </div>

            {/* Trigger Button */}
            <div className="pt-2">
              <Button
                id="analyze-trigger-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartAnalysis();
                }}
                className="w-full font-bold"
                size="md"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Analyze report with MedExplain AI
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Demo helper Bento Card */}
      <div className="p-5 bg-[#161618] rounded-3xl border border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xl">
        <div className="flex items-center gap-3 text-[#A1A1AA]">
          <div className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center shrink-0 text-teal-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>Don't have a report at hand? Explore our pre-analyzed sample laboratory report.</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExploreDemo}
          loading={demoLoading}
          className="shrink-0 w-full sm:w-auto"
        >
          Try sample demo
        </Button>
      </div>

      {/* Medical disclaimer note */}
      <MedicalDisclaimer />
    </div>
  );
};

