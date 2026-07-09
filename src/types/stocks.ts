export type StockMarket = 'BIST' | 'US'

export interface WatchlistItem {
  symbol: string
  name: string
  market: StockMarket
  addedAt: number
}

export interface StockQuote {
  symbol: string
  name: string
  price: number
  previousClose: number
  change: number
  changePercent: number
  currency: string
  market: StockMarket
  dayHigh: number
  dayLow: number
  volume: number
  updatedAt: number
}

export interface SearchResult {
  symbol: string
  name: string
  market: StockMarket
  exchange: string
}

export const defaultWatchlist: WatchlistItem[] = [
  { symbol: 'THYAO.IS', name: 'Türk Hava Yolları', market: 'BIST', addedAt: Date.now() },
  { symbol: 'GARAN.IS', name: 'Garanti BBVA', market: 'BIST', addedAt: Date.now() },
  { symbol: 'AKBNK.IS', name: 'Akbank', market: 'BIST', addedAt: Date.now() },
  { symbol: 'EREGL.IS', name: 'Ereğli Demir Çelik', market: 'BIST', addedAt: Date.now() },
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'US', addedAt: Date.now() },
  { symbol: 'MSFT', name: 'Microsoft', market: 'US', addedAt: Date.now() },
  { symbol: 'NVDA', name: 'NVIDIA', market: 'US', addedAt: Date.now() },
  { symbol: 'TSLA', name: 'Tesla', market: 'US', addedAt: Date.now() },
]

export function formatPrice(price: number, currency: string) {
  if (currency === 'TRY') {
    return `₺${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatVolume(volume: number) {
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`
  return volume.toString()
}

export function displaySymbol(symbol: string) {
  return symbol.replace('.IS', '')
}
