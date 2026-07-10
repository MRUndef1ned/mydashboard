import { useState, type ReactNode } from 'react'
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
import { SortableContext, arrayMove, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { StockQuote, WatchlistItem } from '../../types/stocks'
import type { StockViewMode } from '../../utils/stockViews'
import { SortableStockCards } from './sortable/SortableStockCards'
import { SortableStockList } from './sortable/SortableStockList'
import { SortableStockTable } from './sortable/SortableStockTable'
import { StockListRow } from './StockListRow'
import { StockTableRow } from './StockTableRow'
import { StockCard } from './StockCard'

interface SortableStocksProps {
  viewMode: StockViewMode
  items: WatchlistItem[]
  quotes: Record<string, StockQuote>
  flash: Record<string, 'up' | 'down' | null>
  onReorder: (items: WatchlistItem[]) => void
}

export function SortableStocks({
  viewMode,
  items,
  quotes,
  flash,
  onReorder,
}: SortableStocksProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const ids = items.map((i) => i.symbol)
  const activeItem = activeId ? items.find((i) => i.symbol === activeId) : null
  const strategy = viewMode === 'cards' ? rectSortingStrategy : verticalListSortingStrategy

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

  let content: ReactNode
  if (viewMode === 'list') {
    content = <SortableStockList items={items} quotes={quotes} flash={flash} />
  } else if (viewMode === 'table') {
    content = <SortableStockTable items={items} quotes={quotes} />
  } else {
    content = <SortableStockCards items={items} quotes={quotes} flash={flash} />
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={ids} strategy={strategy}>
        {content}
      </SortableContext>

      <DragOverlay adjustScale={false} dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
        {activeItem ? (
          <div className="cursor-grabbing opacity-95 shadow-2xl">
            {viewMode === 'cards' && (
              <div className="w-full min-w-[280px] max-w-[360px] rotate-1 scale-[1.02] rounded-2xl ring-2 ring-indigo-400/50">
                <StockCard
                  item={activeItem}
                  quote={quotes[activeItem.symbol]}
                  flash={flash[activeItem.symbol]}
                  onRemove={() => {}}
                  sortMode
                />
              </div>
            )}
            {viewMode === 'list' && (
              <div className="min-w-[min(100vw-2rem,640px)] rotate-1 scale-[1.01] rounded-xl ring-2 ring-indigo-400/50">
                <StockListRow
                  item={activeItem}
                  quote={quotes[activeItem.symbol]}
                  flash={flash[activeItem.symbol]}
                  sortMode
                />
              </div>
            )}
            {viewMode === 'table' && (
              <div className="min-w-[720px] overflow-hidden rounded-xl ring-2 ring-indigo-400/50">
                <table className="w-full bg-surface-1">
                  <tbody>
                    <StockTableRow
                      item={activeItem}
                      quote={quotes[activeItem.symbol]}
                      sortMode
                    />
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
