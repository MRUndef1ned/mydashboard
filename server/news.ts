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
}

interface SymbolMeta {
  symbol: string
  name?: string
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const newsCache = new Map<string, { items: StockNewsItem[]; expiresAt: number }>()
const CACHE_TTL = 20 * 60 * 1000

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

function parseRssItems(xml: string, symbol: string): StockNewsItem[] {
  const market = detectMarket(symbol)
  const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => match[1])

  return blocks
    .map((block, index) => {
      const rawTitle = tagValue(block, 'title')
      const link = tagValue(block, 'link')
      const sourcePublisher = tagValue(block, 'source')
      const pubDate = tagValue(block, 'pubDate')
      const publishedAt = pubDate ? Date.parse(pubDate) : Date.now() - index * 60_000
      if (!rawTitle || !link) return null

      const split = rawTitle.match(/^(.*)\s+-\s+(.+)$/)
      const title = split?.[1]?.trim() || rawTitle
      const publisher =
        sourcePublisher ||
        split?.[2]?.trim() ||
        (market === 'BIST' ? 'Google Haberler' : 'Google News')

      return {
        id: `${symbol}-${Buffer.from(link).toString('base64url').slice(0, 24)}`,
        title,
        link,
        publisher,
        publishedAt: Number.isFinite(publishedAt) ? publishedAt : Date.now(),
        symbol,
        market,
        source: 'google' as const,
      }
    })
    .filter((item): item is StockNewsItem => item !== null)
}

function buildQuery(meta: SymbolMeta) {
  const symbol = normalizeSymbol(meta.symbol)
  const bare = symbol.replace('.IS', '')
  const name = meta.name?.trim()
  const market = detectMarket(symbol)

  if (market === 'BIST') {
    if (name) {
      return {
        q: `("${name}" OR ${bare}) (hisse OR borsa OR BIST OR pay)`,
        hl: 'tr',
        gl: 'TR',
        ceid: 'TR:tr',
      }
    }
    return {
      q: `${bare} (hisse OR borsa OR BIST)`,
      hl: 'tr',
      gl: 'TR',
      ceid: 'TR:tr',
    }
  }

  if (name) {
    return {
      q: `(${bare} OR "${name}") (stock OR shares OR earnings)`,
      hl: 'en-US',
      gl: 'US',
      ceid: 'US:en',
    }
  }

  return {
    q: `${bare} stock`,
    hl: 'en-US',
    gl: 'US',
    ceid: 'US:en',
  }
}

async function fetchGoogleNews(meta: SymbolMeta): Promise<StockNewsItem[]> {
  const symbol = normalizeSymbol(meta.symbol)
  const cached = newsCache.get(symbol)
  if (cached && Date.now() < cached.expiresAt) return cached.items

  const query = buildQuery({ ...meta, symbol })
  const url =
    `https://news.google.com/rss/search?q=${encodeURIComponent(query.q)}` +
    `&hl=${query.hl}&gl=${query.gl}&ceid=${encodeURIComponent(query.ceid)}`

  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`Google News error: ${response.status}`)
  const xml = await response.text()
  const items = parseRssItems(xml, symbol).slice(0, 8)
  newsCache.set(symbol, { items, expiresAt: Date.now() + CACHE_TTL })
  return items
}

async function fetchYahooNews(meta: SymbolMeta): Promise<StockNewsItem[]> {
  const symbol = normalizeSymbol(meta.symbol)
  if (detectMarket(symbol) === 'BIST') return []

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol.replace('.IS', ''))}&quotesCount=0&newsCount=8`,
      { headers: { 'User-Agent': USER_AGENT } },
    )
    if (!response.ok) return []
    const data = await response.json()
    const news = Array.isArray(data?.news) ? data.news : []

    return news
      .filter((item: { relatedTickers?: string[]; title?: string }) => {
        const related = item.relatedTickers ?? []
        return related.includes(symbol) || related.includes(symbol.replace('.IS', ''))
      })
      .map(
        (item: {
          uuid?: string
          title?: string
          link?: string
          publisher?: string
          providerPublishTime?: number
          thumbnail?: { resolutions?: Array<{ url?: string }> }
        }): StockNewsItem => ({
          id: item.uuid ?? `${symbol}-${item.link}`,
          title: item.title ?? 'Haber',
          link: item.link ?? '#',
          publisher: item.publisher ?? 'Yahoo Finance',
          publishedAt: (item.providerPublishTime ?? Math.floor(Date.now() / 1000)) * 1000,
          symbol,
          market: 'US',
          source: 'yahoo',
          thumbnail: item.thumbnail?.resolutions?.[0]?.url,
        }),
      )
  } catch {
    return []
  }
}

export async function fetchWatchlistNews(metas: SymbolMeta[]): Promise<StockNewsItem[]> {
  const unique = [...new Map(metas.map((meta) => [normalizeSymbol(meta.symbol), meta])).values()].slice(
    0,
    12,
  )

  const batches = await Promise.all(
    unique.map(async (meta) => {
      try {
        const [google, yahoo] = await Promise.all([fetchGoogleNews(meta), fetchYahooNews(meta)])
        const merged = new Map<string, StockNewsItem>()
        for (const item of [...yahoo, ...google]) {
          const key = item.title.toLocaleLowerCase('tr-TR').slice(0, 80)
          if (!merged.has(key)) merged.set(key, item)
        }
        return [...merged.values()]
      } catch (error) {
        console.error(`News fetch failed for ${meta.symbol}:`, error)
        return [] as StockNewsItem[]
      }
    }),
  )

  return batches
    .flat()
    .sort((a, b) => b.publishedAt - a.publishedAt)
}
