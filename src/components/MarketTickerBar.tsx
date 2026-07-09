import { AnimatePresence, motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { useMarketBanner } from '../hooks/useMarketBanner'
import { getMarketTheme } from '../utils/stockViews'

function formatTickerPrice(price: number, currency: string, type: string) {
  if (type === 'index') {
    return price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })
  }
  if (currency === 'TRY') {
    return `₺${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function TickerChip({ item }: { item: ReturnType<typeof useMarketBanner>['items'][0] }) {
  const isUp = item.change >= 0
  const isStock = item.type === 'stock'
  const theme = item.market ? getMarketTheme(item.market) : null

  return (
    <div
      className={`flex shrink-0 items-center gap-2.5 rounded-lg border px-3 py-1.5 ${
        isStock && theme
          ? `${theme.cardBorder} ${theme.rowBg}`
          : 'border-white/6 bg-white/3'
      }`}
    >
      <span
        className={`text-[11px] font-semibold uppercase tracking-wide ${
          isStock && theme ? theme.accent : 'text-zinc-500'
        }`}
      >
        {item.label}
      </span>
      <span className="text-sm font-semibold tabular-nums text-white">
        {formatTickerPrice(item.price, item.currency, item.type)}
      </span>
      <span
        className={`flex items-center gap-0.5 text-[11px] font-medium tabular-nums ${
          isUp ? 'text-emerald-400' : 'text-rose-400'
        }`}
      >
        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {isUp ? '+' : ''}
        {item.changePercent.toFixed(2)}%
      </span>
      {isStock && (
        <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 text-[9px] font-medium text-indigo-400">
          Liste
        </span>
      )}
    </div>
  )
}

export function MarketTickerBar() {
  const { items, loading, highlightSymbol } = useMarketBanner()

  if (loading && items.length === 0) {
    return (
      <div className="border-b border-white/6 bg-surface-1/40 px-4 py-2 sm:px-8">
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-28 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) return null

  const coreItems = items.filter((i) => i.type !== 'stock')
  const stockItem = items.find((i) => i.type === 'stock')

  return (
    <div className="border-b border-white/6 bg-gradient-to-r from-surface-1/60 via-surface-1/40 to-surface-1/60 px-4 py-2 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
        <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 sm:inline">
          Canlı
        </span>

        {coreItems.map((item) => (
          <TickerChip key={item.id} item={item} />
        ))}

        {stockItem && (
          <>
            <div className="h-6 w-px shrink-0 bg-white/10" />
            <AnimatePresence mode="wait">
              <motion.div
                key={highlightSymbol ?? stockItem.symbol}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <TickerChip item={stockItem} />
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  )
}
