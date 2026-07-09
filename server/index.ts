import express from 'express'
import cors from 'cors'
import { fetchQuotes, normalizeSymbol, searchStocks } from './yahoo.js'

const app = express()
const PORT = Number(process.env.PORT) || 3001
const POLL_INTERVAL = 10_000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'nexus-stocks' })
})

app.get('/api/stocks', async (req, res) => {
  try {
    const raw = req.query.symbols
    const symbols =
      typeof raw === 'string' ? raw.split(',').map((s) => s.trim()).filter(Boolean) : []

    if (symbols.length === 0) {
      return res.status(400).json({ error: 'symbols parametresi gerekli' })
    }

    const quotes = await fetchQuotes(symbols)
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

  async function push() {
    if (!active) return
    try {
      const quotes = await fetchQuotes(symbols)
      res.write(`data: ${JSON.stringify({ quotes, updatedAt: Date.now() })}\n\n`)
    } catch (err) {
      console.error('Stream error:', err)
      res.write(`data: ${JSON.stringify({ error: 'Güncelleme başarısız', updatedAt: Date.now() })}\n\n`)
    }
  }

  push()
  const timer = setInterval(push, POLL_INTERVAL)

  req.on('close', () => {
    active = false
    clearInterval(timer)
  })
})

app.listen(PORT, () => {
  console.log(`📈 Nexus Stocks API → http://localhost:${PORT}`)
})
