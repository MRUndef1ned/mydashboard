import express from 'express'
import cors from 'cors'
import { fetchQuotes, normalizeSymbol, searchStocks } from './yahoo.js'
import { getCachedQuotes, setCachedQuotes, getPollInterval, isAnyMarketOpen } from './cache.js'

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
  setCachedQuotes(key, quotes)
  return quotes
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
  let timer: ReturnType<typeof setInterval> | null = null

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
    if (timer) clearInterval(timer)
    timer = setInterval(push, getPollInterval())
  }

  push()
  schedule()

  const marketCheck = setInterval(() => {
    schedule()
  }, 60_000)

  req.on('close', () => {
    active = false
    if (timer) clearInterval(timer)
    clearInterval(marketCheck)
  })
})

app.listen(PORT, () => {
  console.log(`📈 Nexus Stocks API → http://localhost:${PORT}`)
  console.log(`   Piyasa açık: ${getPollInterval() / 1000}sn | Kapalı: 120sn | Önbellek: 25sn`)
})
