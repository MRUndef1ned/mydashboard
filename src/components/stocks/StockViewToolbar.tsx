import { LayoutGrid, List, Table2 } from 'lucide-react'
import {
  SORT_OPTIONS,
  VIEW_OPTIONS,
  type StockSortMethod,
  type StockViewMode,
} from '../../utils/stockViews'

interface StockViewToolbarProps {
  viewMode: StockViewMode
  sortMethod: StockSortMethod
  onViewChange: (mode: StockViewMode) => void
  onSortChange: (method: StockSortMethod) => void
  disabled?: boolean
}

const viewIcons = {
  cards: LayoutGrid,
  list: List,
  table: Table2,
} as const

export function StockViewToolbar({
  viewMode,
  sortMethod,
  onViewChange,
  onSortChange,
  disabled,
}: StockViewToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-1 rounded-xl border border-white/6 bg-white/3 p-1">
        {VIEW_OPTIONS.map((opt) => {
          const Icon = viewIcons[opt.value]
          return (
            <button
              key={opt.value}
              disabled={disabled}
              onClick={() => onViewChange(opt.value)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-40 ${
                viewMode === opt.value
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {opt.label}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-600">Sırala:</span>
        <select
          value={sortMethod}
          disabled={disabled}
          onChange={(e) => onSortChange(e.target.value as StockSortMethod)}
          className="rounded-xl border border-white/6 bg-surface-2/80 px-3 py-1.5 text-xs font-medium text-zinc-300 outline-none transition focus:border-indigo-500/40 disabled:opacity-40"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface-1">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
