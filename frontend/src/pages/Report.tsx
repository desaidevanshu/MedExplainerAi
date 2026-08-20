import { useParams, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import { useState, useEffect } from 'react'
import { analyzeFile, chat } from '../services/api'
import { FileText, MessageCircle, Send, AlertCircle, CheckCircle2, AlertTriangle, Sparkles, ChevronDown } from 'lucide-react'

export default function Report() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const [report, setReport] = useState<any>(location.state || null)
  const [loading, setLoading] = useState(!location.state)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', text: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  useEffect(() => {
    if (id && !report && !location.state) {
      setLoading(true)
      analyzeFile(id)
        .then(setReport)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [id, report, location.state])

  const handleChat = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setChatLoading(true)
    try {
      const res = await chat(userMsg, id)
      setChatMessages(prev => [...prev, { role: 'user', text: userMsg }, { role: 'assistant', text: res.answer || 'I could not find enough information to answer that.' }])
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I could not answer that right now. Please try again later.' }])
    } finally {
      setChatLoading(false)
    }
  }

  if (loading && !report) return <Layout><div className="flex items-center justify-center h-64 text-textMuted animate-pulse font-medium">Analyzing document securely...</div></Layout>
  if (!report) return <Layout><div className="text-danger font-medium p-8">Report not found or could not be loaded.</div></Layout>

  const stats = report.statistics || {}

  const statusConfig: Record<string, { color: string, bg: string, icon: any, border: string }> = {
    NORMAL: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', icon: CheckCircle2 },
    LOW: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', icon: AlertTriangle },
    HIGH: { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20', icon: AlertCircle },
    CRITICAL: { color: 'text-danger', bg: 'bg-danger/15', border: 'border-danger/30', icon: AlertCircle },
    UNKNOWN: { color: 'text-textMuted', bg: 'bg-black/5', border: 'border-black/5', icon: AlertCircle },
  }

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2.5 rounded-[14px] text-primary">
              <Sparkles size={24} />
            </div>
            <h2 className="text-3xl font-bold text-textMain tracking-tight">Report Insights</h2>
          </div>
          <p className="text-textMuted">Analyzed securely on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Summary Card */}
        <div className="bg-white/70 backdrop-blur-3xl rounded-[32px] border border-white p-8 shadow-apple-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none"></div>
          <h3 className="text-xl font-semibold text-textMain mb-3 tracking-tight">Executive Summary</h3>
          <p className="text-textMain/80 leading-relaxed text-lg font-medium">{report.summary || 'Your report has been analyzed. Review the detailed findings below.'}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { label: 'Total Tested', value: stats.total || 0, color: 'text-textMain' },
            { label: 'Normal', value: stats.normal || 0, color: 'text-success' },
            { label: 'Low', value: stats.low || 0, color: 'text-warning' },
            { label: 'High', value: stats.high || 0, color: 'text-danger' },
            { label: 'Critical', value: stats.critical || 0, color: 'text-danger' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white/50 backdrop-blur-lg rounded-[24px] p-6 border border-white shadow-apple text-center flex flex-col justify-center transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden group">
              <div className={`absolute inset-0 bg-current opacity-0 group-hover:opacity-[0.02] transition-opacity ${item.color}`}></div>
              <p className="text-xs font-bold uppercase tracking-widest text-textMuted mb-2">{item.label}</p>
              <p className={`text-4xl font-bold tracking-tight ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Overall Outcome Card */}
        {report.overall_outcome && (
          <div className="bg-gradient-to-br from-primary/10 via-blue-50 to-white border border-primary/20 backdrop-blur-xl rounded-[32px] p-8 shadow-apple-lg mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary text-white p-2.5 rounded-2xl shadow-sm">
                <Sparkles size={22} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-textMain tracking-tight">Overall Assessment</h3>
            </div>
            <p className="text-textMain leading-relaxed text-base font-medium relative z-10 max-w-4xl">{report.overall_outcome}</p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Findings List */}
          <div className="xl:col-span-2 space-y-6">
            <h3 className="text-2xl font-bold text-textMain tracking-tight mb-4 px-2">Detailed Findings</h3>

            <div className="space-y-4">
              {report.findings?.map((f: any, i: number) => {
                const cfg = statusConfig[f.status] || statusConfig.UNKNOWN
                const Icon = cfg.icon
                const isExpanded = expandedCard === i
                const hasDetails = f.explanation || f.possible_significance || (f.doctor_questions && f.doctor_questions.length > 0)

                return (
                  <div key={i} className={`bg-white/80 backdrop-blur-xl rounded-[28px] border border-white shadow-apple overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary/20 shadow-apple-xl' : 'hover:shadow-apple-lg'}`}>

                    {/* Card Header (Always Visible) */}
                    <div
                      className={`p-6 ${hasDetails ? 'cursor-pointer select-none' : ''}`}
                      onClick={() => hasDetails && setExpandedCard(isExpanded ? null : i)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-textMain text-xl tracking-tight capitalize">{f.name.toLowerCase()}</h4>
                            <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
                              <Icon size={14} strokeWidth={2.5} /> {f.status}
                            </span>
                          </div>

                          <div className="flex items-baseline gap-3 mt-1">
                            <span className="text-2xl font-semibold text-textMain tracking-tight">
                              {f.value} <span className="text-sm text-textMuted font-medium">{f.unit}</span>
                            </span>
                            <span className="text-sm font-medium text-textMuted/70 border-l border-borderLight pl-3">
                              Reference: {f.reference_range}
                            </span>
                          </div>
                        </div>

                        {hasDetails && (
                          <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-primary/5 text-primary' : 'bg-black/5 text-textMuted hover:bg-black/10'}`}>
                            <ChevronDown size={20} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {hasDetails && (
                      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-6 pb-6 pt-2 border-t border-black/5 mt-2 bg-gradient-to-b from-transparent to-black/[0.01]">
                          <div className="grid gap-4 mt-4">

                            {f.explanation && (
                              <div className="bg-primary/5 border border-primary/10 rounded-[20px] p-5">
                                <h5 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">What this means</h5>
                                <p className="text-textMain leading-relaxed font-medium">{f.explanation}</p>
                              </div>
                            )}

                            {f.possible_significance && (
                              <div className="bg-warning/10 border border-warning/20 rounded-[20px] p-5">
                                <h5 className="text-xs font-bold uppercase tracking-widest text-warning mb-2">Possible Significance</h5>
                                <p className="text-textMain leading-relaxed font-medium">{f.possible_significance}</p>
                              </div>
                            )}

                            {f.doctor_questions?.length > 0 && (
                              <div className="bg-indigo-50 border border-indigo-100 rounded-[20px] p-5">
                                <h5 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Questions for your doctor</h5>
                                <ul className="space-y-2">
                                  {f.doctor_questions.map((q: string, j: number) => (
                                    <li key={j} className="flex gap-3 text-textMain font-medium">
                                      <span className="text-indigo-400 mt-1 uppercase text-[10px] font-black">•</span>
                                      <span className="leading-relaxed">{q}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* AI Chat Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] border border-white shadow-apple h-[800px] flex flex-col sticky top-8">

              <div className="p-6 border-b border-black/5 flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <MessageCircle size={20} strokeWidth={2} />
                </div>
                <h3 className="font-semibold text-textMain text-lg tracking-tight">Ask MedExplain</h3>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {chatMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                    <MessageCircle size={48} className="text-borderLight" strokeWidth={1} />
                    <p className="text-sm font-medium text-textMuted max-w-[200px]">Ask anything about your results. E.g. "What does low hemoglobin mean?"</p>
                  </div>
                )}

                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-[20px] p-4 text-sm font-medium leading-relaxed ${m.role === 'user'
                      ? 'bg-primary text-white rounded-br-sm shadow-sm'
                      : 'bg-black/5 text-textMain rounded-bl-sm border border-black/5'
                      }`}>
                      {m.text}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-black/5 border border-black/5 rounded-[20px] rounded-bl-sm p-4 flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white/50 border-t border-black/5 rounded-b-[32px]">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Ask a question..."
                    className="w-full pl-5 pr-12 py-4 bg-white border border-borderLight/80 rounded-[20px] text-sm font-medium focus:outline-none focus:ring-[3px] focus:ring-primary/20 focus:border-primary transition-all shadow-sm placeholder:text-textMuted/60"
                  />
                  <button
                    onClick={handleChat}
                    disabled={chatLoading || !chatInput.trim()}
                    className="absolute right-2 bg-primary text-white p-2.5 rounded-2xl hover:bg-primaryHover active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
                  >
                    <Send size={16} strokeWidth={2.5} className="ml-0.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        <div className="mt-12 text-center pb-8">
          <p className="text-xs font-medium text-textMuted/60 mb-2 uppercase tracking-widest">Medical Disclaimer</p>
          <p className="text-xs text-textMuted max-w-2xl mx-auto">{report.disclaimer}</p>
        </div>

      </div>
    </Layout>
  )
}
