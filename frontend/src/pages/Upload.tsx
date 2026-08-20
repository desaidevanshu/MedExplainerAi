import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Upload as UploadIcon, FileText, CheckCircle2, FileUp } from 'lucide-react'
import { uploadFile, analyzeFile } from '../services/api'
import { useLanguage } from '../context/LanguageContext'

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { language } = useLanguage()

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }, [])

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const up = await uploadFile(file)
      const analysis = await analyzeFile(up.file_id, language)
      navigate(`/report/${analysis.report_id}`, { state: analysis })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload or analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-textMain tracking-tight mb-4">Upload Report</h2>
          <p className="text-textMuted text-lg max-w-2xl mx-auto">
            Securely upload a PDF or image format of your blood report. Our system extracts the data and provides a crystal-clear explanation instantly.
          </p>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="bg-white/60 backdrop-blur-xl border-2 border-dashed border-borderLight rounded-[32px] p-16 text-center hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer shadow-apple group relative overflow-hidden"
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="bg-white shadow-apple-lg w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:-translate-y-2 transition-all duration-300 z-10 relative">
            <FileUp className="text-primary" size={36} strokeWidth={1.5} />
          </div>
          <p className="text-textMain font-semibold text-xl tracking-tight z-10 relative">Drop your file here to start</p>
          <p className="text-textMuted text-sm mt-2 mb-6 z-10 relative">or click to browse your computer</p>

          <div className="inline-flex gap-4">
            <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-textMuted shadow-sm border border-borderLight/50">PDF</span>
            <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-textMuted shadow-sm border border-borderLight/50">JPG</span>
            <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-textMuted shadow-sm border border-borderLight/50">PNG</span>
          </div>

          <input
            id="file-input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {file && (
          <div className="mt-8 bg-white/80 backdrop-blur-2xl rounded-[24px] border border-borderLight/60 p-6 shadow-apple-lg flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-bottom-2 fade-in">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="bg-blue-500/10 p-4 rounded-2xl shrink-0">
                <FileText className="text-primary" size={28} strokeWidth={1.5} />
              </div>
              <div className="truncate">
                <p className="font-semibold text-textMain tracking-tight truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                <p className="text-sm text-textMuted mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full md:w-auto bg-textMain text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-black active:scale-[0.98] transition-all shadow-md disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> Extracting...</>
              ) : (
                <><CheckCircle2 size={18} /> Analyze Document</>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm text-center shadow-sm animate-in fade-in">
            {error}
          </div>
        )}
      </div>
    </Layout>
  )
}
