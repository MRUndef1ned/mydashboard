import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight, Loader2, Plus, Search, X } from 'lucide-react'
import { usePortfolio } from '../../context/PortfolioContext'
import { searchStocks } from '../../hooks/useStockStream'
import { useUI } from '../../context/UIContext'
import { displaySymbol, type SearchResult, type StockMarket } from '../../types/stocks'
import {
  isValidTransactionLedger,
  type PortfolioTransaction,
  type PortfolioTransactionType,
} from '../../types/portfolio'

interface TransactionModalProps {
  open: boolean
  editing?: PortfolioTransaction | null
  initialType?: PortfolioTransactionType
  onClose: () => void
}

function today() {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}

export function TransactionModal({
  open,
  editing = null,
  initialType = 'buy',
  onClose,
}: TransactionModalProps) {
  const { transactions, holdings, addTransaction, updateTransaction } = usePortfolio()
  const { addToast } = useUI()
  const [type, setType] = useState<PortfolioTransactionType>(initialType)
  const [market, setMarket] = useState<StockMarket>('BIST')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [date, setDate] = useState(today)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const openHoldings = holdings.filter((holding) => holding.quantity > 0)

  useEffect(() => {
    if (!open) return
    const nextType = editing?.type ?? initialType
    setType(nextType)
    setMarket(editing?.market ?? 'BIST')
    setQuery(editing ? displaySymbol(editing.symbol) : '')
    setSelected(
      editing
        ? {
            symbol: editing.symbol,
            name: editing.name,
            market: editing.market,
            exchange: editing.market,
          }
        : null,
    )
    setQuantity(editing ? String(editing.quantity) : '')
    setPrice(editing ? String(editing.price) : '')
    setDate(editing?.date ?? today())
    setResults([])
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [open, editing, initialType])

  useEffect(() => {
    if (type !== 'buy' || !query.trim() || selected || editing) {
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
  }, [query, market, selected, editing, type])

  function choose(result: SearchResult) {
    setSelected(result)
    setMarket(result.market)
    setQuery(displaySymbol(result.symbol))
    setResults([])
  }

  function chooseManual() {
    const raw = query.trim().toUpperCase()
    if (!raw) return
    const symbol = market === 'BIST' && !raw.endsWith('.IS') ? `${raw}.IS` : raw
    choose({ symbol, name: displaySymbol(symbol), market, exchange: market })
  }

  function changeType(nextType: PortfolioTransactionType) {
    if (editing) return
    setType(nextType)
    setSelected(null)
    setQuery('')
    setResults([])
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const parsedQuantity = Number(quantity.replace(',', '.'))
    const parsedPrice = Number(price.replace(',', '.'))

    if (!selected) return addToast('Önce bir hisse seçin.', 'info')
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return addToast('Adet sıfırdan büyük olmalı.', 'info')
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return addToast('İşlem fiyatı sıfırdan büyük olmalı.', 'info')
    }
    if (!date) return addToast('İşlem tarihini seçin.', 'info')

    if (type === 'sell') {
      const holding = holdings.find((item) => item.symbol === selected.symbol)
      const editableQuantity =
        editing?.type === 'sell' && editing.symbol === selected.symbol ? editing.quantity : 0
      const available = (holding?.quantity ?? 0) + editableQuantity
      if (parsedQuantity > available + 0.00000001) {
        return addToast(`Satılabilir adet: ${available.toLocaleString('tr-TR')}`, 'info')
      }
    }

    const transaction = {
      type,
      symbol: selected.symbol,
      name: selected.name,
      market: selected.market,
      quantity: parsedQuantity,
      price: parsedPrice,
      date,
    }

    const candidate: PortfolioTransaction = editing
      ? { ...editing, ...transaction }
      : {
          ...transaction,
          id: 'validation-preview',
          createdAt: Date.now(),
        }
    const nextLedger = editing
      ? transactions.map((item) => (item.id === editing.id ? candidate : item))
      : [...transactions, candidate]
    if (!isValidTransactionLedger(nextLedger)) {
      return addToast(
        'Bu değişiklik, işlem tarihinde sahip olduğunuzdan fazla hisse satılmasına yol açıyor.',
        'info',
      )
    }

    if (editing) {
      updateTransaction(editing.id, transaction)
      addToast(`${displaySymbol(selected.symbol)} işlemi güncellendi.`)
    } else {
      addTransaction(transaction)
      addToast(`${displaySymbol(selected.symbol)} ${type === 'buy' ? 'alımı' : 'satışı'} kaydedildi.`)
    }
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
            className="fixed left-1/2 top-[7%] z-50 w-full max-w-xl -translate-x-1/2 px-4"
          >
            <form
              onSubmit={submit}
              className="overflow-hidden rounded-2xl border border-white/10 bg-surface-1/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-start justify-between border-b border-white/6 px-5 py-4">
                <div>
                  <h3 className="font-semibold text-white">
                    {editing ? 'İşlemi Düzenle' : 'Portföy İşlemi Ekle'}
                  </h3>
                  <p className="text-xs text-zinc-500">Alım ve satışlar ortalama maliyeti otomatik günceller.</p>
                </div>
                <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/6 bg-black/10 p-1">
                  <button
                    type="button"
                    disabled={Boolean(editing)}
                    onClick={() => changeType('buy')}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                      type === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500'
                    } disabled:cursor-default`}
                  >
                    <ArrowDownLeft className="h-4 w-4" /> Alım
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(editing)}
                    onClick={() => changeType('sell')}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                      type === 'sell' ? 'bg-rose-500/15 text-rose-400' : 'text-zinc-500'
                    } disabled:cursor-default`}
                  >
                    <ArrowUpRight className="h-4 w-4" /> Satış
                  </button>
                </div>

                {type === 'buy' ? (
                  <>
                    {!editing && (
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
                            className={`rounded-lg px-4 py-1.5 text-xs font-semibold ${
                              market === item
                                ? item === 'BIST'
                                  ? 'bg-rose-500/15 text-rose-400'
                                  : 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-white/3 text-zinc-500'
                            }`}
                          >
                            {item === 'BIST' ? '🇹🇷 BIST' : '🇺🇸 ABD'}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
                      <input
                        ref={inputRef}
                        value={query}
                        disabled={Boolean(editing)}
                        onChange={(event) => {
                          setQuery(event.target.value)
                          setSelected(null)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !selected) {
                            event.preventDefault()
                            chooseManual()
                          }
                        }}
                        placeholder={market === 'BIST' ? 'THYAO, GARAN, AKBNK...' : 'AAPL, MSFT, NVDA...'}
                        className="w-full rounded-xl border border-white/6 bg-white/3 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-500/40 disabled:opacity-60"
                      />
                    </div>
                    {!editing && !selected && query && (
                      <div className="max-h-36 overflow-y-auto rounded-xl border border-white/6 bg-black/10 p-1">
                        {loading ? (
                          <div className="flex items-center justify-center gap-2 py-5 text-xs text-zinc-500">
                            <Loader2 className="h-4 w-4 animate-spin" /> Aranıyor...
                          </div>
                        ) : (
                          <>
                            {results.map((result) => (
                              <button key={result.symbol} type="button" onClick={() => choose(result)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-white/5">
                                <span>
                                  <span className="block text-sm font-medium text-white">{displaySymbol(result.symbol)}</span>
                                  <span className="block max-w-sm truncate text-xs text-zinc-500">{result.name}</span>
                                </span>
                                <Plus className="h-4 w-4 text-indigo-400" />
                              </button>
                            ))}
                            <button type="button" onClick={chooseManual} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-indigo-400 hover:bg-white/5">
                              <Plus className="h-3.5 w-3.5" /> “{query.toUpperCase()}” kodunu kullan
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto">
                    {openHoldings.length === 0 ? (
                      <p className="col-span-2 rounded-xl border border-dashed border-white/10 py-5 text-center text-xs text-zinc-500">
                        Satılabilecek açık pozisyon yok.
                      </p>
                    ) : (
                      openHoldings.map((holding) => (
                        <button
                          key={holding.symbol}
                          type="button"
                          disabled={Boolean(editing)}
                          onClick={() =>
                            choose({
                              symbol: holding.symbol,
                              name: holding.name,
                              market: holding.market,
                              exchange: holding.market,
                            })
                          }
                          className={`rounded-xl border p-3 text-left transition ${
                            selected?.symbol === holding.symbol
                              ? 'border-rose-500/30 bg-rose-500/10'
                              : 'border-white/6 bg-white/3 hover:bg-white/5'
                          } disabled:cursor-default`}
                        >
                          <p className="text-sm font-semibold text-white">{displaySymbol(holding.symbol)}</p>
                          <p className="text-[10px] text-zinc-500">
                            Açık: {holding.quantity.toLocaleString('tr-TR', { maximumFractionDigits: 4 })} adet
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {selected && (
                  <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/5 px-3 py-2 text-xs text-indigo-300">
                    {displaySymbol(selected.symbol)} · {selected.name}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Adet">
                    <input value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="decimal" placeholder="100" className="w-full rounded-xl border border-white/6 bg-white/3 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/40" />
                  </Field>
                  <Field label={`${type === 'buy' ? 'Alış' : 'Satış'} fiyatı (${market === 'BIST' ? '₺' : '$'})`}>
                    <input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" placeholder="250,50" className="w-full rounded-xl border border-white/6 bg-white/3 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/40" />
                  </Field>
                  <Field label="İşlem tarihi">
                    <input type="date" value={date} max={today()} onChange={(event) => setDate(event.target.value)} className="w-full rounded-xl border border-white/6 bg-white/3 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/40" />
                  </Field>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-white/6 px-5 py-4">
                <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:bg-white/5">
                  Vazgeç
                </button>
                <button type="submit" className={`rounded-xl px-5 py-2 text-sm font-medium text-white shadow-lg ${
                  type === 'buy' ? 'bg-emerald-600 shadow-emerald-500/15' : 'bg-rose-600 shadow-rose-500/15'
                }`}>
                  {editing ? 'Değişiklikleri Kaydet' : type === 'buy' ? 'Alımı Kaydet' : 'Satışı Kaydet'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-medium text-zinc-400">{label}</span>
      {children}
    </label>
  )
}
