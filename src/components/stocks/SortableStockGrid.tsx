import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { StockQuote, WatchlistItem } from '../../types/stocks'
import { StockCard } from './StockCard'
import { STOCK_GRID_CLASS } from './stockGrid'

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
}: {
  item: WatchlistItem
  quote?: StockQuote
  flash?: 'up' | 'down' | null
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.symbol })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative h-full touch-none cursor-grab active:cursor-grabbing ${
        isDragging ? 'z-0 opacity-30' : 'z-auto opacity-100'
      }`}
    >
      <div
        className={`relative h-full rounded-2xl transition-shadow ${
          isDragging ? 'ring-2 ring-indigo-500/20' : 'ring-2 ring-indigo-500/30 ring-offset-2 ring-offset-surface-0'
        }`}
      >
        <div
          className="pointer-events-none absolute left-2 top-1/2 z-10 flex h-10 w-7 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-surface-1 text-indigo-400 shadow-lg"
          aria-hidden
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <StockCard item={item} quote={quote} flash={flash} onRemove={() => {}} sortMode />
      </div>
    </div>
  )
}

function DragOverlayCard({
  item,
  quote,
  flash,
}: {
  item: WatchlistItem
  quote?: StockQuote
  flash?: 'up' | 'down' | null
}) {
  return (
    <div className="w-full rotate-1 scale-[1.02] cursor-grabbing rounded-2xl shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-400/50">
      <StockCard item={item} quote={quote} flash={flash} onRemove={() => {}} sortMode />
    </div>
  )
}

export function SortableStockGrid({
  items,
  quotes,
  flash,
  onReorder,
}: SortableStockGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  const ids = items.map((i) => i.symbol)
  const activeItem = activeId ? items.find((i) => i.symbol === activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.symbol === active.id)
    const newIndex = items.findIndex((i) => i.symbol === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    onReorder(arrayMove(items, oldIndex, newIndex))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className={STOCK_GRID_CLASS}>
          {items.map((item) => (
            <SortableStockCard
              key={item.symbol}
              item={item}
              quote={quotes[item.symbol]}
              flash={flash[item.symbol]}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay adjustScale={false} dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
        {activeItem ? (
          <DragOverlayCard
            item={activeItem}
            quote={quotes[activeItem.symbol]}
            flash={flash[activeItem.symbol]}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
