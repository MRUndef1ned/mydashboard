import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { StockQuote, WatchlistItem } from '../../../types/stocks'
import { StockTableRow } from '../StockTableRow'

export function SortableStockTable({
  items,
  quotes,
}: {
  items: WatchlistItem[]
  quotes: Record<string, StockQuote>
}) {
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
              <SortableTableRow key={item.symbol} item={item} quote={quotes[item.symbol]} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SortableTableRow({
  item,
  quote,
}: {
  item: WatchlistItem
  quote?: StockQuote
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.symbol,
  })

  return (
    <StockTableRow
      ref={setNodeRef}
      item={item}
      quote={quote}
      sortMode
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      }}
      className="cursor-grab touch-none active:cursor-grabbing"
      {...attributes}
      {...listeners}
    />
  )
}
