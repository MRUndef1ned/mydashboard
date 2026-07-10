import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  calculateHoldings,
  type NewPortfolioTransaction,
  type PortfolioHolding,
  type PortfolioTransaction,
} from '../types/portfolio'

const STORAGE_KEY = 'nexus_portfolio'

interface PortfolioContextValue {
  transactions: PortfolioTransaction[]
  holdings: PortfolioHolding[]
  symbols: string[]
  addTransaction: (transaction: NewPortfolioTransaction) => void
  updateTransaction: (id: string, transaction: NewPortfolioTransaction) => void
  removeTransaction: (id: string) => void
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null)

function loadPortfolio(): PortfolioTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item): PortfolioTransaction | null => {
        if (
          typeof item?.id !== 'string' ||
          typeof item?.symbol !== 'string' ||
          typeof item?.name !== 'string' ||
          (item?.market !== 'BIST' && item?.market !== 'US') ||
          !Number.isFinite(item?.quantity) ||
          item.quantity <= 0
        ) {
          return null
        }

        // v1 portföy kayıtlarını işlem defterine kayıpsız taşı.
        if (Number.isFinite(item.buyPrice) && typeof item.buyDate === 'string') {
          return {
            id: item.id,
            type: 'buy',
            symbol: item.symbol,
            name: item.name,
            market: item.market,
            quantity: item.quantity,
            price: item.buyPrice,
            date: item.buyDate,
            createdAt: Number.isFinite(item.createdAt) ? item.createdAt : Date.now(),
          }
        }

        if (
          (item.type === 'buy' || item.type === 'sell') &&
          Number.isFinite(item.price) &&
          item.price > 0 &&
          typeof item.date === 'string'
        ) {
          return item as PortfolioTransaction
        }
        return null
      })
      .filter((item): item is PortfolioTransaction => item !== null)
  } catch {
    return []
  }
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<PortfolioTransaction[]>(loadPortfolio)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  const normalize = useCallback((transaction: NewPortfolioTransaction) => {
    const symbol =
      transaction.market === 'BIST'
        ? transaction.symbol.endsWith('.IS')
          ? transaction.symbol
          : `${transaction.symbol}.IS`
        : transaction.symbol.replace('.IS', '')
    return { ...transaction, symbol }
  }, [])

  const addTransaction = useCallback((transaction: NewPortfolioTransaction) => {
    setTransactions((current) => [
      ...current,
      {
        ...normalize(transaction),
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      },
    ])
  }, [normalize])

  const updateTransaction = useCallback((id: string, transaction: NewPortfolioTransaction) => {
    setTransactions((current) =>
      current.map((item) => (item.id === id ? { ...item, ...normalize(transaction) } : item)),
    )
  }, [normalize])

  const removeTransaction = useCallback((id: string) => {
    setTransactions((current) => current.filter((transaction) => transaction.id !== id))
  }, [])

  const holdings = useMemo(() => calculateHoldings(transactions), [transactions])
  const symbols = useMemo(
    () => [...new Set(holdings.filter((holding) => holding.quantity > 0).map((holding) => holding.symbol))],
    [holdings],
  )

  const value = useMemo(
    () => ({
      transactions,
      holdings,
      symbols,
      addTransaction,
      updateTransaction,
      removeTransaction,
    }),
    [
      transactions,
      holdings,
      symbols,
      addTransaction,
      updateTransaction,
      removeTransaction,
    ],
  )

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (!context) throw new Error('usePortfolio must be used within PortfolioProvider')
  return context
}
