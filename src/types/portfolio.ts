import type { StockMarket } from './stocks'

export interface PortfolioPosition {
  id: string
  symbol: string
  name: string
  market: StockMarket
  quantity: number
  buyPrice: number
  buyDate: string
  createdAt: number
}

export type NewPortfolioPosition = Omit<PortfolioPosition, 'id' | 'createdAt'>
