import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { StockQuote, WatchlistItem } from '../../../types/stocks'
import { StockListRow } from '../StockListRow'

export function SortableStockList({
  items,
  quotes,
  flash,
}: {
  items: WatchlistItem[]
  quotes: Record<string, StockQuote>
  flash: Record<string, 'up' | 'down' | null>
}) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <SortableListItem
          key={item.symbol}
          item={item}
          quote={quotes[item.symbol]}
          flash={flash[item.symbol]}
        />
      ))}
    </div>
  )
}

function SortableListItem({
  item,
  quote,
  flash,
}: {
  item: WatchlistItem
  quote?: StockQuote
  flash?: 'up' | 'down' | null
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.symbol,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`touch-none cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-30' : ''}`}
    >
      <StockListRow item={item} quote={quote} flash={flash} sortMode />
    </div>
  )
}
