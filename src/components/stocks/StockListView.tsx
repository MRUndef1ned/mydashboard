import { X } from 'lucide-react'
import type { StockQuote, WatchlistItem } from '../../types/stocks'
import { StockListRow } from './StockListRow'

interface StockListViewProps {
  items: WatchlistItem[]
  quotes: Record<string, StockQuote>
  flash: Record<string, 'up' | 'down' | null>
  onRemove: (symbol: string) => void
}

export function StockListView({ items, quotes, flash, onRemove }: StockListViewProps) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.symbol} className="group relative">
          <StockListRow
            item={item}
            quote={quotes[item.symbol]}
            flash={flash[item.symbol]}
          />
          <button
            onClick={() => onRemove(item.symbol)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-600 opacity-0 transition group-hover:opacity-100 hover:bg-white/5 hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
