import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginWithEmail, signInWithGoogle } from '../services/auth'

export default function Login() {
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
      await loginWithEmail(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
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

  return (
    <div className="min-h-screen flex font-sans overflow-hidden">
      {/* Left visual panel */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-[#0055FF] via-[#005AE0] to-[#0040AA] flex-col items-center justify-center p-16 overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] -top-32 -left-32 animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute w-[400px] h-[400px] bg-[#00AAFF]/20 rounded-full blur-[100px] bottom-0 right-0 animate-[pulse_10s_ease-in-out_infinite_1s]"></div>
        <div className="absolute w-[300px] h-[300px] bg-white/5 rounded-full blur-[60px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[pulse_6s_ease-in-out_infinite_2s]"></div>

        {/* Floating card decorations */}
        <div className="absolute top-20 right-12 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 rotate-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#34C759] rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
            <div>
              <div className="text-white text-xs font-semibold">All Results Analyzed</div>
              <div className="text-white/60 text-xs">52 biomarkers</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-32 left-12 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 -rotate-2 shadow-lg">
          <div className="text-white/80 text-xs font-medium">💡 AI-powered insights</div>
          <div className="text-white text-sm font-bold mt-1">Instant explanations</div>
        </div>

        <div className="relative z-10 text-center">
          <div className="text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
            Understand<br />your health,<br /><span className="text-white/60">clearly.</span>
          </div>
          <p className="text-white/70 text-xl leading-relaxed max-w-md">
            MedExplain AI turns complex lab reports into clear, simple language — so you always know what your body is telling you.
          </p>
          <div className="mt-10 flex gap-8 justify-center">
            {[['52', 'Tests analyzed'], ['AI', 'Explanations'], ['100%', 'Private']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-white">{val}</div>
                <div className="text-white/60 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 bg-background transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="w-full max-w-md">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-primary w-10 h-10 rounded-[14px] flex items-center justify-center shadow-md">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
              </div>
              <span className="font-bold text-xl text-textMain tracking-tight">MedExplain</span>
            </div>
            <h1 className="text-4xl font-bold text-textMain tracking-tight mb-2">Sign in</h1>
            <p className="text-textMuted text-lg">Welcome back — good to see you again.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-sm font-medium">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group">
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
            <div className="group">
              <label className="block text-sm font-semibold text-textMain mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
                  <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> Signing in...</>
                ) : 'Sign In →'}
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
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline underline-offset-2">
              Create one for free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
