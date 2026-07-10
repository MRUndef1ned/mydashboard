import type { StockMarket } from './stocks'

export type PortfolioTransactionType = 'buy' | 'sell'

export interface PortfolioTransaction {
  id: string
  type: PortfolioTransactionType
  symbol: string
  name: string
  market: StockMarket
  quantity: number
  price: number
  date: string
  createdAt: number
}

export type NewPortfolioTransaction = Omit<PortfolioTransaction, 'id' | 'createdAt'>

export interface PortfolioHolding {
  symbol: string
  name: string
  market: StockMarket
  quantity: number
  averageCost: number
  realizedProfit: number
  firstBuyDate: string
  transactionCount: number
}

export function isValidTransactionLedger(transactions: PortfolioTransaction[]) {
  const balances = new Map<string, number>()
  const sorted = [...transactions].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt,
  )

  for (const transaction of sorted) {
    const balance = balances.get(transaction.symbol) ?? 0
    const next =
      transaction.type === 'buy'
        ? balance + transaction.quantity
        : balance - transaction.quantity
    if (next < -0.00000001) return false
    balances.set(transaction.symbol, Math.max(0, next))
  }
  return true
}

export function calculateHoldings(transactions: PortfolioTransaction[]): PortfolioHolding[] {
  const sorted = [...transactions].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt,
  )
  const holdings = new Map<string, PortfolioHolding>()

  for (const transaction of sorted) {
    const current = holdings.get(transaction.symbol) ?? {
      symbol: transaction.symbol,
      name: transaction.name,
      market: transaction.market,
      quantity: 0,
      averageCost: 0,
      realizedProfit: 0,
      firstBuyDate: transaction.date,
      transactionCount: 0,
    }

    if (transaction.type === 'buy') {
      const previousCost = current.quantity * current.averageCost
      const addedCost = transaction.quantity * transaction.price
      current.quantity += transaction.quantity
      current.averageCost = current.quantity > 0 ? (previousCost + addedCost) / current.quantity : 0
      if (transaction.date < current.firstBuyDate) current.firstBuyDate = transaction.date
    } else {
      const soldQuantity = Math.min(transaction.quantity, current.quantity)
      current.realizedProfit += soldQuantity * (transaction.price - current.averageCost)
      current.quantity -= soldQuantity
      if (current.quantity < 0.00000001) {
        current.quantity = 0
        current.averageCost = 0
      }
    }

    current.transactionCount++
    current.name = transaction.name
    holdings.set(transaction.symbol, current)
  }

  return [...holdings.values()]
}
