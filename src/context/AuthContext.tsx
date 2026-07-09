import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

interface StoredUser extends User {
  password: string
}

const SESSION_KEY = 'nexus_session'
const USERS_KEY = 'nexus_users'

const DEMO_USER: StoredUser = {
  id: 'demo-1',
  name: 'Ali Korkmaz',
  email: 'demo@nexus.com',
  password: 'demo123',
  role: 'Yönetici',
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return [DEMO_USER]
    const users = JSON.parse(raw) as StoredUser[]
    return users.some((u) => u.email === DEMO_USER.email) ? users : [DEMO_USER, ...users]
  } catch {
    return [DEMO_USER]
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export { getInitials }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    writeUsers(readUsers())
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) setUser(JSON.parse(raw) as User)
    } catch {
      localStorage.removeItem(SESSION_KEY)
    }
    setIsLoading(false)
  }, [])

  const persistSession = useCallback((nextUser: User | null) => {
    if (nextUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
    setUser(nextUser)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600))

    const users = readUsers()
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    )

    if (!found) {
      return { success: false, error: 'E-posta veya şifre hatalı.' }
    }

    const { password: _, ...sessionUser } = found
    persistSession(sessionUser)
    return { success: true }
  }, [persistSession])

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await new Promise((r) => setTimeout(r, 700))

      if (password.length < 6) {
        return { success: false, error: 'Şifre en az 6 karakter olmalıdır.' }
      }

      const users = readUsers()
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'Bu e-posta adresi zaten kayıtlı.' }
      }

      const newUser: StoredUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'Kullanıcı',
      }

      writeUsers([...users, newUser])

      const { password: _, ...sessionUser } = newUser
      persistSession(sessionUser)
      return { success: true }
    },
    [persistSession],
  )

  const logout = useCallback(() => {
    persistSession(null)
  }, [persistSession])

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
