import { GripVertical } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import type { StockQuote, WatchlistItem } from '../../types/stocks'
import { displaySymbol, formatPrice } from '../../types/stocks'
import { getMarketTheme } from '../../utils/stockViews'

interface StockListRowProps {
  item: WatchlistItem
  quote?: StockQuote
  flash?: 'up' | 'down' | null
  sortMode?: boolean
}

export function StockListRow({ item, quote, flash, sortMode }: StockListRowProps) {
  const theme = getMarketTheme(item.market)
  const isUp = quote ? quote.change >= 0 : true
  const flashCls =
    flash === 'up'
      ? 'ring-1 ring-emerald-500/40'
      : flash === 'down'
        ? 'ring-1 ring-rose-500/40'
        : ''

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${theme.rowBorder} ${theme.rowBg} ${theme.cardBorder} ${flashCls}`}
    >
      {sortMode && (
        <div className="flex h-8 w-6 shrink-0 items-center justify-center text-indigo-400">
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ring-1 ring-inset ${theme.badge}`}
      >
        {displaySymbol(item.symbol).slice(0, 4)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{displaySymbol(item.symbol)}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${theme.badge}`}>
            {theme.label}
          </span>
        </div>
        <p className="truncate text-xs text-zinc-500">{quote?.name ?? item.name}</p>
      </div>

      {quote ? (
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums text-white">
            {formatPrice(quote.price, quote.currency)}
          </p>
          <p
            className={`flex items-center justify-end gap-1 text-xs font-medium tabular-nums ${
              isUp ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isUp ? '+' : ''}
            {quote.changePercent.toFixed(2)}%
          </p>
        </div>
      ) : (
        <span className="text-xs text-zinc-600">...</span>
      )}
    </div>
  )
}
