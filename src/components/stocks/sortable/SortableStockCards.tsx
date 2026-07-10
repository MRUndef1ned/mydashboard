import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { StockQuote, WatchlistItem } from '../../../types/stocks'
import { StockCard } from '../StockCard'
import { STOCK_GRID_CLASS } from '../stockGrid'

export function SortableStockCards({
  items,
  quotes,
  flash,
}: {
  items: WatchlistItem[]
  quotes: Record<string, StockQuote>
  flash: Record<string, 'up' | 'down' | null>
}) {
  return (
    <div className={STOCK_GRID_CLASS}>
      {items.map((item) => (
        <SortableCardItem
          key={item.symbol}
          item={item}
          quote={quotes[item.symbol]}
          flash={flash[item.symbol]}
        />
      ))}
    </div>
  )
}

function SortableCardItem({
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
      className={`relative h-full touch-none cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-30' : 'opacity-100'
      }`}
    >
      <div className="relative h-full rounded-2xl ring-2 ring-indigo-500/30 ring-offset-2 ring-offset-surface-0">
        <div className="pointer-events-none absolute left-2 top-1/2 z-10 flex h-10 w-7 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-surface-1 text-indigo-400 shadow-lg">
          <GripVertical className="h-4 w-4" />
        </div>
        <StockCard item={item} quote={quote} flash={flash} onRemove={() => {}} sortMode />
      </div>
    </div>
  )
}
