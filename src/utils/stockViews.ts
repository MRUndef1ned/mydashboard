import type { StockMarket, StockQuote, WatchlistItem } from '../types/stocks'

export type StockViewMode = 'cards' | 'list' | 'table'

export type StockSortMethod =
  | 'custom'
  | 'name-asc'
  | 'name-desc'
  | 'change-desc'
  | 'change-asc'
  | 'price-desc'
  | 'price-asc'
  | 'market'

export const SORT_OPTIONS: { value: StockSortMethod; label: string }[] = [
  { value: 'custom', label: 'Özel Sıra (manuel)' },
  { value: 'name-asc', label: 'İsim (A → Z)' },
  { value: 'name-desc', label: 'İsim (Z → A)' },
  { value: 'change-desc', label: 'Değişim (En yüksek)' },
  { value: 'change-asc', label: 'Değişim (En düşük)' },
  { value: 'price-desc', label: 'Fiyat (En yüksek)' },
  { value: 'price-asc', label: 'Fiyat (En düşük)' },
  { value: 'market', label: 'Borsa (BIST → ABD)' },
]

export const VIEW_OPTIONS: { value: StockViewMode; label: string }[] = [
  { value: 'cards', label: 'Kart' },
  { value: 'list', label: 'Liste' },
  { value: 'table', label: 'Tablo' },
]

export interface MarketTheme {
  cardBg: string
  cardBorder: string
  cardHover: string
  badge: string
  accent: string
  rowBg: string
  rowBorder: string
  tableRow: string
  label: string
  glow: string
}

export const marketTheme: Record<StockMarket, MarketTheme> = {
  BIST: {
    cardBg: 'bg-gradient-to-br from-rose-500/12 via-rose-950/20 to-surface-2/70',
    cardBorder: 'border-rose-500/25',
    cardHover: 'hover:border-rose-400/40 hover:shadow-rose-500/10',
    badge: 'bg-rose-500/20 text-rose-300 ring-rose-500/30',
    accent: 'text-rose-400',
    rowBg: 'bg-rose-500/[0.06] hover:bg-rose-500/10',
    rowBorder: 'border-l-[3px] border-l-rose-500',
    tableRow: 'bg-rose-500/[0.04] hover:bg-rose-500/10',
    label: '🇹🇷 BIST',
    glow: 'shadow-rose-500/5',
  },
  US: {
    cardBg: 'bg-gradient-to-br from-emerald-500/12 via-emerald-950/20 to-surface-2/70',
    cardBorder: 'border-emerald-500/25',
    cardHover: 'hover:border-emerald-400/40 hover:shadow-emerald-500/10',
    badge: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30',
    accent: 'text-emerald-400',
    rowBg: 'bg-emerald-500/[0.06] hover:bg-emerald-500/10',
    rowBorder: 'border-l-[3px] border-l-emerald-500',
    tableRow: 'bg-emerald-500/[0.04] hover:bg-emerald-500/10',
    label: '🇺🇸 ABD',
    glow: 'shadow-emerald-500/5',
  },
}

export function getMarketTheme(market: StockMarket) {
  return marketTheme[market]
}

export function sortStockItems(
  items: WatchlistItem[],
  quotes: Record<string, StockQuote>,
  method: StockSortMethod,
): WatchlistItem[] {
  if (method === 'custom') return items

  const sorted = [...items]

  sorted.sort((a, b) => {
    const qa = quotes[a.symbol]
    const qb = quotes[b.symbol]

    switch (method) {
      case 'name-asc':
        return a.name.localeCompare(b.name, 'tr')
      case 'name-desc':
        return b.name.localeCompare(a.name, 'tr')
      case 'change-desc':
        return (qb?.changePercent ?? -Infinity) - (qa?.changePercent ?? -Infinity)
      case 'change-asc':
        return (qa?.changePercent ?? Infinity) - (qb?.changePercent ?? Infinity)
      case 'price-desc':
        return (qb?.price ?? -Infinity) - (qa?.price ?? -Infinity)
      case 'price-asc':
        return (qa?.price ?? Infinity) - (qb?.price ?? Infinity)
      case 'market':
        if (a.market !== b.market) return a.market === 'BIST' ? -1 : 1
        return a.name.localeCompare(b.name, 'tr')
      default:
        return 0
    }
  })

  return sorted
}

const VIEW_KEY = 'nexus_stock_view'
const SORT_KEY = 'nexus_stock_sort'

export function loadViewMode(): StockViewMode {
  try {
    const v = localStorage.getItem(VIEW_KEY)
    if (v === 'cards' || v === 'list' || v === 'table') return v
  } catch { /* ignore */ }
  return 'cards'
}

export function loadSortMethod(): StockSortMethod {
  try {
    const v = localStorage.getItem(SORT_KEY)
    if (SORT_OPTIONS.some((o) => o.value === v)) return v as StockSortMethod
  } catch { /* ignore */ }
  return 'custom'
}

export function saveViewMode(mode: StockViewMode) {
  localStorage.setItem(VIEW_KEY, mode)
}

export function saveSortMethod(method: StockSortMethod) {
  localStorage.setItem(SORT_KEY, method)
}
