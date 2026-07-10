import express from 'express'
import cors from 'cors'
import { fetchHistoricalSeries, fetchQuotes, normalizeSymbol, searchStocks } from './yahoo.js'
import {
  getCachedQuotes,
  getStaleCachedQuotes,
  setCachedQuotes,
  getPollInterval,
  isAnyMarketOpen,
} from './cache.js'
import { fetchMarketBanner } from './marketBanner.js'
import { fetchWatchlistNews } from './news.js'
import { fetchArticleContent } from './articleReader.js'

const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(cors())
app.use(express.json())

async function getQuotesWithCache(symbols: string[]) {
  const normalized = [...new Set(symbols.map((s) => normalizeSymbol(s)))].sort()
  const key = normalized.join(',')

  const cached = getCachedQuotes(key)
  if (cached) return cached

  const quotes = await fetchQuotes(normalized)
  if (quotes.length > 0) {
    setCachedQuotes(key, quotes)
    return quotes
  }

  return getStaleCachedQuotes(key) ?? []
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'nexus-stocks',
    marketOpen: isAnyMarketOpen(),
    pollIntervalSec: getPollInterval() / 1000,
  })
})

app.get('/api/stocks', async (req, res) => {
  try {
    const raw = req.query.symbols
    const symbols =
      typeof raw === 'string' ? raw.split(',').map((s) => s.trim()).filter(Boolean) : []

    if (symbols.length === 0) {
      return res.status(400).json({ error: 'symbols parametresi gerekli' })
    }

    const quotes = await getQuotesWithCache(symbols)
    res.json({ quotes, updatedAt: Date.now() })
  } catch (err) {
    console.error('Quote fetch error:', err)
    res.status(500).json({ error: 'Fiyat verisi alınamadı' })
  }
})

app.get('/api/stocks/search', async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : ''
    if (!q.trim()) return res.json({ results: [] })

    const results = await searchStocks(q)
    res.json({ results })
  } catch (err) {
    console.error('Search error:', err)
    res.status(500).json({ error: 'Arama başarısız' })
  }
})

app.get('/api/stocks/history', async (req, res) => {
  try {
    const raw = typeof req.query.symbols === 'string' ? req.query.symbols : ''
    const symbols = raw.split(',').map((symbol) => symbol.trim()).filter(Boolean)
    const requestedRange = typeof req.query.range === 'string' ? req.query.range : '1mo'
    const range =
      requestedRange === '3mo' || requestedRange === '1y' ? requestedRange : '1mo'

    if (symbols.length === 0) {
      return res.status(400).json({ error: 'symbols parametresi gerekli' })
    }

    const series = await fetchHistoricalSeries(symbols, range)
    res.json({ series, range, updatedAt: Date.now() })
  } catch (err) {
    console.error('History fetch error:', err)
    res.status(500).json({ error: 'Tarihsel fiyat verisi alınamadı' })
  }
})

app.get('/api/stocks/news', async (req, res) => {
  try {
    const rawSymbols = typeof req.query.symbols === 'string' ? req.query.symbols : ''
    const rawNames = typeof req.query.names === 'string' ? req.query.names : ''
    const symbols = rawSymbols.split(',').map((symbol) => symbol.trim()).filter(Boolean)
    const names = rawNames.split('|').map((name) => name.trim())

    if (symbols.length === 0) {
      return res.status(400).json({ error: 'symbols parametresi gerekli' })
    }

    const metas = symbols.map((symbol, index) => ({
      symbol,
      name: names[index] || undefined,
    }))
    const items = await fetchWatchlistNews(metas)
    res.json({ items, updatedAt: Date.now() })
  } catch (err) {
    console.error('News fetch error:', err)
    res.status(500).json({ error: 'Haberler alınamadı' })
  }
})

app.get('/api/stocks/news/article', async (req, res) => {
  try {
    const url = typeof req.query.url === 'string' ? req.query.url.trim() : ''
    const title = typeof req.query.title === 'string' ? req.query.title : undefined
    const publisher = typeof req.query.publisher === 'string' ? req.query.publisher : undefined

    if (!url || !/^https?:\/\//i.test(url)) {
      return res.status(400).json({ error: 'Geçerli bir haber url gerekli' })
    }

    const article = await fetchArticleContent(url, { title, publisher })
    res.json({ article })
  } catch (err) {
    console.error('Article fetch error:', err)
    res.status(500).json({ error: 'Haber içeriği alınamadı' })
  }
})

app.get('/api/market/banner', async (req, res) => {
  try {
    const highlight = typeof req.query.highlight === 'string' ? req.query.highlight.trim() : undefined
    const items = await fetchMarketBanner(highlight)
    res.json({ items, updatedAt: Date.now() })
  } catch (err) {
    console.error('Banner fetch error:', err)
    res.status(500).json({ error: 'Piyasa verisi alınamadı' })
  }
})

app.get('/api/stocks/stream', (req, res) => {
  const raw = req.query.symbols
  const symbols =
    typeof raw === 'string'
      ? raw.split(',').map((s) => normalizeSymbol(s.trim())).filter(Boolean)
      : []

  if (symbols.length === 0) {
    return res.status(400).json({ error: 'symbols parametresi gerekli' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  let active = true
  let timer: ReturnType<typeof setTimeout> | null = null
  let currentInterval = getPollInterval()

  async function push() {
    if (!active) return
    try {
      const quotes = await getQuotesWithCache(symbols)
      res.write(
        `data: ${JSON.stringify({
          quotes,
          updatedAt: Date.now(),
          pollInterval: getPollInterval(),
          marketOpen: isAnyMarketOpen(),
        })}\n\n`,
      )
    } catch (err) {
      console.error('Stream error:', err)
      res.write(`data: ${JSON.stringify({ error: 'Güncelleme başarısız', updatedAt: Date.now() })}\n\n`)
    }
  }

  function schedule() {
    if (timer) clearTimeout(timer)
    timer = setTimeout(async () => {
      await push()
      currentInterval = getPollInterval()
      schedule()
    }, currentInterval)
  }

  void push().finally(schedule)

  const marketCheck = setInterval(() => {
    const nextInterval = getPollInterval()
    if (nextInterval !== currentInterval) {
      currentInterval = nextInterval
      if (timer) clearTimeout(timer)
      void push().finally(schedule)
    }
  }, 60_000)

  const heartbeat = setInterval(() => {
    if (active) res.write(': keepalive\n\n')
  }, 25_000)

  req.on('close', () => {
    active = false
    if (timer) clearTimeout(timer)
    clearInterval(marketCheck)
    clearInterval(heartbeat)
  })
})

app.listen(PORT, () => {
  console.log(`📈 Nexus Stocks API → http://localhost:${PORT}`)
  console.log('   Piyasa açık: 30sn | Kapalı: 1sa | Önbellek: dinamik')
})
