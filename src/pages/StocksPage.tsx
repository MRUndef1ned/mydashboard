import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Plus, Radio, RefreshCw, WifiOff, Check, GripVertical, Move } from 'lucide-react'
import { useWatchlist } from '../context/WatchlistContext'
import { useStockStream } from '../hooks/useStockStream'
import { useUI } from '../context/UIContext'
import { StockCard } from '../components/stocks/StockCard'
import { SortableStocks } from '../components/stocks/SortableStocks'
import { AddStockModal } from '../components/stocks/AddStockModal'
import { StockListView } from '../components/stocks/StockListView'
import { StockTableView } from '../components/stocks/StockTableView'
import { StockViewToolbar } from '../components/stocks/StockViewToolbar'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { STOCK_GRID_CLASS } from '../components/stocks/stockGrid'
import { displaySymbol, formatPrice } from '../types/stocks'
import type { WatchlistItem } from '../types/stocks'
import {
  loadSortMethod,
  loadViewMode,
  saveSortMethod,
  saveViewMode,
  sortStockItems,
  getMarketTheme,
  type StockSortMethod,
  type StockViewMode,
} from '../utils/stockViews'

export function StocksPage() {
  const { items, symbols, removeStock, reorderStocks } = useWatchlist()
  const { quotes, status, lastUpdated, error, flash, marketOpen } = useStockStream(symbols)
  const { addToast } = useUI()
  const [modalOpen, setModalOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'BIST' | 'US'>('all')
  const [sortMode, setSortMode] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<WatchlistItem | null>(null)
  const [viewMode, setViewMode] = useState<StockViewMode>(loadViewMode)
  const [sortMethod, setSortMethod] = useState<StockSortMethod>(loadSortMethod)

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.market === filter)),
    [items, filter],
  )

  const displayed = useMemo(
    () => sortStockItems(filtered, quotes, sortMode ? 'custom' : sortMethod),
    [filtered, quotes, sortMethod, sortMode],
  )

  const bistCount = items.filter((i) => i.market === 'BIST').length
  const usCount = items.filter((i) => i.market === 'US').length

  const totalChange = useMemo(() => {
    let sum = 0
    let count = 0
    for (const item of items) {
      const q = quotes[item.symbol]
      if (q) {
        sum += q.changePercent
        count++
      }
    }
    return count > 0 ? sum / count : 0
  }, [items, quotes])

  function requestRemove(symbol: string) {
    const item = items.find((i) => i.symbol === symbol)
    if (item) setRemoveTarget(item)
  }

  function confirmRemove() {
    if (!removeTarget) return
    removeStock(removeTarget.symbol)
    addToast(`${displaySymbol(removeTarget.symbol)} listeden kaldırıldı.`, 'info')
    setRemoveTarget(null)
  }

  function toggleSortMode() {
    if (sortMode) {
      addToast('Liste sıralaması kaydedildi.')
      setSortMode(false)
    } else {
      setFilter('all')
      setSortMethod('custom')
      saveSortMethod('custom')
      setSortMode(true)
    }
  }

  function handleViewChange(mode: StockViewMode) {
    setViewMode(mode)
    saveViewMode(mode)
  }

  function handleSortChange(method: StockSortMethod) {
    setSortMethod(method)
    saveSortMethod(method)
    if (method !== 'custom' && sortMode) {
      setSortMode(false)
      addToast('Manuel sıralama kapatıldı.', 'info')
    }
  }

  function handleReorder(reordered: WatchlistItem[]) {
    if (filter === 'all') {
      reorderStocks(reordered)
      return
    }

    const filteredSymbols = new Set(filtered.map((i) => i.symbol))
    let idx = 0
    const merged = items.map((item) =>
      filteredSymbols.has(item.symbol) ? reordered[idx++]! : item,
    )
    reorderStocks(merged)
  }

  const lastUpdateStr = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('tr-TR')
    : '—'

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/6 bg-gradient-to-r from-indigo-500/8 via-transparent to-cyan-500/8 px-5 py-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
              status === 'live'
                ? 'bg-emerald-500/10 text-emerald-400'
                : status === 'connecting'
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {status === 'live' ? (
              <>
                <Radio className="h-3 w-3 animate-pulse-soft" />
                {marketOpen ? 'Canlı · 30sn güncelleme' : 'Piyasa kapalı · 2dk güncelleme'}
              </>
            ) : status === 'connecting' ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                Bağlanıyor...
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Bağlantı yok
              </>
            )}
          </div>
          <span className="text-xs text-zinc-500">Son güncelleme: {lastUpdateStr}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-4 sm:flex">
            <div className="text-center">
              <p className="text-lg font-semibold text-white">{bistCount}</p>
              <p className="text-[10px] text-zinc-500">BIST</p>
            </div>
            <div className="h-8 w-px bg-white/6" />
            <div className="text-center">
              <p className="text-lg font-semibold text-white">{usCount}</p>
              <p className="text-[10px] text-zinc-500">ABD</p>
            </div>
            <div className="h-8 w-px bg-white/6" />
            <div className="text-center">
              <p
                className={`text-lg font-semibold tabular-nums ${
                  totalChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {totalChange >= 0 ? '+' : ''}
                {totalChange.toFixed(2)}%
              </p>
              <p className="text-[10px] text-zinc-500">Ort. Değişim</p>
            </div>
          </div>

          <button
            onClick={toggleSortMode}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
              sortMode
                ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300 shadow-lg shadow-indigo-500/10'
                : 'border-white/6 bg-white/3 text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {sortMode ? (
              <>
                <Check className="h-4 w-4" />
                Konumu Kaydet
              </>
            ) : (
              <>
                <Move className="h-4 w-4" />
                Konumlandır
              </>
            )}
          </button>

          <button
            onClick={() => setModalOpen(true)}
            disabled={sortMode}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Hisse Ekle
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400">
          {error} — Terminalde <code className="font-mono text-rose-300">npm run dev</code> ile hem
          frontend hem API sunucusunun çalıştığından emin olun.
        </div>
      )}

      <StockViewToolbar
        viewMode={viewMode}
        sortMethod={sortMethod}
        onViewChange={handleViewChange}
        onSortChange={handleSortChange}
        sortDisabled={sortMode}
      />

      {/* Filter tabs */}
      {!sortMode && (
      <div className="flex gap-1 rounded-xl border border-white/6 bg-white/3 p-1 w-fit">
        {([
          { key: 'all' as const, label: `Tümü (${items.length})` },
          { key: 'BIST' as const, label: `🇹🇷 BIST (${bistCount})` },
          { key: 'US' as const, label: `🇺🇸 ABD (${usCount})` },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
              filter === tab.key
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      )}

      {sortMode && (
        <div className="flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
          <GripHint />
          <p className="text-sm text-indigo-300">
            Hisseleri tutup ekranda serbestçe gezdirin — kart, liste veya tablo görünümünde
          </p>
        </div>
      )}

      {/* Stock grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20">
          <p className="mb-2 text-lg font-medium text-zinc-400">Listeniz boş</p>
          <p className="mb-6 text-sm text-zinc-600">BIST veya ABD borsasından hisse ekleyin</p>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-500/15 px-4 py-2 text-sm font-medium text-indigo-400 transition hover:bg-indigo-500/25"
          >
            <Plus className="h-4 w-4" />
            İlk Hissenizi Ekleyin
          </button>
        </div>
      ) : sortMode ? (
        <SortableStocks
          viewMode={viewMode}
          items={displayed}
          quotes={quotes}
          flash={flash}
          onReorder={handleReorder}
        />
      ) : viewMode === 'list' ? (
        <StockListView
          items={displayed}
          quotes={quotes}
          flash={flash}
          onRemove={requestRemove}
        />
      ) : viewMode === 'table' ? (
        <StockTableView
          items={displayed}
          quotes={quotes}
          onRemove={requestRemove}
        />
      ) : (
        <div className={STOCK_GRID_CLASS}>
          <AnimatePresence>
            {displayed.map((item) => (
              <StockCard
                key={item.symbol}
                item={item}
                quote={quotes[item.symbol]}
                flash={flash[item.symbol]}
                onRemove={requestRemove}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AddStockModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <ConfirmDialog
        open={removeTarget != null}
        title="Hisseyi kaldır?"
        message={
          removeTarget
            ? `${displaySymbol(removeTarget.symbol)} (${removeTarget.name}) izleme listenizden kaldırılacak. Bu işlemi onaylıyor musunuz?`
            : ''
        }
        confirmLabel="Evet, Kaldır"
        cancelLabel="Vazgeç"
        onConfirm={confirmRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  )
}

function GripHint() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
      <GripVertical className="h-4 w-4" />
    </div>
  )
}

export function StockTickerStrip() {
  const { items, symbols } = useWatchlist()
  const { quotes, status } = useStockStream(symbols)

  if (items.length === 0) return null

  const topItems = items.slice(0, 6)

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/6 px-5 py-3">
        <div className="flex items-center gap-2">
          <Radio
            className={`h-3.5 w-3.5 ${status === 'live' ? 'text-emerald-400 animate-pulse-soft' : 'text-zinc-500'}`}
          />
          <span className="text-sm font-medium text-white">Canlı Borsa</span>
        </div>
        <Link to="/stocks" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
          Tümünü Gör →
        </Link>
      </div>
      <div className="flex gap-px overflow-x-auto">
        {topItems.map((item) => {
          const q = quotes[item.symbol]
          const theme = getMarketTheme(item.market)
          const isUp = q ? q.change >= 0 : true
          return (
            <div
              key={item.symbol}
              className={`min-w-[140px] flex-1 border-r border-white/4 px-4 py-3 last:border-0 ${theme.rowBg}`}
            >
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-zinc-300">{displaySymbol(item.symbol)}</p>
                <span className={`text-[9px] ${theme.accent}`}>{item.market === 'BIST' ? 'TR' : 'US'}</span>
              </div>
              {q ? (
                <>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-white">
                    {formatPrice(q.price, q.currency)}
                  </p>
                  <p
                    className={`text-[11px] font-medium tabular-nums ${
                      isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isUp ? '+' : ''}
                    {q.changePercent.toFixed(2)}%
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs text-zinc-600">...</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
