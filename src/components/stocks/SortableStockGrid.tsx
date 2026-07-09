import { Reorder, useDragControls } from 'framer-motion'
import { GripVertical } from 'lucide-react'
import type { StockQuote, WatchlistItem } from '../../types/stocks'
import { StockCard } from './StockCard'

interface SortableStockGridProps {
  items: WatchlistItem[]
  quotes: Record<string, StockQuote>
  flash: Record<string, 'up' | 'down' | null>
  onReorder: (items: WatchlistItem[]) => void
  onRemove: (symbol: string) => void
}

function SortableStockCard({
  item,
  quote,
  flash,
  onRemove,
}: {
  item: WatchlistItem
  quote?: StockQuote
  flash?: 'up' | 'down' | null
  onRemove: (symbol: string) => void
}) {
  const controls = useDragControls()

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="relative list-none"
      whileDrag={{
        scale: 1.03,
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        zIndex: 50,
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative rounded-2xl ring-2 ring-indigo-500/30 ring-offset-2 ring-offset-surface-0">
        <button
          type="button"
          onPointerDown={(e) => controls.start(e)}
          className="absolute -left-2 top-1/2 z-10 flex h-10 w-6 -translate-y-1/2 cursor-grab items-center justify-center rounded-lg border border-white/10 bg-surface-1 text-zinc-400 shadow-lg transition hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-400 active:cursor-grabbing"
          aria-label={`${item.symbol} sürükle`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <StockCard
          item={item}
          quote={quote}
          flash={flash}
          onRemove={onRemove}
          sortMode
        />
      </div>
    </Reorder.Item>
  )
}

export function SortableStockGrid({
  items,
  quotes,
  flash,
  onReorder,
  onRemove,
}: SortableStockGridProps) {
  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onReorder}
      className="flex flex-wrap gap-4 pl-4"
    >
      {items.map((item) => (
        <SortableStockCard
          key={item.symbol}
          item={item}
          quote={quotes[item.symbol]}
          flash={flash[item.symbol]}
          onRemove={onRemove}
        />
      ))}
    </Reorder.Group>
  )
}
