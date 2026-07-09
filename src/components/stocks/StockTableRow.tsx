import { forwardRef, type HTMLAttributes } from 'react'
import { GripVertical, TrendingDown, TrendingUp, X } from 'lucide-react'
import type { StockQuote, WatchlistItem } from '../../types/stocks'
import { displaySymbol, formatPrice, formatVolume } from '../../types/stocks'
import { getMarketTheme } from '../../utils/stockViews'

interface StockTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  item: WatchlistItem
  quote?: StockQuote
  sortMode?: boolean
  onRemove?: (symbol: string) => void
}

export const StockTableRow = forwardRef<HTMLTableRowElement, StockTableRowProps>(
  function StockTableRow({ item, quote, sortMode, onRemove, className, ...props }, ref) {
    const theme = getMarketTheme(item.market)
    const isUp = quote ? quote.change >= 0 : true

    return (
      <tr
        ref={ref}
        className={`group border-b border-white/4 transition last:border-0 ${theme.tableRow} ${className ?? ''}`}
        {...props}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {sortMode && <GripVertical className="h-4 w-4 shrink-0 text-indigo-400" />}
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ring-1 ring-inset ${theme.badge}`}
            >
              {displaySymbol(item.symbol).slice(0, 3)}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{displaySymbol(item.symbol)}</p>
              <p className="max-w-[140px] truncate text-[11px] text-zinc-500">
                {quote?.name ?? item.name}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${theme.badge}`}>
            {theme.label}
          </span>
        </td>
        <td className="px-4 py-3 text-sm font-semibold tabular-nums text-white">
          {quote ? formatPrice(quote.price, quote.currency) : '—'}
        </td>
        <td className="px-4 py-3">
          {quote ? (
            <span
              className={`inline-flex items-center gap-1 text-sm font-medium tabular-nums ${
                isUp ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {isUp ? '+' : ''}
              {quote.changePercent.toFixed(2)}%
            </span>
          ) : (
            '—'
          )}
        </td>
        <td className="px-4 py-3 text-sm text-zinc-400">
          {quote ? formatVolume(quote.volume) : '—'}
        </td>
        <td className="px-4 py-3 text-xs tabular-nums text-zinc-500">
          {quote
            ? `${formatPrice(quote.dayLow, quote.currency)} – ${formatPrice(quote.dayHigh, quote.currency)}`
            : '—'}
        </td>
        <td className="px-4 py-3">
          {onRemove && !sortMode && (
            <button
              onClick={() => onRemove(item.symbol)}
              className="rounded-lg p-1 text-zinc-600 opacity-0 transition group-hover:opacity-100 hover:bg-white/5 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </td>
      </tr>
    )
  },
)
