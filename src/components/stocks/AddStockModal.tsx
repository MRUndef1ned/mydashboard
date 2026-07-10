import { useEffect, useRef, useState } from 'react'
import { Search, Plus, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { searchStocks } from '../../hooks/useStockStream'
import { useWatchlist } from '../../context/WatchlistContext'
import { useUI } from '../../context/UIContext'
import type { SearchResult, StockMarket } from '../../types/stocks'
import { displaySymbol } from '../../types/stocks'

interface AddStockModalProps {
  open: boolean
  onClose: () => void
}

export function AddStockModal({ open, onClose }: AddStockModalProps) {
  const { addStock, hasStock } = useWatchlist()
  const { addToast } = useUI()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [market, setMarket] = useState<StockMarket>('BIST')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchStocks(query)
        setResults(data.filter((r: SearchResult) => r.market === market))
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query, market])

  function handleAdd(result: SearchResult) {
    if (hasStock(result.symbol)) {
      addToast('Bu hisse zaten listenizde.', 'info')
      return
    }
    addStock(result.symbol, result.name, result.market)
    addToast(`${displaySymbol(result.symbol)} listeye eklendi.`)
    onClose()
  }

  function handleManualAdd() {
    const sym = query.trim().toUpperCase()
    if (!sym) return
    const fullSymbol = market === 'BIST' ? (sym.endsWith('.IS') ? sym : `${sym}.IS`) : sym
    if (hasStock(fullSymbol)) {
      addToast('Bu hisse zaten listenizde.', 'info')
      return
    }
    addStock(fullSymbol, displaySymbol(fullSymbol), market)
    addToast(`${displaySymbol(fullSymbol)} listeye eklendi.`)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 px-4"
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-1/95 shadow-2xl backdrop-blur-xl">
              <div className="border-b border-white/6 px-5 py-4">
                <h3 className="text-base font-semibold text-white">Hisse Ekle</h3>
                <p className="text-xs text-zinc-500">BIST veya ABD borsasından hisse arayın</p>
              </div>

              <div className="flex gap-2 border-b border-white/6 px-5 py-3">
                {(['BIST', 'US'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMarket(m)}
                    className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                      market === m
                        ? m === 'BIST'
                          ? 'bg-rose-500/15 text-rose-400'
                          : 'bg-emerald-500/15 text-emerald-400'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {m === 'BIST' ? '🇹🇷 BIST' : '🇺🇸 ABD'}
                  </button>
                ))}
              </div>

              <div className="relative px-5 py-4">
                <Search className="absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && results.length === 0 && handleManualAdd()}
                  placeholder={market === 'BIST' ? 'THYAO, GARAN, AKBNK...' : 'AAPL, MSFT, NVDA...'}
                  className="w-full rounded-xl border border-white/6 bg-white/3 py-3 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-indigo-500/40"
                />
              </div>

              <div className="max-h-60 overflow-y-auto px-3 pb-3">
                {loading && (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Aranıyor...
                  </div>
                )}

                {!loading && query && results.length === 0 && (
                  <button
                    onClick={handleManualAdd}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/4"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                      <Plus className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        "{query.toUpperCase()}" ekle
                      </p>
                      <p className="text-xs text-zinc-500">Manuel olarak listeye ekle</p>
                    </div>
                  </button>
                )}

                {results.map((r) => (
                  <button
                    key={r.symbol}
                    onClick={() => handleAdd(r)}
                    disabled={hasStock(r.symbol)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/4 disabled:opacity-40"
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${
                        r.market === 'BIST'
                          ? 'bg-rose-500/15 text-rose-400'
                          : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      {displaySymbol(r.symbol).slice(0, 3)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{r.name}</p>
                      <p className="text-xs text-zinc-500">
                        {displaySymbol(r.symbol)} · {r.exchange}
                      </p>
                    </div>
                    {hasStock(r.symbol) ? (
                      <span className="text-[10px] text-zinc-600">Ekli</span>
                    ) : (
                      <Plus className="h-4 w-4 text-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
