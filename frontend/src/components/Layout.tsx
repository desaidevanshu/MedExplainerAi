import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Upload, FileText, History, Settings, LogOut, Hexagon, Bot } from 'lucide-react'
import { auth } from '../firebase'
import { logout } from '../services/auth'

export default function Layout({ children }: { children: React.ReactNode }) {
  const handleLogout = async () => {
    await logout()
  }

  const nav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Upload', icon: Upload },
    { to: '/history', label: 'History', icon: History },
    { to: '/chat', label: 'AI Assistant', icon: Bot },
    { to: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen flex bg-background font-sans text-textMain selection:bg-primary selection:text-white">
      <aside className="w-64 bg-surface/80 backdrop-blur-3xl border-r border-borderLight flex flex-col fixed h-full z-20">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-primary to-blue-400 p-2 rounded-xl text-white shadow-apple">
              <Hexagon size={24} className="stroke-[2.5px]" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">MedExplain</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 mt-4 space-y-1">
          <p className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-3 px-3">Overview</p>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-textMain hover:bg-black/5 active:scale-[0.98]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={isActive ? 'opacity-100' : 'opacity-70'} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-borderLight/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors active:scale-95"
          >
            <LogOut size={16} strokeWidth={2.5} /> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8 lg:p-12 overflow-auto max-w-[1600px] mx-auto min-h-screen shadow-[inset_0_0_100px_rgba(0,0,0,0.01)] relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-multiply"></div>
        {children}
      </main>
    </div>
  )
}
