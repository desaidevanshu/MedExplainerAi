import Layout from '../components/Layout'
import { FileText, Inbox } from 'lucide-react'

export default function History() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-textMain tracking-tight mb-2">History</h2>
          <p className="text-textMuted text-lg">View your past report analyses.</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/80 p-16 text-center shadow-apple">
          <div className="bg-textMain/5 w-24 h-24 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Inbox className="text-textMuted" size={40} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold text-textMain tracking-tight mb-2">No reports yet</h3>
          <p className="text-textMuted max-w-sm mx-auto">
            Upload your first medical report to see it appear here safely and securely.
          </p>
        </div>
      </div>
    </Layout>
  )
}
