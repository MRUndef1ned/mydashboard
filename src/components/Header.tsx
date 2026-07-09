import { useLocation } from 'react-router-dom'
import { Plus, Menu, Search } from 'lucide-react'
import { getNavItemByPath } from '../config/routes'
import { useUI } from '../context/UIContext'
import { NotificationPanel } from './NotificationPanel'
import { ProfileMenu } from './ProfileMenu'

export function Header() {
  const location = useLocation()
  const page = getNavItemByPath(location.pathname)
  const { toggleSidebar, toggleCommandOpen, addToast } = useUI()

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/6 bg-surface-0/60 px-4 py-4 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white transition-all duration-300 sm:text-xl">
            {page.label}
          </h2>
          <p className="hidden text-sm text-zinc-500 sm:block">{page.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleCommandOpen}
          className="relative hidden items-center gap-2 rounded-xl border border-white/6 bg-white/3 py-2 pl-10 pr-12 text-sm text-zinc-500 transition hover:bg-white/5 hover:text-zinc-400 md:flex"
        >
          <Search className="absolute left-3 h-4 w-4" />
          Ara...
          <kbd className="absolute right-3 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={toggleCommandOpen}
          className="rounded-xl border border-white/6 bg-white/3 p-2.5 text-zinc-400 transition hover:bg-white/5 hover:text-white md:hidden"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        <button
          onClick={() => addToast('Proje oluşturma sihirbazı yakında eklenecek.', 'info')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-indigo-500 sm:px-4"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Yeni Proje</span>
        </button>

        <NotificationPanel />
        <ProfileMenu />
      </div>
    </header>
  )
}
