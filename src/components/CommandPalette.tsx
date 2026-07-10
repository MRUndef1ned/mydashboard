import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  LineChart,
  LogOut,
  MessageSquare,
  NotebookPen,
  Plus,
  Search,
  Settings,
  Users,
  WalletCards,
} from 'lucide-react'
import { navItems } from '../config/routes'
import { useUI } from '../context/UIContext'
import { useAuth } from '../context/AuthContext'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'

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

export function CommandPalette() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { commandOpen, setCommandOpen, toggleCommandOpen, addToast } = useUI()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useKeyboardShortcut('k', toggleCommandOpen, { meta: true })

  const actions = [
    ...navItems.map((item) => ({
      id: item.id,
      label: item.label,
      desc: item.description,
      icon: iconMap[item.icon as keyof typeof iconMap],
      group: 'Sayfalar',
      run: () => {
        navigate(item.path)
        setCommandOpen(false)
      },
    })),
    {
      id: 'new-project',
      label: 'Yeni Proje Oluştur',
      desc: 'Projeler sayfasına git',
      icon: Plus,
      group: 'Hızlı İşlemler',
      run: () => {
        navigate('/projects')
        addToast('Proje oluşturma sihirbazı yakında eklenecek.', 'info')
        setCommandOpen(false)
      },
    },
    {
      id: 'logout',
      label: 'Çıkış Yap',
      desc: 'Oturumu sonlandır',
      icon: LogOut,
      group: 'Hesap',
      run: () => {
        logout()
        setCommandOpen(false)
      },
    },
  ]

  const filtered = actions.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.desc.toLowerCase().includes(query.toLowerCase()),
  )

  useEffect(() => {
    if (commandOpen) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandOpen])

  useEffect(() => {
    setSelected(0)
  }, [query])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter' && filtered[selected]) {
      filtered[selected].run()
    } else if (e.key === 'Escape') {
      setCommandOpen(false)
    }
  }

  return (
    <AnimatePresence>
      {commandOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setCommandOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-[18%] z-50 w-full max-w-lg -translate-x-1/2 px-4"
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-1/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
              <div className="flex items-center gap-3 border-b border-white/6 px-4">
                <Search className="h-4 w-4 shrink-0 text-zinc-500" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Sayfa veya işlem ara..."
                  className="w-full bg-transparent py-4 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
                />
                <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
                  ESC
                </kbd>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-zinc-500">Sonuç bulunamadı</p>
                ) : (
                  filtered.map((action, i) => (
                    <button
                      key={action.id}
                      onClick={action.run}
                      onMouseEnter={() => setSelected(i)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                        i === selected ? 'bg-indigo-500/15' : 'hover:bg-white/4'
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          i === selected
                            ? 'bg-indigo-500/20 text-indigo-400'
                            : 'bg-white/5 text-zinc-500'
                        }`}
                      >
                        <action.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">{action.label}</p>
                        <p className="truncate text-xs text-zinc-500">{action.desc}</p>
                      </div>
                      <span className="text-[10px] text-zinc-600">{action.group}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
