import Layout from '../components/Layout'
import { Upload, FileText, Activity, Sparkles, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { analyzeFile, getDemoReport } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleDemo = async () => {
    setLoading(true)
    try {
      const result = await analyzeFile('demo', 'en')
      navigate(`/report/${result.report_id}`, { state: result })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/80 p-10 shadow-apple flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="bg-gradient-to-br from-primary to-blue-400 p-4 rounded-3xl text-white shadow-apple-lg flex-shrink-0">
            <Sparkles size={40} className="stroke-[2px]" />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-textMain tracking-tight mb-3">Welcome to MedExplain AI</h2>
            <p className="text-textMuted text-lg leading-relaxed max-w-2xl">
              Understand your medical reports in plain, elegant language. Upload a PDF or image of your results, and get instant, clear explanations powered by advanced AI.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/70 backdrop-blur-lg rounded-[28px] border border-white/50 p-6 shadow-apple hover:shadow-apple-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                <Upload size={24} />
              </div>
              <span className="text-textMuted font-medium tracking-wide">Upload Report</span>
            </div>
            <p className="text-3xl font-semibold text-textMain tracking-tight">New</p>
          </div>
          <div className="bg-white/70 backdrop-blur-lg rounded-[28px] border border-white/50 p-6 shadow-apple hover:shadow-apple-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-teal-500/10 p-3 rounded-2xl text-teal-600">
                <FileText size={24} />
              </div>
              <span className="text-textMuted font-medium tracking-wide">Total Reports</span>
            </div>
            <p className="text-3xl font-semibold text-textMain tracking-tight">0</p>
          </div>
          <div className="bg-white/70 backdrop-blur-lg rounded-[28px] border border-white/50 p-6 shadow-apple hover:shadow-apple-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-success/10 p-3 rounded-2xl text-success">
                <Activity size={24} />
              </div>
              <span className="text-textMuted font-medium tracking-wide">System Status</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></div>
              <p className="text-xl font-semibold text-textMain tracking-tight">Ready</p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/80 p-8 shadow-apple relative overflow-hidden">
          <h3 className="text-2xl font-semibold text-textMain tracking-tight mb-2">Get Started Quickly</h3>
          <p className="text-textMuted mb-8 text-lg">Upload your own report or explore our demo to see the MedExplain experience.</p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate('/upload')} className="group flex items-center justify-between gap-4 bg-textMain text-white px-6 py-4 rounded-2xl font-medium hover:bg-black active:scale-[0.98] transition-all shadow-apple-lg w-full sm:w-auto min-w-[200px]">
              <div className="flex items-center gap-3">
                <Upload size={20} />
                <span>Upload File</span>
              </div>
              <ChevronRight size={18} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
            <button onClick={handleDemo} disabled={loading} className="group flex items-center justify-between gap-4 bg-white border-2 border-borderLight/50 text-textMain px-6 py-4 rounded-2xl font-medium hover:border-textMain active:scale-[0.98] transition-all w-full sm:w-auto min-w-[200px]">
              <div className="flex items-center gap-3">
                {loading ? <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div> : <FileText size={20} className="text-primary" />}
                <span>{loading ? 'Analyzing...' : 'Try Demo'}</span>
              </div>
              {!loading && <ChevronRight size={18} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
