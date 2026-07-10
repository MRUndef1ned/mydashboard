import { useEffect, useMemo, useState } from 'react'
import { useWatchlist } from '../context/WatchlistContext'

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

export function useWatchlistNews(filterSymbol?: string | 'all') {
  const { items } = useWatchlist()
  const [news, setNews] = useState<StockNewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)

  const symbolsKey = items.map((item) => item.symbol).join(',')
  const namesKey = items.map((item) => item.name).join('|')

  useEffect(() => {
    if (items.length === 0) {
      setNews([])
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `/api/stocks/news?symbols=${encodeURIComponent(symbolsKey)}&names=${encodeURIComponent(namesKey)}`,
          { signal: controller.signal },
        )
        if (!response.ok) throw new Error('news failed')
        const data = await response.json()
        setNews(data.items ?? [])
        setUpdatedAt(data.updatedAt ?? Date.now())
      } catch (reason) {
        if ((reason as Error).name !== 'AbortError') {
          setError('Haberler alınamadı. API sunucusunun çalıştığından emin olun.')
        }
      } finally {
        setLoading(false)
      }
    }

    load()
    const timer = setInterval(load, 20 * 60 * 1000)
    return () => {
      controller.abort()
      clearInterval(timer)
    }
  }, [symbolsKey, namesKey, items.length])

  const filtered = useMemo(() => {
    if (!filterSymbol || filterSymbol === 'all') return news
    return news.filter((item) => item.symbol === filterSymbol)
  }, [news, filterSymbol])

  return { news: filtered, allNews: news, loading, error, updatedAt, watchlist: items }
}
