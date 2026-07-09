import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, X, Wifi } from 'lucide-react'
import type { StockQuote } from '../../types/stocks'
import type { WatchlistItem } from '../../types/stocks'
import { displaySymbol, formatPrice, formatVolume } from '../../types/stocks'

interface StockCardProps {
  item: WatchlistItem
  quote?: StockQuote
  flash?: 'up' | 'down' | null
  onRemove: (symbol: string) => void
  sortMode?: boolean
}

export function StockCard({ item, quote, flash, onRemove, sortMode }: StockCardProps) {
  const isUp = quote ? quote.change >= 0 : true

  return (
    <motion.div
      layout={!sortMode}
      initial={sortMode ? false : { opacity: 0, scale: 0.95 }}
      animate={sortMode ? undefined : { opacity: 1, scale: 1 }}
      exit={sortMode ? undefined : { opacity: 0, scale: 0.95 }}
      className={`group relative w-full overflow-hidden rounded-2xl border bg-surface-2/60 p-5 transition-all duration-500 ${
        sortMode ? 'cursor-default select-none' : ''
      } ${
        flash === 'up'
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : flash === 'down'
            ? 'border-rose-500/40 bg-rose-500/5'
            : 'border-white/6 hover:border-white/10'
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl text-xs font-bold ${
              item.market === 'BIST'
                ? 'bg-rose-500/15 text-rose-400'
                : 'bg-emerald-500/15 text-emerald-400'
            }`}
          >
            {displaySymbol(item.symbol).slice(0, 4)}
          </div>
          <div>
            <h3 className="font-semibold text-white">{displaySymbol(item.symbol)}</h3>
            <p className="truncate text-[11px] text-zinc-500">
              {quote?.name ?? item.name}
            </p>
          </div>
        </div>
        <button
          onClick={() => onRemove(item.symbol)}
          disabled={sortMode}
          className="rounded-lg p-1 text-zinc-600 opacity-0 transition group-hover:opacity-100 hover:bg-white/5 hover:text-zinc-300 disabled:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {quote ? (
        <>
          <div className="mb-3">
            <motion.p
              key={quote.price}
              initial={{ opacity: 0.7, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-semibold tabular-nums tracking-tight text-white"
            >
              {formatPrice(quote.price, quote.currency)}
            </motion.p>
            <div
              className={`mt-1 flex items-center gap-1.5 text-sm font-medium ${
                isUp ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isUp ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              <span className="tabular-nums">
                {isUp ? '+' : ''}
                {quote.change.toFixed(2)} ({isUp ? '+' : ''}
                {quote.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-white/6 pt-3">
            <div>
              <p className="text-[10px] text-zinc-600">Gün Aralığı</p>
              <p className="text-[11px] font-medium tabular-nums text-zinc-400">
                {formatPrice(quote.dayLow, quote.currency)} –{' '}
                {formatPrice(quote.dayHigh, quote.currency)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600">Hacim</p>
              <p className="text-[11px] font-medium text-zinc-400">
                {formatVolume(quote.volume)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600">Borsa</p>
              <p className="text-[11px] font-medium text-zinc-400">
                {item.market === 'BIST' ? 'BIST' : 'NASDAQ/NYSE'}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 py-6 text-sm text-zinc-500">
          <Wifi className="h-4 w-4 animate-pulse" />
          Fiyat yükleniyor...
        </div>
      )}
    </motion.div>
  )
}
