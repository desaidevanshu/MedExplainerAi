import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { MedicalDisclaimer } from '../components/ui/MedicalDisclaimer';
import {
  MessageSquareText,
  Send,
  Loader2,
  Trash2,
  Sparkles,
  Stethoscope,
  BookOpen,
  FileText,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { sendChatMessage } from '../api/chat';
import { getLocalReportHistory, getActiveReport, fetchCloudReportHistory } from '../api/storage';
import { ChatMessage, Report } from '../types';
import { animatePageEntrance } from '../utils/animations';

export const Chat: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Initial welcome message
    return [
      {
        id: 'welcome-1',
        role: 'assistant',
        text: 'Hello. I am MedExplain AI. You can ask me questions about medical reports, lab terminology (such as lipid panels, complete blood counts, or metabolic markers), and prepare thoughtful questions for your upcoming doctor visits.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadReports() {
      const cloudReports = await fetchCloudReportHistory();
      if (cloudReports && cloudReports.length > 0) {
        setReports(cloudReports);
      } else {
        const history = getLocalReportHistory();
        setReports(history);
      }
      const active = getActiveReport();
      if (active) {
        setSelectedReportId(active.report_id);
      }
    }
    loadReports();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      animatePageEntrance(containerRef.current);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const suggestedQuestions = [
    'What is the difference between HDL and LDL cholesterol?',
    'What does a high white blood cell count typically indicate?',
    'How do I prepare for a comprehensive metabolic panel blood test?',
    'What questions should I ask my doctor about slightly elevated ALT levels?',
  ];

  const handleSendMessage = async (queryText?: string) => {
    const question = queryText || inputQuestion.trim();
    if (!question) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      report_id: selectedReportId || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuestion('');
    setLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome-1')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await sendChatMessage(question, {
        report_id: selectedReportId || undefined,
        language: currentLanguage.code,
        history: historyPayload,
      });

      const assistantMessage: ChatMessage = {
        id: 'msg-res-' + Date.now(),
        role: 'assistant',
        text: res.answer || 'Thank you for your question. Please discuss any personal medical results with your doctor.',
        sources: res.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        report_id: selectedReportId || undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      showToast(err.message || 'Unable to get response from AI. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        text: 'Conversation cleared. How can I help you understand your health or lab tests today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    showToast('Conversation cleared.', 'info');
  };

  return (
    <div ref={containerRef} className="p-4 sm:p-6 max-w-4xl mx-auto h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] flex flex-col justify-between space-y-4 text-[#EDEDED]">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#27272A] shrink-0">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#EDEDED] tracking-tight flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-400" />
            <span>MedExplain AI Assistant</span>
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Clinical terminology, report analysis, and doctor-visit preparation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Report Context Selector */}
          {reports.length > 0 && (
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="text-xs bg-[#161618] border border-[#27272A] rounded-xl px-2.5 py-1.5 text-[#EDEDED] focus:outline-hidden focus:ring-2 focus:ring-teal-500 max-w-[160px] sm:max-w-xs truncate"
              title="Attach report context"
            >
              <option value="">General Medical Context</option>
              {reports.map((r) => (
                <option key={r.report_id} value={r.report_id}>
                  Context: {r.filename || 'Report'}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            icon={<Trash2 className="w-3.5 h-3.5 text-[#71717A]" />}
            title="Clear Chat"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xl ${isUser
                    ? 'bg-teal-700 text-white rounded-br-xs'
                    : 'bg-[#161618] text-[#EDEDED] border border-[#27272A] rounded-bl-xs'
                  }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 font-bold text-teal-400 text-[10px] mb-2 uppercase tracking-wider font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>MedExplain AI Reasoning</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{m.text}</div>

                {/* Sources list */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#27272A] text-[11px] text-[#A1A1AA] space-y-1">
                    <span className="font-bold text-teal-300 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-teal-400" />
                      Referenced sources:
                    </span>
                    {m.sources.map((s, idx) => (
                      <div key={idx} className="pl-4 truncate text-[#71717A] font-mono text-[10px]">
                        • {s.title || s.name || s.source || 'Medical knowledge index'}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-[#71717A] mt-1 px-1 font-mono">{m.timestamp}</span>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-[#161618] rounded-2xl border border-[#27272A] text-xs text-[#A1A1AA] w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
            <span>Consulting clinical knowledge index...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Questions (only if 1 message) */}
      {messages.length === 1 && (
        <div className="space-y-1.5 shrink-0">
          <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider font-mono">
            Suggested inquiries:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-left p-3 bg-[#161618] rounded-2xl border border-[#27272A] hover:border-teal-500 text-xs text-[#A1A1AA] hover:text-[#EDEDED] hover:bg-[#1D1D20] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Input Form */}
      <div className="shrink-0 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-[#161618] p-2 rounded-3xl border border-[#27272A] shadow-xl focus-within:border-teal-500 transition-all"
        >
          <input
            id="chat-input"
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask a medical question, explain a lab test, or suggest doctor questions..."
            disabled={loading}
            className="flex-1 px-3 py-2 bg-transparent border-none text-xs sm:text-sm text-[#EDEDED] placeholder:text-[#71717A] focus:outline-hidden"
          />
          <Button
            type="submit"
            disabled={!inputQuestion.trim() || loading}
            size="sm"
            icon={<Send className="w-3.5 h-3.5" />}
          >
            Send
          </Button>
        </form>

        <div className="text-[10px] text-[#71717A] text-center flex items-center justify-center gap-1.5 font-mono">
          <ShieldCheck className="w-3 h-3 text-teal-400" />
          <span>Educational guidance only. Always consult a physician for diagnostic advice.</span>
        </div>
      </div>
    </div>
  );
};

