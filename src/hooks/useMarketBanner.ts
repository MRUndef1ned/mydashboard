import { useEffect, useState } from 'react'
import { useWatchlist } from '../context/WatchlistContext'

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

export function useMarketBanner() {
  const { symbols } = useWatchlist()
  const [items, setItems] = useState<MarketTickerItem[]>([])
  const [highlightIndex, setHighlightIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const highlightSymbol = symbols.length > 0 ? symbols[highlightIndex % symbols.length] : undefined

  useEffect(() => {
    if (symbols.length === 0) return
    const timer = setInterval(() => {
      setHighlightIndex((i) => (i + 1) % symbols.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [symbols.length])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const params = highlightSymbol
          ? `?highlight=${encodeURIComponent(highlightSymbol)}`
          : ''
        const res = await fetch(`/api/market/banner${params}`)
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        if (active) {
          setItems(data.items)
          setLoading(false)
        }
      } catch {
        if (active) setLoading(false)
      }
    }

    load()
    const timer = setInterval(load, 60_000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [highlightSymbol])

  return { items, loading, highlightSymbol }
}
