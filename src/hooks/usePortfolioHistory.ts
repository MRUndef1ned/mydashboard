import { useEffect, useMemo, useState } from 'react'
import type { PortfolioHolding } from '../types/portfolio'

export type HistoryRange = '1mo' | '3mo' | '1y'

interface HistoricalPoint {
  time: number
  close: number
}

interface HistoricalSeries {
  symbol: string
  points: HistoricalPoint[]
}

export interface PerformancePoint {
  time: number
  portfolio: number
  bist: number | null
  sp500: number | null
}

function valueAt(points: HistoricalPoint[] | undefined, time: number) {
  if (!points?.length) return null
  let value: number | null = null
  for (const point of points) {
    if (point.time > time) break
    value = point.close
  }
  return value
}

export function usePortfolioHistory(holdings: PortfolioHolding[], range: HistoryRange) {
  const [series, setSeries] = useState<HistoricalSeries[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const openHoldings = useMemo(
    () => holdings.filter((holding) => holding.quantity > 0),
    [holdings],
  )
  const symbolsKey = openHoldings.map((holding) => holding.symbol).sort().join(',')

  useEffect(() => {
    if (!symbolsKey) {
      setSeries([])
      return
    }

    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const symbols = [...new Set([...symbolsKey.split(','), 'USDTRY=X', 'XU100.IS', '^GSPC'])]
        const response = await fetch(
          `/api/stocks/history?symbols=${encodeURIComponent(symbols.join(','))}&range=${range}`,
          { signal: controller.signal },
        )
        if (!response.ok) throw new Error('history failed')
        const data = await response.json()
        setSeries(data.series ?? [])
      } catch (reason) {
        if ((reason as Error).name !== 'AbortError') {
          setError('Performans geçmişi alınamadı')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [symbolsKey, range])

  const points = useMemo(() => {
    const map = new Map(series.map((item) => [item.symbol, item.points]))
    const anchor =
      map.get('XU100.IS') ??
      map.get(openHoldings[0]?.symbol ?? '') ??
      []
    const raw = anchor
      .map((point) => {
        const fx = valueAt(map.get('USDTRY=X'), point.time)
        let portfolioValue = 0
        let hasValue = false

        for (const holding of openHoldings) {
          const close = valueAt(map.get(holding.symbol), point.time)
          if (close == null) continue
          if (holding.market === 'US' && fx == null) continue
          portfolioValue += holding.quantity * close * (holding.market === 'US' ? fx! : 1)
          hasValue = true
        }

        return {
          time: point.time,
          value: hasValue ? portfolioValue : null,
          bistValue: valueAt(map.get('XU100.IS'), point.time),
          sp500Value: valueAt(map.get('^GSPC'), point.time),
        }
      })
      .filter((point) => point.value != null && point.value > 0)

    const first = raw[0]
    if (!first?.value) return []
    const firstBist = raw.find((point) => point.bistValue != null)?.bistValue ?? null
    const firstSp500 = raw.find((point) => point.sp500Value != null)?.sp500Value ?? null

    return raw.map(
      (point): PerformancePoint => ({
        time: point.time,
        portfolio: ((point.value! / first.value!) - 1) * 100,
        bist:
          point.bistValue != null && firstBist != null
            ? ((point.bistValue / firstBist) - 1) * 100
            : null,
        sp500:
          point.sp500Value != null && firstSp500 != null
            ? ((point.sp500Value / firstSp500) - 1) * 100
            : null,
      }),
    )
  }, [series, openHoldings])

  return { points, loading, error }
}
