import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Settings, User } from 'lucide-react'
import { useAuth, getInitials } from '../context/AuthContext'
import { useUI } from '../context/UIContext'

export function ProfileMenu() {
  const { user, logout } = useAuth()
  const { profileOpen, setProfileOpen, closeAllPanels } = useUI()
  const navigate = useNavigate()

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setProfileOpen(!profileOpen)}
        className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 py-1.5 pl-1.5 pr-3 transition hover:bg-white/5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
          {getInitials(user.name)}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-zinc-200">{user.name}</p>
          <p className="text-[11px] text-zinc-500">{user.role}</p>
        </div>
      </button>

      <AnimatePresence>
        {profileOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-surface-1/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="border-b border-white/6 px-4 py-3">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="truncate text-xs text-zinc-500">{user.email}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={() => {
                    navigate('/settings')
                    closeAllPanels()
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
                >
                  <User className="h-4 w-4" />
                  Profilim
                </button>
                <button
                  onClick={() => {
                    navigate('/settings')
                    closeAllPanels()
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                  Ayarlar
                </button>
                <button
                  onClick={() => {
                    logout()
                    closeAllPanels()
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-rose-400 transition hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Çıkış Yap
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
