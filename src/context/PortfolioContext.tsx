import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { NewPortfolioPosition, PortfolioPosition } from '../types/portfolio'

const STORAGE_KEY = 'nexus_portfolio'

interface PortfolioContextValue {
  positions: PortfolioPosition[]
  symbols: string[]
  addPosition: (position: NewPortfolioPosition) => void
  removePosition: (id: string) => void
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null)

function loadPortfolio(): PortfolioPosition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item): item is PortfolioPosition =>
        typeof item?.id === 'string' &&
        typeof item?.symbol === 'string' &&
        typeof item?.name === 'string' &&
        (item?.market === 'BIST' || item?.market === 'US') &&
        Number.isFinite(item?.quantity) &&
        item.quantity > 0 &&
        Number.isFinite(item?.buyPrice) &&
        item.buyPrice > 0 &&
        typeof item?.buyDate === 'string',
    )
  } catch {
    return []
  }
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<PortfolioPosition[]>(loadPortfolio)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
  }, [positions])

  const addPosition = useCallback((position: NewPortfolioPosition) => {
    const symbol =
      position.market === 'BIST'
        ? position.symbol.endsWith('.IS')
          ? position.symbol
          : `${position.symbol}.IS`
        : position.symbol.replace('.IS', '')

    setPositions((current) => [
      ...current,
      {
        ...position,
        symbol,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      },
    ])
  }, [])

  const removePosition = useCallback((id: string) => {
    setPositions((current) => current.filter((position) => position.id !== id))
  }, [])

  const symbols = useMemo(
    () => [...new Set(positions.map((position) => position.symbol))],
    [positions],
  )

  const value = useMemo(
    () => ({ positions, symbols, addPosition, removePosition }),
    [positions, symbols, addPosition, removePosition],
  )

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (!context) throw new Error('usePortfolio must be used within PortfolioProvider')
  return context
}
