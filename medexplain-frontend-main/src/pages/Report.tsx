import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { FindingCard } from '../components/ui/FindingCard';
import { MedicalDisclaimer } from '../components/ui/MedicalDisclaimer';
import { SourcesList } from '../components/ui/SourcesList';
import { Drawer } from '../components/ui/Drawer';
import { ReportSkeleton } from '../components/ui/Skeleton';
import {
  FileText,
  MessageSquareText,
  Printer,
  Share2,
  Sparkles,
  Search,
  Filter,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Info,
  ShieldCheck,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { getReportById, saveReportToLocalHistory, fetchCloudReportById } from '../api/storage';
import { sendChatMessage } from '../api/chat';
import { analyzeDemoReport } from '../api/demo';
import { Report as ReportType, Finding, ChatMessage, FindingStatus } from '../types';
import { animatePageEntrance, animateChatMessage } from '../utils/animations';

export const Report: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentLanguage } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [report, setReport] = useState<ReportType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Report-specific AI Chat drawer state
  const [chatDrawerOpen, setChatDrawerOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      if (!id) {
        setLoading(false);
        return;
      }

      // Look up in client local storage / active session
      let found: ReportType | null = getReportById(id);

      if (!found) {
        found = await fetchCloudReportById(id);
      }

      if (!found && id === 'demo') {
        // Fallback demo generation if user directly navigated to demo id or fresh tab
        try {
          found = await analyzeDemoReport(currentLanguage.code);
          saveReportToLocalHistory(found);
        } catch {
          // not found
        }
      }

      setReport(found);
      setLoading(false);
    };

    loadReport();
  }, [id, currentLanguage.code]);

  useEffect(() => {
    if (report && containerRef.current) {
      animatePageEntrance(containerRef.current);
    }
  }, [report]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatLoading]);

  // Suggested questions based on the actual report findings
  const suggestedQuestions = useMemo(() => {
    if (!report || !report.findings) return [];
    const questions: string[] = [];

    const abnormal = report.findings.filter(
      (f) => f.status === 'LOW' || f.status === 'HIGH' || f.status === 'CRITICAL'
    );

    if (abnormal.length > 0) {
      questions.push(`What does my ${abnormal[0].name} result indicate?`);
      if (abnormal.length > 1) {
        questions.push(`Which results in this report are outside standard reference intervals?`);
      }
    } else {
      questions.push(`Can you summarize the general health findings in this report?`);
    }

    questions.push(`What questions should I ask my healthcare provider at my next visit?`);
    questions.push(`Explain the reference ranges in simple terms.`);

    return questions.slice(0, 3);
  }, [report]);

  const handleSendMessage = async (questionText?: string) => {
    const query = questionText || inputQuestion.trim();
    if (!query || !report) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      report_id: report.report_id,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setChatLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await sendChatMessage(query, {
        report_id: report.report_id,
        language: currentLanguage.code,
        history: historyPayload,
      });

      const assistantMsg: ChatMessage = {
        id: 'msg-res-' + Date.now(),
        role: 'assistant',
        text: res.answer,
        sources: res.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        report_id: report.report_id,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      showToast(err.message || 'Failed to receive AI response. Please try again.', 'error');
    } finally {
      setChatLoading(false);
    }
  };

  const handleAskAboutFinding = (findingName: string) => {
    setChatDrawerOpen(true);
    handleSendMessage(`Can you explain my ${findingName} result in plain language and what questions I should ask my doctor?`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareSummary = () => {
    if (!report) return;
    const textToCopy = `MedExplain AI Report Summary:\n\n${report.summary}\n\nDisclaimer: Educational information only. Does not replace professional medical advice.`;
    navigator.clipboard?.writeText(textToCopy);
    showToast('Report summary copied to clipboard.', 'success');
  };

  // Filtered findings list
  const filteredFindings = useMemo(() => {
    if (!report) return [];
    return report.findings.filter((finding) => {
      const section = finding.section || 'General';
      if (selectedCategory !== 'ALL' && section !== selectedCategory) return false;

      const matchesSearch =
        finding.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (finding.explanation && finding.explanation.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedStatusFilter === 'ALL') return true;
      if (selectedStatusFilter === 'ABNORMAL') {
        return finding.status === 'LOW' || finding.status === 'HIGH' || finding.status === 'CRITICAL';
      }
      return finding.status === selectedStatusFilter;
    });
  }, [report, searchQuery, selectedStatusFilter, selectedCategory]);

  const uniqueCategories = useMemo(() => {
    if (!report) return [];
    const cats = new Set(report.findings.map(f => f.section || 'General'));
    return Array.from(cats).sort();
  }, [report]);

  if (loading) {
    return (
      <div className="p-4 sm:p-8">
        <ReportSkeleton />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#161618] border border-[#27272A] flex items-center justify-center mx-auto text-[#71717A]">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#EDEDED]">Report not found</h2>
        <p className="text-xs text-[#A1A1AA]">
          The requested medical report was not found in your current session.
        </p>
        <Button onClick={() => navigate('/upload')} size="sm">
          Upload a new report
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 text-[#EDEDED]">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#27272A]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl text-[#71717A] hover:text-[#EDEDED] hover:bg-[#161618] border border-transparent hover:border-[#27272A] transition-all"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-[#EDEDED] tracking-tight">
                {report.filename || 'Medical Laboratory Report'}
              </h1>
              {report.extraction_method && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1D1D20] text-teal-300 border border-[#27272A] font-mono">
                  {report.extraction_method.replace('_', ' ')}
                </span>
              )}
            </div>
            <div className="text-xs text-[#71717A] mt-0.5 font-mono">
              Analyzed {new Date(report.created_at || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            id="open-report-chat-btn"
            onClick={() => setChatDrawerOpen(true)}
            variant="primary"
            size="sm"
            icon={<MessageSquareText className="w-3.5 h-3.5" />}
          >
            Ask AI Assistant
          </Button>

          <Button
            onClick={handleShareSummary}
            variant="outline"
            size="sm"
            icon={<Share2 className="w-3.5 h-3.5" />}
            title="Copy summary"
          >
            Share
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            icon={<Printer className="w-3.5 h-3.5" />}
            title="Print report"
          >
            Print
          </Button>
        </div>
      </div>

      {/* Executive Summary Bento Card */}
      <Card id="executive-summary-card" className="bg-[#161618] border-[#27272A]">
        <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Executive Clinical Summary</span>
        </div>

        <p className="text-[#EDEDED] text-sm leading-relaxed">
          {report.summary || 'Summary of clinical observations and laboratory evaluations.'}
        </p>

        {report.overall_outcome && (
          <div className="mt-4 pt-3 border-t border-[#27272A] flex items-start gap-2.5 text-xs text-[#A1A1AA]">
            <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#EDEDED] block mb-0.5">
                Overall Assessment Note:
              </span>
              <span>{report.overall_outcome}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Statistics Cards Bento Grid */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center justify-between">
          <span>Laboratory Findings Distribution</span>
          <span className="text-[10px] text-[#71717A] font-mono normal-case">Click a tile to filter results</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <StatCard
            label="Total Tests"
            count={report.statistics.total}
            type="total"
            active={selectedStatusFilter === 'ALL'}
            onClick={() => setSelectedStatusFilter('ALL')}
          />
          <StatCard
            label="Normal"
            count={report.statistics.normal}
            type="normal"
            active={selectedStatusFilter === 'NORMAL'}
            onClick={() => setSelectedStatusFilter('NORMAL')}
          />
          <StatCard
            label="Low"
            count={report.statistics.low}
            type="low"
            active={selectedStatusFilter === 'LOW'}
            onClick={() => setSelectedStatusFilter('LOW')}
          />
          <StatCard
            label="High"
            count={report.statistics.high}
            type="high"
            active={selectedStatusFilter === 'HIGH'}
            onClick={() => setSelectedStatusFilter('HIGH')}
          />
          <StatCard
            label="Critical"
            count={report.statistics.critical}
            type="critical"
            active={selectedStatusFilter === 'CRITICAL'}
            onClick={() => setSelectedStatusFilter('CRITICAL')}
          />
          <StatCard
            label="Undetermined"
            count={report.statistics.unknown}
            type="unknown"
            active={selectedStatusFilter === 'UNKNOWN'}
            onClick={() => setSelectedStatusFilter('UNKNOWN')}
          />
        </div>
      </div>

      {/* Filter and Search Bar for Findings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test names or clinical meanings..."
            className="w-full pl-9 pr-3 py-2 bg-[#161618] border border-[#27272A] rounded-2xl text-xs text-[#EDEDED] placeholder:text-[#71717A] focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedStatusFilter === 'ALL'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-[#161618] text-[#A1A1AA] border border-[#27272A] hover:bg-[#1D1D20] hover:text-[#EDEDED]'
              }`}
          >
            All Health ({report.findings.length})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('ABNORMAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedStatusFilter === 'ABNORMAL'
              ? 'bg-amber-800 text-white shadow-sm'
              : 'bg-[#161618] text-[#A1A1AA] border border-[#27272A] hover:bg-[#1D1D20] hover:text-[#EDEDED]'
              }`}
          >
            Abnormal ({report.statistics.low + report.statistics.high + report.statistics.critical})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('NORMAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedStatusFilter === 'NORMAL'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-[#161618] text-[#A1A1AA] border border-[#27272A] hover:bg-[#1D1D20] hover:text-[#EDEDED]'
              }`}
          >
            Normal ({report.statistics.normal})
          </button>
        </div>
      </div>

      {/* Category Section Filters */}
      {uniqueCategories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCategory === 'ALL'
              ? 'bg-[#E4E4E7] text-[#09090B]'
              : 'bg-[#1D1D20] text-[#A1A1AA] border border-[#27272A] hover:bg-[#27272A]'
              }`}
          >
            Show All Categories
          </button>
          {uniqueCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat
                ? 'bg-[#E4E4E7] text-[#09090B]'
                : 'bg-[#1D1D20] text-[#A1A1AA] border border-[#27272A] hover:bg-[#27272A]'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Findings List */}
      <div className="space-y-6">
        {filteredFindings.length > 0 ? (
          (Object.entries(
            filteredFindings.reduce((acc, finding) => {
              const section = finding.section || 'General';
              if (!acc[section]) acc[section] = [];
              acc[section].push(finding);
              return acc;
            }, {} as Record<string, Finding[]>)
          ) as [string, Finding[]][]).map(([section, items]) => (
            <div key={section} className="space-y-3">
              <h3 className="text-sm font-bold text-teal-400 border-b border-[#27272A] pb-2 tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {section}
              </h3>
              <div className="space-y-3">
                {items.map((finding, idx) => (
                  <FindingCard
                    key={`${finding.name}-${idx}`}
                    finding={finding}
                    onAskAi={handleAskAboutFinding}
                    defaultExpanded={idx === 0 || finding.status === 'CRITICAL'}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-[#161618] rounded-3xl border border-[#27272A] text-xs text-[#71717A]">
            No findings match your active filter.
          </div>
        )}
      </div>

      {/* Referenced Sources */}
      {report.sources && report.sources.length > 0 && (
        <SourcesList sources={report.sources} />
      )}

      {/* Educational Medical Disclaimer */}
      <MedicalDisclaimer customText={report.disclaimer} />

      {/* Report AI Assistant Drawer */}
      <Drawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        title="MedExplain AI Assistant"
        subtitle={`Discussing ${report.filename || 'this report'}`}
        width="lg"
      >
        <div className="flex-1 flex flex-col justify-between space-y-4">
          {/* Messages list */}
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="p-4 bg-[#1D1D20] rounded-2xl border border-[#27272A] text-xs text-[#A1A1AA] space-y-3">
                <div className="flex items-center gap-2 font-bold text-[#EDEDED]">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>Ask questions about your report</span>
                </div>
                <p className="leading-relaxed">
                  I can help you understand test results, explain clinical terms, or suggest questions for your next doctor's appointment.
                </p>

                {/* Suggested questions */}
                <div className="pt-2 space-y-1.5">
                  <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider font-mono">
                    Suggested prompts:
                  </div>
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q)}
                      className="w-full text-left p-2.5 rounded-xl bg-[#161618] border border-[#27272A] hover:border-teal-500 text-xs text-[#EDEDED] hover:text-teal-300 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${m.role === 'user'
                      ? 'bg-teal-700 text-white rounded-br-xs'
                      : 'bg-[#1D1D20] text-[#EDEDED] rounded-bl-xs border border-[#27272A]'
                      }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>

                    {/* Sources inside message */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#27272A] text-[11px] text-[#A1A1AA] space-y-1">
                        <span className="font-bold text-teal-400 block">Sources:</span>
                        {m.sources.map((s, idx) => (
                          <div key={idx} className="truncate">
                            • {s.title || s.name || s.source}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#71717A] mt-1 px-1 font-mono">{m.timestamp}</span>
                </div>
              ))
            )}

            {chatLoading && (
              <div className="flex items-center gap-2 p-3 bg-[#1D1D20] rounded-xl text-xs text-[#A1A1AA] w-fit border border-[#27272A]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                <span>Formulating calm clinical explanation...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <div className="pt-3 border-t border-[#27272A]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Ask about these results or lab values..."
                disabled={chatLoading}
                className="flex-1 px-3.5 py-2.5 bg-[#161618] border border-[#27272A] rounded-2xl text-xs sm:text-sm text-[#EDEDED] placeholder:text-[#71717A] focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
              <Button
                type="submit"
                size="md"
                disabled={!inputQuestion.trim() || chatLoading}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Send
              </Button>
            </form>
            <div className="mt-2 text-[10px] text-[#71717A] text-center font-mono">
              Educational reference only • Does not provide a formal medical diagnosis
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

