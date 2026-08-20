import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerWithEmail, signInWithGoogle } from '../services/auth'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerWithEmail(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: '🔬', title: 'Lab Report Analysis', desc: 'Upload any PDF report and get instant clarity' },
    { icon: '🤖', title: 'AI Explanations', desc: '4-6 sentence rich explanations per finding' },
    { icon: '💬', title: 'Ask Questions', desc: 'Chat with AI about your specific results' },
    { icon: '🔒', title: 'Fully Private', desc: 'Your data is encrypted and never shared' },
  ]

  return (
    <div className="min-h-screen flex font-sans overflow-hidden">
      {/* Right form panel (on left visually) */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 bg-background transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="w-full max-w-md">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-primary w-10 h-10 rounded-[14px] flex items-center justify-center shadow-md">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
              </div>
              <span className="font-bold text-xl text-textMain tracking-tight">MedExplain</span>
            </div>
            <h1 className="text-4xl font-bold text-textMain tracking-tight mb-2">Create account</h1>
            <p className="text-textMuted text-lg">Start understanding your health reports today.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-sm font-medium">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-4 bg-white border-2 border-borderLight/60 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 placeholder:text-textMuted/50 hover:border-textMuted/40"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full px-4 py-4 bg-white border-2 border-borderLight/60 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 placeholder:text-textMuted/50 hover:border-textMuted/40"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="relative w-full bg-primary text-white py-4 rounded-2xl text-sm font-bold tracking-wide hover:bg-primaryHover active:scale-[0.99] transition-all duration-200 shadow-lg shadow-primary/25 disabled:opacity-60 mt-2 overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> Creating account...</>
                ) : 'Create Account →'}
              </span>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-200"></div>
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-borderLight/50"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-background text-textMuted text-xs font-semibold uppercase tracking-widest">or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border-2 border-borderLight/80 bg-white text-textMain py-4 rounded-2xl text-sm font-bold hover:border-textMain hover:shadow-md active:scale-[0.99] transition-all duration-200 disabled:opacity-50"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.82-.07-1.61-.2-2.37H12v4.49h5.92a5.37 5.37 0 01-2.33 3.52v2.93h3.78c2.21-2.04 3.49-5.05 3.49-8.57z" fill="#4285F4" />
              <path d="M12 23c3.05 0 5.61-1.01 7.49-2.73l-3.78-2.93c-1.01.68-2.31 1.08-3.71 1.08-2.85 0-5.26-1.92-6.12-4.52H2.18v3.06C3.99 20.52 7.67 23 12 23z" fill="#34A853" />
              <path d="M5.88 14.09a7.32 7.32 0 010-4.18V6.85H2.18C.88 9.29 0 12 0 14.85s.88 5.56 2.18 8.01l3.7-2.93z" fill="#FBBC05" />
              <path d="M12 4.58c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.67 0 3.99 2.48 2.18 6.15l3.7 2.93c.86-2.6 3.27-4.5 6.12-4.5z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-textMuted mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline underline-offset-2">
              Sign in →
            </Link>
          </p>
        </div>
      </div>

      {/* Left visual panel */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex-col items-center justify-center p-16 overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -top-32 -right-32 animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute w-[400px] h-[400px] bg-blue-400/15 rounded-full blur-[120px] bottom-0 left-0 animate-[pulse_10s_ease-in-out_infinite_1s]"></div>

        <div className="relative z-10 w-full max-w-sm">
          <p className="text-white/50 text-sm font-bold uppercase tracking-widest mb-4">Why MedExplain?</p>
          <h2 className="text-4xl font-bold text-white tracking-tight leading-snug mb-10">Everything you need <br /><span className="text-primary">to understand your health.</span></h2>

          <div className="space-y-5">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-white/20 transition-all duration-300">
                  {f.icon}
                </div>
                <div>
                  <div className="text-white font-bold text-base">{f.title}</div>
                  <div className="text-white/50 text-sm mt-0.5 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#16213e]" style={{ backgroundColor: c }}></div>
                ))}
              </div>
              <div className="text-white/60 text-sm"><span className="text-white font-bold">1,000+</span> patients trust MedExplain</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
