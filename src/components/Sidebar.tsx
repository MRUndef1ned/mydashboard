import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  LineChart,
  MessageSquare,
  NotebookPen,
  Settings,
  Users,
  WalletCards,
  Zap,
  ChevronRight,
  X,
} from 'lucide-react'
import { navItems } from '../config/routes'
import { useUI } from '../context/UIContext'

const iconMap = {
  'layout-dashboard': LayoutDashboard,
  'line-chart': LineChart,
  'wallet-cards': WalletCards,
  'bar-chart-3': BarChart3,
  'folder-kanban': FolderKanban,
  users: Users,
  'message-square': MessageSquare,
  'notebook-pen': NotebookPen,
  settings: Settings,
} as const

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/25">
            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white">Nexus</h1>
            <p className="text-[11px] text-zinc-500">Dashboard v1.0</p>
          </div>
        </div>
        <button
          onClick={onNavigate}
          className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Menü
        </p>
        {navItems.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap]
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/15 to-cyan-500/5 text-white shadow-inner shadow-indigo-500/10'
                    : 'text-zinc-400 hover:bg-white/4 hover:text-zinc-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 transition-colors duration-300 ${
                      isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-indigo-400/60 transition-transform duration-300 group-hover:translate-x-0.5" />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="mx-3 mb-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
          <span className="text-xs font-medium text-zinc-300">Pro Plan Aktif</span>
        </div>
        <p className="mb-3 text-[11px] leading-relaxed text-zinc-500">
          Gelişmiş analitik ve sınırsız proje erişimi.
        </p>
        <button className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-indigo-500">
          Planı Yükselt
        </button>
      </div>
    </>
  )
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUI()
  const close = () => setSidebarOpen(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-white/6 bg-surface-1/80 backdrop-blur-xl lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={close}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-white/6 bg-surface-1/95 backdrop-blur-xl lg:hidden"
            >
              <SidebarContent onNavigate={close} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
