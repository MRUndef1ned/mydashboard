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

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const GRAMS_PER_TROY_OZ = 31.1034768

let bannerCache: { data: MarketTickerItem[]; expiresAt: number } | null = null
const BANNER_TTL = 45_000

async function fetchSparkPrice(symbol: string): Promise<{ price: number; previousClose: number } | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${encodeURIComponent(symbol)}&range=1d&interval=5m`,
      { headers: { 'User-Agent': USER_AGENT } },
    )
    if (!res.ok) return null
    const data = await res.json()
    const entry = data[symbol]
    if (!entry?.close?.length) return null
    const price = entry.close[entry.close.length - 1]
    const previousClose = entry.previousClose ?? entry.chartPreviousClose
    if (price == null || previousClose == null) return null
    return { price, previousClose }
  } catch {
    return null
  }
}

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

  const [bist, usd, eur, goldOz] = await Promise.all([
    fetchSparkPrice('XU100.IS'),
    fetchSparkPrice('USDTRY=X'),
    fetchSparkPrice('EURTRY=X'),
    fetchSparkPrice('GC=F'),
  ])

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

  bannerCache = { data: items, expiresAt: Date.now() + BANNER_TTL }
  return items
}

export async function fetchMarketBanner(highlightSymbol?: string): Promise<MarketTickerItem[]> {
  const core = await fetchCoreBanner()
  const items = [...core]

  if (highlightSymbol) {
    const { fetchQuotes } = await import('./yahoo.js')
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
