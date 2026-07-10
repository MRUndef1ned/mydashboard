import type { StockQuote } from './types.js'
import { detectMarket } from './yahoo.js'

interface CacheEntry {
  quotes: StockQuote[]
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const OPEN_MARKET_TTL_MS = 25_000
const CLOSED_MARKET_TTL_MS = 60 * 60 * 1000

export function getCachedQuotes(symbolsKey: string): StockQuote[] | null {
  const entry = cache.get(symbolsKey)
  if (!entry || Date.now() > entry.expiresAt) return null
  return entry.quotes
}

export function getStaleCachedQuotes(symbolsKey: string): StockQuote[] | null {
  return cache.get(symbolsKey)?.quotes ?? null
}

export function setCachedQuotes(symbolsKey: string, quotes: StockQuote[]) {
  const ttl = isAnyMarketOpen() ? OPEN_MARKET_TTL_MS : CLOSED_MARKET_TTL_MS
  cache.set(symbolsKey, { quotes, expiresAt: Date.now() + ttl })
}

export function isAnyMarketOpen(): boolean {
  const now = new Date()

  const istanbul = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }))
  const istanbulDay = istanbul.getDay()
  const istanbulHour = istanbul.getHours() + istanbul.getMinutes() / 60
  const bistOpen =
    istanbulDay >= 1 && istanbulDay <= 5 && istanbulHour >= 10 && istanbulHour < 18

  const ny = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const nyDay = ny.getDay()
  const nyHour = ny.getHours() + ny.getMinutes() / 60
  const usOpen = nyDay >= 1 && nyDay <= 5 && nyHour >= 9.5 && nyHour < 16

  return bistOpen || usOpen
}

export function getPollInterval(): number {
  return isAnyMarketOpen() ? 30_000 : 60 * 60 * 1000
}
