import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

interface UIContextValue {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  commandOpen: boolean
  setCommandOpen: (open: boolean) => void
  toggleCommandOpen: () => void
  notificationsOpen: boolean
  setNotificationsOpen: (open: boolean) => void
  profileOpen: boolean
  setProfileOpen: (open: boolean) => void
  toasts: Toast[]
  addToast: (message: string, type?: ToastType) => void
  removeToast: (id: string) => void
  closeAllPanels: () => void
}

const UIContext = createContext<UIContextValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const closeAllPanels = useCallback(() => {
    setSidebarOpen(false)
    setCommandOpen(false)
    setNotificationsOpen(false)
    setProfileOpen(false)
  }, [])

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const toggleCommandOpen = useCallback(() => {
    setCommandOpen((prev) => !prev)
  }, [])

  const value = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
      commandOpen,
      setCommandOpen,
      toggleCommandOpen,
      notificationsOpen,
      setNotificationsOpen,
      profileOpen,
      setProfileOpen,
      toasts,
      addToast,
      removeToast,
      closeAllPanels,
    }),
    [
      sidebarOpen,
      toggleSidebar,
      commandOpen,
      toggleCommandOpen,
      notificationsOpen,
      profileOpen,
      toasts,
      addToast,
      removeToast,
      closeAllPanels,
    ],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
