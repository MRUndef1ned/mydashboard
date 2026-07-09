import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  Zap,
  ChevronRight,
} from 'lucide-react'
import { navItems } from '../data/mockData'

const iconMap = {
  'layout-dashboard': LayoutDashboard,
  'bar-chart-3': BarChart3,
  'folder-kanban': FolderKanban,
  users: Users,
  'message-square': MessageSquare,
  settings: Settings,
} as const

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-white/6 bg-surface-1/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/25">
          <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-white">Nexus</h1>
          <p className="text-[11px] text-zinc-500">Dashboard v1.0</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Menü
        </p>
        {navItems.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap]
          return (
            <button
              key={item.id}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                item.active
                  ? 'bg-gradient-to-r from-indigo-500/15 to-cyan-500/5 text-white shadow-inner shadow-indigo-500/10'
                  : 'text-zinc-400 hover:bg-white/4 hover:text-zinc-200'
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] shrink-0 ${
                  item.active ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'
                }`}
                strokeWidth={item.active ? 2.25 : 1.75}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
              {item.active && (
                <ChevronRight className="h-4 w-4 text-indigo-400/60" />
              )}
            </button>
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
    </aside>
  )
}
