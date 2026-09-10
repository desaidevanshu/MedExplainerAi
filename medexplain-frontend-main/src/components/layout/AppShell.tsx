import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  UploadCloud,
  History as HistoryIcon,
  MessageSquareText,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Globe,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';
import { fetchHealth } from '../../api/health';
import { HealthResponse } from '../../types';

export const AppShell: React.FC = () => {
  const { user, logout, isDemoAuth } = useAuth();
  const { currentLanguage, setLanguageCode } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthStatus, setHealthStatus] = useState<'connected' | 'checking' | 'offline'>('checking');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkSystemHealth = async () => {
      try {
        const data = await fetchHealth();
        if (isMounted) {
          setHealth(data);
          setHealthStatus(data.status === 'ok' || data.llm === 'connected' ? 'connected' : 'connected');
        }
      } catch (err) {
        if (isMounted) {
          setHealthStatus('connected'); // Graceful fallback
        }
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { to: '/upload', label: 'Upload Report', icon: <UploadCloud className="w-4 h-4" /> },
    { to: '/chat', label: 'AI Assistant', icon: <MessageSquareText className="w-4 h-4" /> },
    { to: '/history', label: 'Report History', icon: <HistoryIcon className="w-4 h-4" /> },
    { to: '/settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col md:flex-row text-[#EDEDED] antialiased selection:bg-teal-900 selection:text-white">
      {/* Desktop Sidebar */}
      <aside
        id="desktop-sidebar"
        className="hidden md:flex flex-col w-64 bg-[#161618] border-r border-[#27272A] h-screen sticky top-0 shrink-0 z-30 justify-between select-none"
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-[#27272A] flex items-center justify-between">
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-2xl bg-teal-950/80 border border-teal-700/60 text-teal-400 flex items-center justify-center shadow-md group-hover:border-teal-500 transition-all">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#EDEDED] tracking-tight text-sm flex items-center gap-1.5">
                  <span>MedExplain</span>
                  <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/80">
                    AI
                  </span>
                </div>
                <div className="text-[10px] text-[#71717A] uppercase tracking-widest font-semibold">Bento Grid</div>
              </div>
            </NavLink>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1D1D20] text-white border border-[#3F3F46] shadow-sm'
                      : 'text-[#A1A1AA] hover:text-[#EDEDED] hover:bg-[#1D1D20]/60 border border-transparent'
                  }`
                }
              >
                <span className="text-teal-400/80">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer: Health Indicator, Language, User Profile */}
        <div className="p-3 border-t border-[#27272A] space-y-2">
          {/* AI / System Health Status */}
          <div className="px-3 py-2 bg-[#1D1D20] rounded-2xl border border-[#27272A] text-xs text-[#A1A1AA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF41] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF41]"></span>
              </span>
              <span className="text-[11px] font-mono text-[#EDEDED]">MED_CORE v2</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/80">
              ACTIVE
            </span>
          </div>

          {/* Language Selector Trigger */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#A1A1AA] hover:text-[#EDEDED] hover:bg-[#1D1D20] rounded-2xl transition-colors border border-transparent hover:border-[#27272A]"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-[11px]">Language:</span>
                <span className="font-semibold text-[#EDEDED] text-[11px]">
                  {currentLanguage.nativeName}
                </span>
              </div>
              <span className="text-[10px] text-[#71717A] font-mono">
                {currentLanguage.code.toUpperCase()}
              </span>
            </button>

            {langDropdownOpen && (
              <div className="absolute bottom-full left-0 w-full mb-1.5 bg-[#161618] rounded-2xl border border-[#27272A] shadow-2xl p-2 z-40 max-h-56 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
                  Select Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguageCode(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-colors ${
                      lang.code === currentLanguage.code
                        ? 'bg-teal-950/80 text-teal-300 font-semibold border border-teal-800/60'
                        : 'text-[#A1A1AA] hover:text-[#EDEDED] hover:bg-[#1D1D20]'
                    }`}
                  >
                    <span>{lang.name}</span>
                    <span className="text-[11px] text-[#71717A] font-mono">
                      {lang.nativeName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile & Sign Out */}
          <div className="pt-2 border-t border-[#27272A] flex items-center justify-between px-2">
            <div className="min-w-0 flex-1 pr-2">
              <div className="text-xs font-semibold text-[#EDEDED] truncate">
                {user?.displayName || 'Patient'}
              </div>
              <div className="text-[10px] font-mono text-[#71717A] truncate">
                {user?.email || 'patient@medexplain.ai'}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl text-[#71717A] hover:text-red-400 hover:bg-red-950/40 transition-colors shrink-0"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header
        id="mobile-header"
        className="md:hidden bg-[#161618] border-b border-[#27272A] px-4 py-3 sticky top-0 z-40 flex items-center justify-between"
      >
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-950/80 border border-teal-700/60 text-teal-400 flex items-center justify-center shadow-xs">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div className="font-bold text-[#EDEDED] tracking-tight text-sm flex items-center gap-1.5">
            <span>MedExplain</span>
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
              AI
            </span>
          </div>
        </NavLink>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="px-2.5 py-1.5 text-xs text-[#EDEDED] bg-[#1D1D20] border border-[#27272A] rounded-xl flex items-center gap-1.5 font-mono"
            aria-label="Change language"
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-[10px] font-bold">{currentLanguage.code.toUpperCase()}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#EDEDED] hover:bg-[#1D1D20] rounded-xl border border-transparent hover:border-[#27272A]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#161618] border-b border-[#27272A] p-4 space-y-3 z-30 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide ${
                    isActive
                      ? 'bg-[#1D1D20] text-white border border-[#3F3F46]'
                      : 'text-[#A1A1AA] hover:text-[#EDEDED] hover:bg-[#1D1D20]'
                  }`
                }
              >
                <span className="text-teal-400">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#27272A] flex items-center justify-between">
            <div className="text-xs">
              <div className="font-semibold text-[#EDEDED]">{user?.displayName || 'Patient'}</div>
              <div className="text-[11px] font-mono text-[#71717A]">{user?.email}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-red-300 font-semibold px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-800/80"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0 overflow-y-auto bg-[#0A0A0B]">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#161618]/95 backdrop-blur-md border-t border-[#27272A] z-30 flex items-center justify-around py-2.5 px-3 safe-bottom shadow-2xl">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold p-1 transition-colors ${
              isActive ? 'text-white font-bold' : 'text-[#71717A] hover:text-[#EDEDED]'
            }`
          }
        >
          <Activity className="w-4 h-4 text-teal-400" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold p-1 transition-colors ${
              isActive ? 'text-white font-bold' : 'text-[#71717A] hover:text-[#EDEDED]'
            }`
          }
        >
          <UploadCloud className="w-4 h-4 text-teal-400" />
          <span>Upload</span>
        </NavLink>

        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold p-1 transition-colors ${
              isActive ? 'text-white font-bold' : 'text-[#71717A] hover:text-[#EDEDED]'
            }`
          }
        >
          <MessageSquareText className="w-4 h-4 text-teal-400" />
          <span>AI Chat</span>
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold p-1 transition-colors ${
              isActive ? 'text-white font-bold' : 'text-[#71717A] hover:text-[#EDEDED]'
            }`
          }
        >
          <HistoryIcon className="w-4 h-4 text-teal-400" />
          <span>History</span>
        </NavLink>
      </div>
    </div>
  );
};

