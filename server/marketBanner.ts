import { fetchQuotes } from './yahoo.js'

export interface MarketTickerItem {
  id: string
  label: string
  price: number
  change: number
  changePercent: number
  currency: string
  type: 'index' | 'forex' | 'commodity' | 'stock'
  market?: 'BIST' | 'US'
  symbol?: string
}

const GRAMS_PER_TROY_OZ = 31.1034768

const CORE_SYMBOLS = ['XU100.IS', 'USDTRY=X', 'EURTRY=X', 'GC=F'] as const

let bannerCache: { data: MarketTickerItem[]; expiresAt: number } | null = null
const BANNER_TTL = 45_000

function buildItem(
  id: string,
  label: string,
  price: number,
  previousClose: number,
  currency: string,
  type: MarketTickerItem['type'],
  extra?: Partial<MarketTickerItem>,
): MarketTickerItem {
  const change = price - previousClose
  const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0
  return { id, label, price, change, changePercent, currency, type, ...extra }
}

async function fetchCoreBanner(): Promise<MarketTickerItem[]> {
  const cached = bannerCache && Date.now() < bannerCache.expiresAt ? bannerCache.data : null
  if (cached) return cached

  const quotes = await fetchQuotes([...CORE_SYMBOLS])
  const bySymbol = Object.fromEntries(quotes.map((q) => [q.symbol, q]))

  const bist = bySymbol['XU100.IS']
  const usd = bySymbol['USDTRY=X']
  const eur = bySymbol['EURTRY=X']
  const goldOz = bySymbol['GC=F']

  const items: MarketTickerItem[] = []

  if (bist) {
    items.push(buildItem('bist100', 'BIST 100', bist.price, bist.previousClose, 'TRY', 'index'))
  }
  if (usd) {
    items.push(buildItem('usdtry', 'USD/TRY', usd.price, usd.previousClose, 'TRY', 'forex'))
  }
  if (eur) {
    items.push(buildItem('eurtry', 'EUR/TRY', eur.price, eur.previousClose, 'TRY', 'forex'))
  }
  if (goldOz && usd) {
    const gramPrice = (goldOz.price * usd.price) / GRAMS_PER_TROY_OZ
    const prevGram = (goldOz.previousClose * usd.previousClose) / GRAMS_PER_TROY_OZ
    items.push(buildItem('gold', 'Altın (gr)', gramPrice, prevGram, 'TRY', 'commodity'))
  }

  if (items.length > 0) {
    bannerCache = { data: items, expiresAt: Date.now() + BANNER_TTL }
  }

  return items
}

export async function fetchMarketBanner(highlightSymbol?: string): Promise<MarketTickerItem[]> {
  const core = await fetchCoreBanner()
  const items = [...core]

  if (highlightSymbol) {
    const quotes = await fetchQuotes([highlightSymbol])
    const q = quotes[0]
    if (q) {
      items.push({
        id: 'highlight',
        label: q.symbol.replace('.IS', ''),
        price: q.price,
        change: q.change,
        changePercent: q.changePercent,
        currency: q.currency,
        type: 'stock',
        market: q.market,
        symbol: q.symbol,
      })
    }
  }

  return items
}
