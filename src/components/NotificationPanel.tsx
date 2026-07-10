import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck } from 'lucide-react'
import { notifications as initialNotifications } from '../data/notifications'
import { useUI } from '../context/UIContext'

const typeDot = {
  info: 'bg-indigo-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
}

export function NotificationPanel() {
  const { notificationsOpen, setNotificationsOpen, addToast } = useUI()
  const [items, setItems] = useState(initialNotifications)

  const unread = items.filter((n) => !n.read).length

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    addToast('Tüm bildirimler okundu olarak işaretlendi.', 'info')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setNotificationsOpen(!notificationsOpen)}
        className="relative rounded-xl border border-white/6 bg-white/3 p-2.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute right-2 top-2 flex h-2 w-2 items-center justify-center">
            <span className="absolute h-2 w-2 animate-ping rounded-full bg-rose-400 opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-rose-500 ring-2 ring-surface-0" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {notificationsOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setNotificationsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-white/10 bg-surface-1/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">Bildirimler</p>
                  <p className="text-[11px] text-zinc-500">{unread} okunmamış</p>
                </div>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 transition hover:text-indigo-300"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Tümünü oku
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() =>
                      setItems((prev) =>
                        prev.map((item) =>
                          item.id === n.id ? { ...item, read: true } : item,
                        ),
                      )
                    }
                    className={`flex w-full gap-3 border-b border-white/4 px-4 py-3 text-left transition hover:bg-white/3 ${
                      !n.read ? 'bg-indigo-500/5' : ''
                    }`}
                  >
                    <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${typeDot[n.type]}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{n.message}</p>
                      <p className="mt-1 text-[10px] text-zinc-600">{n.time}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
