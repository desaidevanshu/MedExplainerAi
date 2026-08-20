import { useState } from 'react'
import Layout from '../components/Layout'
import { chat } from '../services/api'
import { MessageCircle, Send, Bot, UserCircle, Zap } from 'lucide-react'

export default function AiChat() {
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', text: string }>>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSend = async () => {
        if (!input.trim() || loading) return
        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', text: userMsg }])
        setLoading(true)
        try {
            const res = await chat(userMsg, undefined, 'en', messages.slice(-5))
            setMessages(prev => [...prev, { role: 'assistant', text: res.answer || 'I could not find enough information to answer that.' }])
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I could not answer that right now. Please try again later.' }])
        } finally {
            setLoading(false)
        }
    }

    const suggestedQuestions = [
        "What does low hemoglobin usually indicate?",
        "What are normal RBC count ranges?",
        "What lifestyle changes help with high cholesterol?",
        "What is a CBC blood test?",
    ]

    return (
        <Layout>
            <div className="max-w-3xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">

                <div className="text-center mb-8">
                    <div className="bg-gradient-to-tr from-primary to-blue-400 w-16 h-16 rounded-[22px] flex items-center justify-center mx-auto mb-4 shadow-apple-lg">
                        <Bot size={36} className="text-white" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-4xl font-bold text-textMain tracking-tight mb-2">AI Assistant</h2>
                    <p className="text-textMuted text-lg">Ask any question about your medical results or general health info.</p>
                </div>

                {/* Chat Window */}
                <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-[32px] border border-white shadow-apple-lg flex flex-col overflow-hidden" style={{ minHeight: '500px' }}>

                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center gap-4 py-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                                    {suggestedQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setInput(q); }}
                                            className="bg-white/80 border border-borderLight/70 rounded-[18px] p-4 text-left text-sm font-medium text-textMain hover:border-primary hover:bg-primary/5 transition-all active:scale-[0.98] shadow-sm group"
                                        >
                                            <Zap size={14} className="text-primary mb-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <div key={i} className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-primary' : 'bg-black/5 border border-borderLight/50'
                                    }`}>
                                    {m.role === 'user'
                                        ? <UserCircle size={20} className="text-white" strokeWidth={1.5} />
                                        : <Bot size={20} className="text-textMuted" strokeWidth={1.5} />
                                    }
                                </div>
                                <div className={`max-w-[80%] rounded-[20px] p-5 text-sm leading-relaxed font-medium ${m.role === 'user'
                                    ? 'bg-primary text-white rounded-tr-sm shadow-sm'
                                    : 'bg-white border border-borderLight/50 text-textMain rounded-tl-sm shadow-apple'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-black/5 border border-borderLight/50 flex items-center justify-center">
                                    <Bot size={20} className="text-textMuted" strokeWidth={1.5} />
                                </div>
                                <div className="bg-white border border-borderLight/50 rounded-[20px] rounded-tl-sm p-5 shadow-apple flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white/50 border-t border-black/5">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask anything about your health..."
                                className="w-full pl-5 pr-14 py-4 bg-white border border-borderLight/80 rounded-[20px] text-sm font-medium focus:outline-none focus:ring-[3px] focus:ring-primary/20 focus:border-primary transition-all shadow-sm placeholder:text-textMuted/60"
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="absolute right-2 bg-primary text-white p-3 rounded-2xl hover:bg-primaryHover active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
                            >
                                <Send size={16} strokeWidth={2.5} className="ml-0.5" />
                            </button>
                        </div>
                        <p className="text-xs text-textMuted/50 text-center mt-3 font-medium">MedExplain AI provides educational information only. Always consult a healthcare professional.</p>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
