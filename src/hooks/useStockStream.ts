import { useCallback, useEffect, useRef, useState } from 'react'
import type { StockQuote } from '../types/stocks'

type ConnectionStatus = 'connecting' | 'live' | 'error' | 'idle'

interface StreamState {
  quotes: Record<string, StockQuote>
  status: ConnectionStatus
  lastUpdated: number | null
  error: string | null
  pollInterval: number
  marketOpen: boolean
}

export function useStockStream(symbols: string[]) {
  const [state, setState] = useState<StreamState>({
    quotes: {},
    status: 'idle',
    lastUpdated: null,
    error: null,
    pollInterval: 30_000,
    marketOpen: false,
  })
  const prevPrices = useRef<Record<string, number>>({})
  const [flash, setFlash] = useState<Record<string, 'up' | 'down' | null>>({})

  const symbolsKey = symbols.join(',')

  const triggerFlash = useCallback((quotes: StockQuote[]) => {
    const newFlash: Record<string, 'up' | 'down' | null> = {}
    for (const q of quotes) {
      const prev = prevPrices.current[q.symbol]
      if (prev != null && prev !== q.price) {
        newFlash[q.symbol] = q.price > prev ? 'up' : 'down'
      }
      prevPrices.current[q.symbol] = q.price
    }
    if (Object.keys(newFlash).length > 0) {
      setFlash((f) => ({ ...f, ...newFlash }))
      setTimeout(() => {
        setFlash((f) => {
          const cleared = { ...f }
          for (const sym of Object.keys(newFlash)) cleared[sym] = null
          return cleared
        })
      }, 1200)
    }
  }, [])

  useEffect(() => {
    if (symbols.length === 0) {
      setState({
        quotes: {},
        status: 'idle',
        lastUpdated: null,
        error: null,
        pollInterval: 30_000,
        marketOpen: false,
      })
      return
    }

    setState((s) => ({ ...s, status: 'connecting', error: null }))

    const url = `/api/stocks/stream?symbols=${encodeURIComponent(symbolsKey)}`
    const es = new EventSource(url)

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.error) {
          setState((s) => ({ ...s, status: 'error', error: data.error }))
          return
        }

        const map: Record<string, StockQuote> = {}
        for (const q of data.quotes as StockQuote[]) {
          map[q.symbol] = q
        }

        triggerFlash(data.quotes)
        setState({
          quotes: map,
          status: 'live',
          lastUpdated: data.updatedAt,
          error: null,
          pollInterval: data.pollInterval ?? 30_000,
          marketOpen: data.marketOpen ?? false,
        })
      } catch {
        setState((s) => ({ ...s, status: 'error', error: 'Veri işlenemedi' }))
      }
    }

    es.onerror = () => {
      setState((s) => ({
        ...s,
        // EventSource otomatik yeniden bağlanır; ekrandaki son fiyatları koru.
        status: Object.keys(s.quotes).length > 0 ? 'live' : 'connecting',
        error: null,
      }))
    }

    return () => {
      es.close()
    }
  }, [symbolsKey, symbols.length, triggerFlash])

  return { ...state, flash }
}

export async function searchStocks(query: string) {
  const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('Arama başarısız')
  const data = await res.json()
  return data.results
}
