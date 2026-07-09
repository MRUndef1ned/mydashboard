import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Plus, Search, X } from 'lucide-react'
import { usePortfolio } from '../../context/PortfolioContext'
import { searchStocks } from '../../hooks/useStockStream'
import { useUI } from '../../context/UIContext'
import { displaySymbol, type SearchResult, type StockMarket } from '../../types/stocks'

interface AddPositionModalProps {
  open: boolean
  onClose: () => void
}

function today() {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}

export function AddPositionModal({ open, onClose }: AddPositionModalProps) {
  const { addPosition } = usePortfolio()
  const { addToast } = useUI()
  const [market, setMarket] = useState<StockMarket>('BIST')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [quantity, setQuantity] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [buyDate, setBuyDate] = useState(today)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setMarket('BIST')
    setQuery('')
    setResults([])
    setSelected(null)
    setQuantity('')
    setBuyPrice('')
    setBuyDate(today())
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    if (!query.trim() || selected) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = (await searchStocks(query)) as SearchResult[]
        setResults(data.filter((result) => result.market === market))
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query, market, selected])

  function selectResult(result: SearchResult) {
    setSelected(result)
    setQuery(displaySymbol(result.symbol))
    setResults([])
  }

  function selectManual() {
    const raw = query.trim().toUpperCase()
    if (!raw) return
    const symbol = market === 'BIST' && !raw.endsWith('.IS') ? `${raw}.IS` : raw
    selectResult({
      symbol,
      name: displaySymbol(symbol),
      market,
      exchange: market === 'BIST' ? 'BIST' : 'US',
    })
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const shares = Number(quantity.replace(',', '.'))
    const price = Number(buyPrice.replace(',', '.'))

    if (!selected) {
      addToast('Önce bir hisse seçin.', 'info')
      return
    }
    if (!Number.isFinite(shares) || shares <= 0 || !Number.isFinite(price) || price <= 0) {
      addToast('Adet ve alış fiyatı sıfırdan büyük olmalı.', 'info')
      return
    }
    if (!buyDate) {
      addToast('Alış tarihini seçin.', 'info')
      return
    }

    addPosition({
      symbol: selected.symbol,
      name: selected.name,
      market: selected.market,
      quantity: shares,
      buyPrice: price,
      buyDate,
    })
    addToast(`${displaySymbol(selected.symbol)} portföye eklendi.`)
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
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="fixed left-1/2 top-[8%] z-50 w-full max-w-xl -translate-x-1/2 px-4"
          >
            <form
              onSubmit={submit}
              className="overflow-hidden rounded-2xl border border-white/10 bg-surface-1/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-start justify-between border-b border-white/6 px-5 py-4">
                <div>
                  <h3 className="font-semibold text-white">Portföye Alım Ekle</h3>
                  <p className="text-xs text-zinc-500">Hisse, adet, alış fiyatı ve tarih bilgilerini girin</p>
                </div>
                <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex gap-2">
                  {(['BIST', 'US'] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setMarket(item)
                        setSelected(null)
                        setQuery('')
                      }}
                      className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                        market === item
                          ? item === 'BIST'
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-white/3 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {item === 'BIST' ? '🇹🇷 BIST' : '🇺🇸 ABD'}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value)
                      setSelected(null)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !selected) {
                        event.preventDefault()
                        selectManual()
                      }
                    }}
                    placeholder={market === 'BIST' ? 'THYAO, GARAN, AKBNK...' : 'AAPL, MSFT, NVDA...'}
                    className="w-full rounded-xl border border-white/6 bg-white/3 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-500/40"
                  />
                  {selected && (
                    <span className="absolute right-3 top-3 rounded-md bg-emerald-500/15 px-2 py-1 text-[10px] font-medium text-emerald-400">
                      Seçildi
                    </span>
                  )}
                </div>

                {!selected && query && (
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-white/6 bg-black/10 p-1">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2 py-5 text-xs text-zinc-500">
                        <Loader2 className="h-4 w-4 animate-spin" /> Aranıyor...
                      </div>
                    ) : (
                      <>
                        {results.map((result) => (
                          <button
                            key={result.symbol}
                            type="button"
                            onClick={() => selectResult(result)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-white/5"
                          >
                            <span>
                              <span className="block text-sm font-medium text-white">{displaySymbol(result.symbol)}</span>
                              <span className="block max-w-sm truncate text-xs text-zinc-500">{result.name}</span>
                            </span>
                            <Plus className="h-4 w-4 text-indigo-400" />
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={selectManual}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-indigo-400 hover:bg-white/5"
                        >
                          <Plus className="h-3.5 w-3.5" /> “{query.toUpperCase()}” kodunu manuel kullan
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="space-y-1.5">
                    <span className="text-xs font-medium text-zinc-400">Adet</span>
                    <input
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      inputMode="decimal"
                      placeholder="100"
                      className="w-full rounded-xl border border-white/6 bg-white/3 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/40"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs font-medium text-zinc-400">
                      Alış fiyatı ({market === 'BIST' ? '₺' : '$'})
                    </span>
                    <input
                      value={buyPrice}
                      onChange={(event) => setBuyPrice(event.target.value)}
                      inputMode="decimal"
                      placeholder="250,50"
                      className="w-full rounded-xl border border-white/6 bg-white/3 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/40"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs font-medium text-zinc-400">Alış tarihi</span>
                    <input
                      type="date"
                      value={buyDate}
                      max={today()}
                      onChange={(event) => setBuyDate(event.target.value)}
                      className="w-full rounded-xl border border-white/6 bg-white/3 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/40"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-white/6 px-5 py-4">
                <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:bg-white/5">
                  Vazgeç
                </button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20">
                  Alımı Kaydet
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
