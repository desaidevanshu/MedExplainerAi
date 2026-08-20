import Layout from '../components/Layout'
import { Globe, Save, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useLanguage, LANGUAGES } from '../context/LanguageContext'

export default function Settings() {
  const { language, setLanguage } = useLanguage()
  const [selected, setSelected] = useState(language)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setLanguage(selected)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-textMain tracking-tight mb-2">Settings</h2>
          <p className="text-textMuted text-lg">Manage your preferences and language settings.</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/80 overflow-hidden shadow-apple">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-textMain">Language / भाषा</h3>
                <p className="text-sm text-textMuted">All AI explanations will be generated in this language.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(LANGUAGES).map(([code, cfg]) => (
                <button
                  key={code}
                  onClick={() => setSelected(code)}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.97] ${selected === code
                      ? 'border-primary bg-primary/5 shadow-sm ring-4 ring-primary/10'
                      : 'border-borderLight/60 bg-white/80 hover:border-primary/40 hover:bg-primary/5'
                    }`}
                >
                  <span className="text-base font-bold text-textMain">{cfg.native}</span>
                  <span className="text-xs text-textMuted mt-0.5 font-medium">{cfg.label}</span>
                  {selected === code && (
                    <div className="mt-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/5 px-8 py-5 border-t border-white/50 flex items-center justify-between">
            <p className="text-sm text-textMuted font-medium">
              Current: <span className="text-textMain font-bold">{LANGUAGES[language]?.label}</span>
            </p>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-[0.98] ${saved
                  ? 'bg-success text-white'
                  : 'bg-primary text-white hover:bg-primaryHover'
                }`}
            >
              {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> Save Language</>}
            </button>
          </div>
        </div>

        <p className="text-xs text-textMuted/60 text-center mt-6 font-medium">
          Language preference is saved locally on this device.
        </p>
      </div>
    </Layout>
  )
}
