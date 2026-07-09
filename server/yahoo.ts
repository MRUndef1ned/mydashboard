import type { SearchResult, StockQuote } from './types.js'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

export function normalizeSymbol(input: string, market?: 'BIST' | 'US'): string {
  const trimmed = input.trim().toUpperCase()
  if (market === 'BIST' || trimmed.endsWith('.IS')) {
    return trimmed.endsWith('.IS') ? trimmed : `${trimmed}.IS`
  }
  return trimmed.replace('.IS', '')
}

export function detectMarket(symbol: string): 'BIST' | 'US' {
  return symbol.endsWith('.IS') ? 'BIST' : 'US'
}

interface YahooMeta {
  symbol: string
  longName?: string
  shortName?: string
  regularMarketPrice?: number
  previousClose?: number
  chartPreviousClose?: number
  currency?: string
  regularMarketDayHigh?: number
  regularMarketDayLow?: number
  regularMarketVolume?: number
}

async function yahooFetch(url: string) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`Yahoo API error: ${res.status}`)
  return res.json()
}

function parseQuote(meta: YahooMeta): StockQuote | null {
  const price = meta.regularMarketPrice
  const previousClose = meta.previousClose ?? meta.chartPreviousClose
  if (price == null || previousClose == null) return null

  const change = price - previousClose
  const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0

  return {
    symbol: meta.symbol,
    name: meta.longName ?? meta.shortName ?? meta.symbol,
    price,
    previousClose,
    change,
    changePercent,
    currency: meta.currency ?? (detectMarket(meta.symbol) === 'BIST' ? 'TRY' : 'USD'),
    market: detectMarket(meta.symbol),
    dayHigh: meta.regularMarketDayHigh ?? price,
    dayLow: meta.regularMarketDayLow ?? price,
    volume: meta.regularMarketVolume ?? 0,
    updatedAt: Date.now(),
  }
}

export async function fetchQuotes(symbols: string[]): Promise<StockQuote[]> {
  const unique = [...new Set(symbols.map((s) => normalizeSymbol(s)))]
  if (unique.length === 0) return []

  const results = await Promise.all(
    unique.map(async (symbol) => {
      try {
        const data = await yahooFetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`,
        )
        const meta = data?.chart?.result?.[0]?.meta as YahooMeta | undefined
        if (!meta) return null
        return parseQuote(meta)
      } catch {
        return null
      }
    }),
  )

  return results.filter((q): q is StockQuote => q !== null)
}

export async function searchStocks(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const data = await yahooFetch(
    `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0`,
  )

  const quotes = data?.quotes ?? []

  return quotes
    .filter((q: { quoteType?: string; symbol?: string }) => q.quoteType === 'EQUITY' && q.symbol)
    .map((q: { symbol: string; longname?: string; shortname?: string; exchange?: string }) => {
      const symbol = q.symbol
      const market = detectMarket(symbol)
      return {
        symbol,
        name: q.longname ?? q.shortname ?? symbol,
        market,
        exchange: q.exchange ?? (market === 'BIST' ? 'BIST' : 'US'),
      }
    })
    .filter((q: SearchResult) => q.market === 'BIST' || q.market === 'US')
}
