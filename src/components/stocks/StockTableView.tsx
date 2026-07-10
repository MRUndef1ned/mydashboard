import type { StockQuote, WatchlistItem } from '../../types/stocks'
import { StockTableRow } from './StockTableRow'

interface StockTableViewProps {
  items: WatchlistItem[]
  quotes: Record<string, StockQuote>
  onRemove: (symbol: string) => void
}

export function StockTableView({ items, quotes, onRemove }: StockTableViewProps) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-white/6 text-left">
              {['Sembol', 'Borsa', 'Fiyat', 'Değişim', 'Hacim', 'Gün Aralığı', ''].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-600"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <StockTableRow
                key={item.symbol}
                item={item}
                quote={quotes[item.symbol]}
                onRemove={onRemove}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
