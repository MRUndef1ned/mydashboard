export interface StockQuote {
  symbol: string
  name: string
  price: number
  previousClose: number
  change: number
  changePercent: number
  currency: string
  market: 'BIST' | 'US'
  dayHigh: number
  dayLow: number
  volume: number
  updatedAt: number
}

export interface SearchResult {
  symbol: string
  name: string
  market: 'BIST' | 'US'
  exchange: string
}
