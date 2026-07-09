import type { StockQuote } from './types.js'
import { detectMarket } from './yahoo.js'

interface CacheEntry {
  key: string
  quotes: StockQuote[]
  expiresAt: number
}

let cache: CacheEntry | null = null
const TTL_MS = 25_000

export function getCachedQuotes(symbolsKey: string): StockQuote[] | null {
  if (!cache || cache.key !== symbolsKey) return null
  if (Date.now() > cache.expiresAt) return null
  return cache.quotes
}

export function setCachedQuotes(symbolsKey: string, quotes: StockQuote[]) {
  cache = { key: symbolsKey, quotes, expiresAt: Date.now() + TTL_MS }
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
  return isAnyMarketOpen() ? 30_000 : 120_000
}
