import { detectMarket, normalizeSymbol } from './yahoo.js'

export interface StockNewsItem {
  id: string
  title: string
  link: string
  publisher: string
  publishedAt: number
  symbol: string
  market: 'BIST' | 'US'
  source: 'google' | 'yahoo'
  thumbnail?: string
  score: number
}

interface SymbolMeta {
  symbol: string
  name?: string
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const MAX_PER_SYMBOL = 5
const CACHE_TTL = 15 * 60 * 1000

const newsCache = new Map<string, { items: StockNewsItem[]; expiresAt: number }>()

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function tagValue(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return match ? decodeXml(match[1].trim()) : ''
}

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
}

function relevanceTokens(meta: SymbolMeta) {
  const symbol = normalizeSymbol(meta.symbol)
  const bare = symbol.replace('.IS', '')
  const tokens = new Set<string>([normalizeText(bare), normalizeText(symbol)])

  if (meta.name) {
    const name = normalizeText(meta.name)
    tokens.add(name)
    for (const part of name.split(/\s+/).filter((token) => token.length > 3)) {
      tokens.add(part)
    }
  }

  // Common aliases
  if (bare === 'THYAO') tokens.add('turk hava yollari')
  if (bare === 'GARAN') tokens.add('garanti')
  if (bare === 'AAPL') tokens.add('apple')
  if (bare === 'MSFT') tokens.add('microsoft')
  if (bare === 'NVDA') tokens.add('nvidia')
  if (bare === 'TSLA') tokens.add('tesla')

  return [...tokens]
}

function scoreItem(title: string, meta: SymbolMeta, source: 'google' | 'yahoo', publishedAt: number) {
  const haystack = normalizeText(title)
  const bare = normalizeSymbol(meta.symbol).replace('.IS', '').toLowerCase()
  const tokens = relevanceTokens(meta)

  let score = 0
  if (haystack.includes(bare)) score += 8
  if (meta.name && haystack.includes(normalizeText(meta.name))) score += 7

  for (const token of tokens) {
    if (token.length >= 4 && haystack.includes(token)) score += 2
  }

  // Weak / generic market roundups without ticker mention
  if (score === 0) return -1

  // Prefer direct ticker mentions
  if (new RegExp(`\\b${bare}\\b`, 'i').test(title)) score += 4

  if (source === 'yahoo') score += 1

  const ageHours = (Date.now() - publishedAt) / 3_600_000
  if (ageHours <= 24) score += 5
  else if (ageHours <= 72) score += 3
  else if (ageHours <= 168) score += 1
  else return -1

  return score
}

function isFresh(publishedAt: number) {
  return Number.isFinite(publishedAt) && Date.now() - publishedAt <= MAX_AGE_MS
}

function parseRssItems(xml: string, meta: SymbolMeta): StockNewsItem[] {
  const symbol = normalizeSymbol(meta.symbol)
  const market = detectMarket(symbol)
  const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => match[1])

  return blocks
    .map((block, index) => {
      const rawTitle = tagValue(block, 'title')
      const link = tagValue(block, 'link')
      const sourcePublisher = tagValue(block, 'source')
      const pubDate = tagValue(block, 'pubDate')
      const publishedAt = pubDate ? Date.parse(pubDate) : NaN
      if (!rawTitle || !link || !isFresh(publishedAt)) return null

      const split = rawTitle.match(/^(.*)\s+-\s+(.+)$/)
      const title = split?.[1]?.trim() || rawTitle
      const publisher =
        sourcePublisher ||
        split?.[2]?.trim() ||
        (market === 'BIST' ? 'Google Haberler' : 'Google News')

      const score = scoreItem(title, meta, 'google', publishedAt)
      if (score < 4) return null

      return {
        id: `${symbol}-g-${Buffer.from(`${link}|${title}`).toString('base64url').slice(0, 28)}`,
        title,
        link,
        publisher,
        publishedAt,
        symbol,
        market,
        source: 'google' as const,
        score,
      }
    })
    .filter((item): item is StockNewsItem => item !== null)
}

function buildQuery(meta: SymbolMeta) {
  const symbol = normalizeSymbol(meta.symbol)
  const bare = symbol.replace('.IS', '')
  const name = meta.name?.trim()
  const market = detectMarket(symbol)

  // Google supports when:7d for recency
  if (market === 'BIST') {
    const core = name ? `("${name}" OR ${bare} OR "BIST:${bare}")` : `${bare}`
    return {
      q: `${core} (hisse OR borsa OR BIST) when:7d`,
      hl: 'tr',
      gl: 'TR',
      ceid: 'TR:tr',
    }
  }

  const core = name ? `("${name}" OR ${bare})` : bare
  return {
    q: `${core} (stock OR shares OR earnings OR analyst) when:7d`,
    hl: 'en-US',
    gl: 'US',
    ceid: 'US:en',
  }
}

async function fetchGoogleNews(meta: SymbolMeta): Promise<StockNewsItem[]> {
  const query = buildQuery(meta)
  const url =
    `https://news.google.com/rss/search?q=${encodeURIComponent(query.q)}` +
    `&hl=${query.hl}&gl=${query.gl}&ceid=${encodeURIComponent(query.ceid)}`

  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`Google News error: ${response.status}`)
  const xml = await response.text()
  return parseRssItems(xml, meta)
}

async function fetchYahooNews(meta: SymbolMeta): Promise<StockNewsItem[]> {
  const symbol = normalizeSymbol(meta.symbol)
  if (detectMarket(symbol) === 'BIST') return []

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol)}&quotesCount=0&newsCount=12`,
      { headers: { 'User-Agent': USER_AGENT } },
    )
    if (!response.ok) return []
    const data = await response.json()
    const news = Array.isArray(data?.news) ? data.news : []
    const bare = symbol.replace('.IS', '')

    return news
      .map(
        (item: {
          uuid?: string
          title?: string
          link?: string
          publisher?: string
          providerPublishTime?: number
          relatedTickers?: string[]
          thumbnail?: { resolutions?: Array<{ url?: string }> }
        }) => {
          const title = item.title ?? ''
          const publishedAt = (item.providerPublishTime ?? 0) * 1000
          if (!title || !item.link || !isFresh(publishedAt)) return null

          const related = item.relatedTickers ?? []
          const relatedHit = related.includes(symbol) || related.includes(bare)
          const score = scoreItem(title, meta, 'yahoo', publishedAt)
          // Require either strong title relevance or related ticker + some title signal
          if (score < 5 && !(relatedHit && score >= 3)) return null

          return {
            id: item.uuid ?? `${symbol}-y-${item.link}`,
            title,
            link: item.link,
            publisher: item.publisher ?? 'Yahoo Finance',
            publishedAt,
            symbol,
            market: 'US' as const,
            source: 'yahoo' as const,
            thumbnail: item.thumbnail?.resolutions?.[0]?.url,
            score: score + (relatedHit ? 2 : 0),
          }
        },
      )
      .filter((item: StockNewsItem | null): item is StockNewsItem => item !== null)
  } catch {
    return []
  }
}

function pickBest(items: StockNewsItem[]) {
  const byTitle = new Map<string, StockNewsItem>()
  for (const item of items.sort((a, b) => b.score - a.score || b.publishedAt - a.publishedAt)) {
    const key = normalizeText(item.title).slice(0, 90)
    const existing = byTitle.get(key)
    if (!existing || item.score > existing.score) byTitle.set(key, item)
  }
  return [...byTitle.values()]
    .sort((a, b) => b.publishedAt - a.publishedAt || b.score - a.score)
    .slice(0, MAX_PER_SYMBOL)
}

export async function fetchWatchlistNews(metas: SymbolMeta[]): Promise<StockNewsItem[]> {
  const unique = [...new Map(metas.map((meta) => [normalizeSymbol(meta.symbol), meta])).values()].slice(
    0,
    10,
  )

  const batches = await Promise.all(
    unique.map(async (meta) => {
      const symbol = normalizeSymbol(meta.symbol)
      const cached = newsCache.get(symbol)
      if (cached && Date.now() < cached.expiresAt) return cached.items

      try {
        const [google, yahoo] = await Promise.all([fetchGoogleNews(meta), fetchYahooNews(meta)])
        const items = pickBest([...yahoo, ...google])
        newsCache.set(symbol, { items, expiresAt: Date.now() + CACHE_TTL })
        return items
      } catch (error) {
        console.error(`News fetch failed for ${symbol}:`, error)
        return [] as StockNewsItem[]
      }
    }),
  )

  return batches.flat().sort((a, b) => b.publishedAt - a.publishedAt || b.score - a.score)
}
