import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Stethoscope, ShieldCheck, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const { signInWithEmail, signInWithGoogle, isDemoAuth } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter your email and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      showToast('Welcome back to MedExplain AI.', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      showToast(err.message || 'Failed to sign in. Please verify your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      showToast('Successfully signed in with Google.', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      showToast(err.message || 'Google sign in failed.', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('patient@medexplain.ai');
    setPassword('DemoPassword123!');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#EDEDED] flex flex-col md:flex-row">
      {/* Visual Brand Panel on Desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#121214] border-r border-[#27272A] text-[#EDEDED] p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle background ambient graphic */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-teal-900/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-teal-600/10 blur-3xl pointer-events-none" />

        {/* Top brand */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-[#1D1D20] border border-[#27272A] flex items-center justify-center text-teal-400">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span>MedExplain</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-900/60 text-teal-300 border border-teal-700 font-mono">
                AI
              </span>
            </div>
            <div className="text-xs text-[#71717A] font-mono">Clinical Report Intelligence</div>
          </div>
        </div>

        {/* Center narrative */}
        <div className="space-y-6 relative z-10 max-w-lg">
          <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-[#EDEDED] leading-tight">
            Understand your health. <br />
            <span className="text-teal-400 font-medium">Clearly and calmly.</span>
          </h1>

          <p className="text-[#A1A1AA] text-sm leading-relaxed">
            MedExplain AI transforms complex medical records and laboratory values into plain-language, patient-centered explanations backed by clinical knowledge.
          </p>

          <div className="space-y-3 pt-4 border-t border-[#27272A]">
            <div className="flex items-center gap-3 text-xs text-[#A1A1AA]">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Reference range evaluation without alarming language</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#A1A1AA]">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Custom questions to discuss with your healthcare provider</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#A1A1AA]">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Multi-lingual medical clarity in 11 languages</span>
            </div>
          </div>
        </div>

        {/* Bottom medical notice */}
        <div className="text-[11px] text-[#71717A] border-t border-[#27272A] pt-4 flex items-center gap-2 relative z-10 font-mono">
          <ShieldCheck className="w-4 h-4 shrink-0 text-teal-400" />
          <span>HIPAA-aligned security principles • Educational guidance</span>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-[#161618] rounded-3xl border border-[#27272A] p-8 shadow-2xl">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="font-bold text-[#EDEDED] text-base">MedExplain AI</span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#EDEDED] tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-xs text-[#71717A] mt-1">
              Access your medical reports and AI health assistant
            </p>
          </div>

          {/* Quick Demo Fill Button */}
          {isDemoAuth && (
            <div className="mb-6 p-3.5 bg-[#1D1D20] rounded-2xl border border-[#27272A] text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#A1A1AA]">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Demo mode active</span>
              </div>
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 underline font-mono"
              >
                Auto-fill demo credentials
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5" htmlFor="email-input">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#1D1D20] border border-[#27272A] rounded-2xl text-xs sm:text-sm text-[#EDEDED] placeholder:text-[#71717A] focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#A1A1AA]" htmlFor="password-input">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-[#1D1D20] border border-[#27272A] rounded-2xl text-xs sm:text-sm text-[#EDEDED] placeholder:text-[#71717A] focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#EDEDED] p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              id="login-submit-btn"
              type="submit"
              loading={loading}
              className="w-full mt-2"
              size="md"
            >
              Sign in
            </Button>
          </form>

          {/* Social Auth Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 border-t border-[#27272A]" />
            <span className="text-[10px] text-[#71717A] uppercase tracking-wider font-mono">
              or continue with
            </span>
            <div className="flex-1 border-t border-[#27272A]" />
          </div>

          <Button
            id="google-signin-btn"
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            loading={googleLoading}
            className="w-full"
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            }
          >
            Sign in with Google
          </Button>

          <div className="mt-6 text-center text-xs text-[#A1A1AA]">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-teal-400 hover:text-teal-300 underline">
              Create an account
            </Link>
          </div>
        </div>

        {/* Subtitle notice */}
        <div className="mt-6 text-center text-[11px] text-[#71717A] max-w-sm font-mono">
          MedExplain AI is an educational reference and does not replace medical consultation.
        </div>
      </div>
    </div>
  );
};

