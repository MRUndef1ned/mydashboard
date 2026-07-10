import { useMemo, useState } from 'react'
import { Loader2, PieChart, TrendingUp } from 'lucide-react'
import type { StockQuote } from '../../types/stocks'
import { displaySymbol, formatPrice } from '../../types/stocks'
import type { PortfolioHolding } from '../../types/portfolio'
import {
  usePortfolioHistory,
  type HistoryRange,
  type PerformancePoint,
} from '../../hooks/usePortfolioHistory'

const COLORS = ['#818cf8', '#22d3ee', '#34d399', '#fb7185', '#fbbf24', '#c084fc', '#60a5fa']

export function PortfolioCharts({
  holdings,
  quotes,
}: {
  holdings: PortfolioHolding[]
  quotes: Record<string, StockQuote>
}) {
  const openHoldings = holdings.filter((holding) => holding.quantity > 0)

  return (
    <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <AllocationPanel holdings={openHoldings} quotes={quotes} />
      <PerformancePanel holdings={openHoldings} />
    </div>
  )
}

function AllocationPanel({
  holdings,
  quotes,
}: {
  holdings: PortfolioHolding[]
  quotes: Record<string, StockQuote>
}) {
  const [market, setMarket] = useState<'BIST' | 'US'>('BIST')
  const rows = useMemo(() => {
    const items = holdings
      .filter((holding) => holding.market === market)
      .map((holding) => ({
        ...holding,
        value: holding.quantity * (quotes[holding.symbol]?.price ?? holding.averageCost),
      }))
      .sort((a, b) => b.value - a.value)
    const total = items.reduce((sum, item) => sum + item.value, 0)
    return items.map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length],
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    }))
  }, [holdings, quotes, market])

  let cursor = 0
  const gradient =
    rows.length > 0
      ? `conic-gradient(${rows
          .map((row) => {
            const start = cursor
            cursor += row.percentage
            return `${row.color} ${start}% ${cursor}%`
          })
          .join(', ')})`
      : 'conic-gradient(#27272a 0 100%)'

  return (
    <section className="rounded-2xl border border-white/6 bg-surface-1/55 p-5">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Portföy Dağılımı</h3>
          </div>
          <p className="mt-1 text-xs text-zinc-500">Güncel piyasa değerine göre</p>
        </div>
        <div className="flex rounded-lg bg-white/3 p-1">
          {(['BIST', 'US'] as const).map((item) => (
            <button
              key={item}
              onClick={() => setMarket(item)}
              className={`rounded-md px-2.5 py-1 text-[10px] font-semibold ${
                market === item ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500'
              }`}
            >
              {item === 'US' ? 'ABD' : item}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-xs text-zinc-600">
          Bu piyasada açık pozisyon yok
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="relative h-36 w-36 shrink-0 rounded-full" style={{ background: gradient }}>
            <div className="absolute inset-5 flex items-center justify-center rounded-full bg-surface-1">
              <div className="text-center">
                <p className="text-[10px] text-zinc-600">Hisse</p>
                <p className="text-xl font-semibold text-white">{rows.length}</p>
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-2.5">
            {rows.slice(0, 6).map((row) => (
              <div key={row.symbol} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-300">
                  {displaySymbol(row.symbol)}
                </span>
                <span className="text-xs tabular-nums text-zinc-500">{row.percentage.toFixed(1)}%</span>
                <span className="hidden text-xs tabular-nums text-zinc-400 sm:block">
                  {formatPrice(row.value, market === 'BIST' ? 'TRY' : 'USD')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function PerformancePanel({ holdings }: { holdings: PortfolioHolding[] }) {
  const [range, setRange] = useState<HistoryRange>('1mo')
  const { points, loading, error } = usePortfolioHistory(holdings, range)
  const latest = points.at(-1)

  return (
    <section className="rounded-2xl border border-white/6 bg-surface-1/55 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Performans Karşılaştırması</h3>
          </div>
          <p className="mt-1 text-xs text-zinc-500">Mevcut açık pozisyon dağılımının fiyat performansı</p>
        </div>
        <div className="flex rounded-lg bg-white/3 p-1">
          {([
            ['1mo', '1A'],
            ['3mo', '3A'],
            ['1y', '1Y'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setRange(value)}
              className={`rounded-md px-2.5 py-1 text-[10px] font-semibold ${
                range === value ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-4">
        <Legend color="#818cf8" label="Portföy" value={latest?.portfolio} />
        <Legend color="#fb7185" label="BIST 100" value={latest?.bist} />
        <Legend color="#34d399" label="S&P 500" value={latest?.sp500} />
      </div>

      <div className="flex h-48 items-center justify-center">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Geçmiş fiyatlar yükleniyor...
          </div>
        ) : error || points.length < 2 ? (
          <p className="text-xs text-zinc-600">
            {holdings.length === 0 ? 'Grafik için açık pozisyon ekleyin' : error ?? 'Yeterli geçmiş veri yok'}
          </p>
        ) : (
          <PerformanceSvg points={points} />
        )}
      </div>
    </section>
  )
}

function Legend({
  color,
  label,
  value,
}: {
  color: string
  label: string
  value: number | null | undefined
}) {
  const number = value ?? 0
  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-zinc-500">{label}</span>
      <span className={number >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
        {value == null ? '—' : `${number >= 0 ? '+' : ''}${number.toFixed(2)}%`}
      </span>
    </div>
  )
}

function PerformanceSvg({ points }: { points: PerformancePoint[] }) {
  const width = 720
  const height = 190
  const padding = 14
  const values = points.flatMap((point) =>
    [point.portfolio, point.bist, point.sp500].filter((value): value is number => value != null),
  )
  let min = Math.min(...values, 0)
  let max = Math.max(...values, 0)
  const spread = Math.max(max - min, 2)
  min -= spread * 0.12
  max += spread * 0.12

  const x = (index: number) => padding + (index / (points.length - 1)) * (width - padding * 2)
  const y = (value: number) =>
    padding + ((max - value) / (max - min)) * (height - padding * 2)
  const path = (key: 'portfolio' | 'bist' | 'sp500') => {
    let started = false
    return points
      .map((point, index) => {
        const value = point[key]
        if (value == null) return ''
        const command = started ? 'L' : 'M'
        started = true
        return `${command}${x(index).toFixed(1)},${y(value).toFixed(1)}`
      })
      .join(' ')
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible" role="img" aria-label="Portföy performans grafiği">
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <line
          key={ratio}
          x1={padding}
          x2={width - padding}
          y1={padding + ratio * (height - padding * 2)}
          y2={padding + ratio * (height - padding * 2)}
          stroke="rgba(255,255,255,0.055)"
          strokeWidth="1"
        />
      ))}
      {min < 0 && max > 0 && (
        <line x1={padding} x2={width - padding} y1={y(0)} y2={y(0)} stroke="rgba(255,255,255,0.15)" strokeDasharray="5 5" />
      )}
      <path d={path('portfolio')} fill="none" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path('bist')} fill="none" stroke="#fb7185" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      <path d={path('sp500')} fill="none" stroke="#34d399" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  )
}
