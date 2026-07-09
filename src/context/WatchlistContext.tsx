import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { defaultWatchlist, type WatchlistItem, type StockMarket } from '../types/stocks'

const STORAGE_KEY = 'nexus_watchlist'

interface WatchlistContextValue {
  items: WatchlistItem[]
  addStock: (symbol: string, name: string, market: StockMarket) => boolean
  removeStock: (symbol: string) => void
  hasStock: (symbol: string) => boolean
  symbols: string[]
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null)

function loadWatchlist(): WatchlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultWatchlist
    const parsed = JSON.parse(raw) as WatchlistItem[]
    return parsed.length > 0 ? parsed : defaultWatchlist
  } catch {
    return defaultWatchlist
  }
}

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WatchlistItem[]>(loadWatchlist)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const hasStock = useCallback(
    (symbol: string) => items.some((i) => i.symbol === symbol),
    [items],
  )

  const addStock = useCallback(
    (symbol: string, name: string, market: StockMarket) => {
      const normalized = market === 'BIST'
        ? symbol.endsWith('.IS') ? symbol : `${symbol}.IS`
        : symbol.replace('.IS', '')

      if (items.some((i) => i.symbol === normalized)) return false

      setItems((prev) => [
        ...prev,
        { symbol: normalized, name, market, addedAt: Date.now() },
      ])
      return true
    },
    [items],
  )

  const removeStock = useCallback((symbol: string) => {
    setItems((prev) => prev.filter((i) => i.symbol !== symbol))
  }, [])

  const symbols = useMemo(() => items.map((i) => i.symbol), [items])

  const value = useMemo(
    () => ({ items, addStock, removeStock, hasStock, symbols }),
    [items, addStock, removeStock, hasStock, symbols],
  )

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider')
  return ctx
}
