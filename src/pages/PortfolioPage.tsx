import { useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  Pencil,
  Radio,
  Trash2,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import { TransactionModal } from '../components/portfolio/TransactionModal'
import { PortfolioCharts } from '../components/portfolio/PortfolioCharts'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { usePortfolio } from '../context/PortfolioContext'
import { useStockStream } from '../hooks/useStockStream'
import { useUI } from '../context/UIContext'
import { displaySymbol, formatPrice } from '../types/stocks'
import type {
  PortfolioTransaction,
  PortfolioTransactionType,
} from '../types/portfolio'

interface CurrencyTotals {
  cost: number
  value: number
  unrealized: number
  realized: number
  dayProfit: number
}

function formatAmount(value: number, market: 'BIST' | 'US') {
  return formatPrice(value, market === 'BIST' ? 'TRY' : 'USD')
}

function signedAmount(value: number, market: 'BIST' | 'US') {
  return `${value >= 0 ? '+' : '-'}${formatAmount(Math.abs(value), market)}`
}

function formatQuantity(quantity: number) {
  return quantity.toLocaleString('tr-TR', { maximumFractionDigits: 4 })
}

export function PortfolioPage() {
  const { transactions, holdings, symbols, removeTransaction } = usePortfolio()
  const { quotes, status, error } = useStockStream(symbols)
  const { addToast } = useUI()
  const [modalType, setModalType] = useState<PortfolioTransactionType | null>(null)
  const [editing, setEditing] = useState<PortfolioTransaction | null>(null)
  const [removeTarget, setRemoveTarget] = useState<PortfolioTransaction | null>(null)
  const [tab, setTab] = useState<'holdings' | 'transactions'>('holdings')

  const openHoldings = holdings.filter((holding) => holding.quantity > 0)
  const hasOpenPosition = openHoldings.length > 0

  const totals = useMemo(() => {
    const result: Record<'BIST' | 'US', CurrencyTotals> = {
      BIST: { cost: 0, value: 0, unrealized: 0, realized: 0, dayProfit: 0 },
      US: { cost: 0, value: 0, unrealized: 0, realized: 0, dayProfit: 0 },
    }

    for (const holding of holdings) {
      const quote = quotes[holding.symbol]
      const cost = holding.quantity * holding.averageCost
      const value = holding.quantity * (quote?.price ?? holding.averageCost)
      result[holding.market].cost += cost
      result[holding.market].value += value
      result[holding.market].unrealized += value - cost
      result[holding.market].realized += holding.realizedProfit
      result[holding.market].dayProfit += holding.quantity * (quote?.change ?? 0)
    }
    return result
  }, [holdings, quotes])

  function openNew(type: PortfolioTransactionType) {
    setEditing(null)
    setModalType(type)
  }

  function editTransaction(transaction: PortfolioTransaction) {
    setEditing(transaction)
    setModalType(transaction.type)
  }

  function closeModal() {
    setModalType(null)
    setEditing(null)
  }

  function confirmRemove() {
    if (!removeTarget) return
    removeTransaction(removeTarget.id)
    addToast(`${displaySymbol(removeTarget.symbol)} işlemi silindi.`, 'info')
    setRemoveTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/6 bg-gradient-to-r from-indigo-500/10 via-transparent to-cyan-500/8 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Portföyüm</h3>
            {hasOpenPosition && (
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${
                  status === 'live'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}
              >
                <Radio className={`h-2.5 w-2.5 ${status === 'live' ? 'animate-pulse' : ''}`} />
                {status === 'live' ? 'Canlı fiyat' : 'Bağlanıyor'}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Ortalama maliyet, açık pozisyonlar ve gerçekleşen kazançlar.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openNew('sell')}
            disabled={!hasOpenPosition}
            className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-400 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowUpRight className="h-4 w-4" /> Satış Ekle
          </button>
          <button
            onClick={() => openNew('buy')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-indigo-500"
          >
            <ArrowDownLeft className="h-4 w-4" /> Alım Ekle
          </button>
        </div>
      </div>

      {error && hasOpenPosition && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400">
          Canlı fiyat bağlantısı kurulamadı. Geçici olarak maliyet değerleri gösteriliyor.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={CircleDollarSign} label="Açık Pozisyon Maliyeti" bist={totals.BIST.cost} us={totals.US.cost} />
        <SummaryCard icon={WalletCards} label="Güncel Değer" bist={totals.BIST.value} us={totals.US.value} />
        <SummaryCard icon={TrendingUp} label="Gerçekleşmemiş K/Z" bist={totals.BIST.unrealized} us={totals.US.unrealized} colored />
        <SummaryCard icon={CircleDollarSign} label="Gerçekleşen K/Z" bist={totals.BIST.realized} us={totals.US.realized} colored />
      </div>

      {transactions.length > 0 && <PortfolioCharts holdings={holdings} quotes={quotes} />}

      {transactions.length === 0 ? (
        <EmptyPortfolio onAdd={() => openNew('buy')} />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-white/6 bg-surface-1/50">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 px-5 py-4">
            <div className="flex rounded-xl border border-white/6 bg-white/3 p-1">
              <button
                onClick={() => setTab('holdings')}
                className={`rounded-lg px-4 py-1.5 text-xs font-medium ${tab === 'holdings' ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500'}`}
              >
                Pozisyonlar ({openHoldings.length})
              </button>
              <button
                onClick={() => setTab('transactions')}
                className={`rounded-lg px-4 py-1.5 text-xs font-medium ${tab === 'transactions' ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500'}`}
              >
                İşlem Geçmişi ({transactions.length})
              </button>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-zinc-600">
              <span>Bugün: {signedAmount(totals.BIST.dayProfit, 'BIST')} · {signedAmount(totals.US.dayProfit, 'US')}</span>
              <span>TL ve USD ayrı hesaplanır</span>
            </div>
          </div>

          {tab === 'holdings' ? (
            <HoldingsTable holdings={openHoldings} quotes={quotes} />
          ) : (
            <TransactionsTable
              transactions={transactions}
              onEdit={editTransaction}
              onRemove={setRemoveTarget}
            />
          )}
        </section>
      )}

      <TransactionModal
        open={modalType != null}
        initialType={modalType ?? 'buy'}
        editing={editing}
        onClose={closeModal}
      />
      <ConfirmDialog
        open={removeTarget != null}
        title="İşlemi sil?"
        message={
          removeTarget
            ? `${displaySymbol(removeTarget.symbol)} ${removeTarget.type === 'buy' ? 'alım' : 'satış'} işlemi silinecek ve tüm maliyet hesapları yeniden yapılacak.`
            : ''
        }
        confirmLabel="Evet, Sil"
        cancelLabel="Vazgeç"
        onConfirm={confirmRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  )
}

function HoldingsTable({
  holdings,
  quotes,
}: {
  holdings: ReturnType<typeof usePortfolio>['holdings']
  quotes: ReturnType<typeof useStockStream>['quotes']
}) {
  if (holdings.length === 0) {
    return <p className="py-14 text-center text-sm text-zinc-500">Tüm pozisyonlar kapatılmış.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-white/6 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            <th className="px-5 py-3">Hisse</th>
            <th className="px-4 py-3 text-right">Toplam Adet</th>
            <th className="px-4 py-3 text-right">Ort. Maliyet</th>
            <th className="px-4 py-3 text-right">Güncel Fiyat</th>
            <th className="px-4 py-3 text-right">Güncel Değer</th>
            <th className="px-4 py-3 text-right">Gerçekleşmemiş</th>
            <th className="px-5 py-3 text-right">Gerçekleşen</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => {
            const quote = quotes[holding.symbol]
            const currency = holding.market === 'BIST' ? 'TRY' : 'USD'
            const currentPrice = quote?.price ?? holding.averageCost
            const value = holding.quantity * currentPrice
            const unrealized = value - holding.quantity * holding.averageCost
            const percent = holding.averageCost > 0 ? ((currentPrice / holding.averageCost) - 1) * 100 : 0

            return (
              <tr key={holding.symbol} className="border-b border-white/4 last:border-0 hover:bg-white/[0.025]">
                <td className="px-5 py-4">
                  <StockIdentity symbol={holding.symbol} name={holding.name} market={holding.market} />
                </td>
                <td className="px-4 py-4 text-right text-sm tabular-nums text-zinc-300">{formatQuantity(holding.quantity)}</td>
                <td className="px-4 py-4 text-right text-sm tabular-nums text-zinc-400">{formatPrice(holding.averageCost, currency)}</td>
                <td className="px-4 py-4 text-right">
                  <p className="text-sm font-medium tabular-nums text-white">{quote ? formatPrice(quote.price, quote.currency) : 'Yükleniyor...'}</p>
                  {quote && <p className={`text-[10px] ${quote.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{quote.change >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}% bugün</p>}
                </td>
                <td className="px-4 py-4 text-right text-sm font-medium tabular-nums text-white">{formatPrice(value, currency)}</td>
                <td className="px-4 py-4 text-right">
                  <p className={`text-sm font-semibold tabular-nums ${unrealized >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{signedAmount(unrealized, holding.market)}</p>
                  <p className={`text-[10px] ${percent >= 0 ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>{percent >= 0 ? '+' : ''}{percent.toFixed(2)}%</p>
                </td>
                <td className="px-5 py-4 text-right">
                  <p className={`text-sm font-semibold tabular-nums ${holding.realizedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{signedAmount(holding.realizedProfit, holding.market)}</p>
                  <p className="text-[10px] text-zinc-600">{holding.transactionCount} işlem</p>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function TransactionsTable({
  transactions,
  onEdit,
  onRemove,
}: {
  transactions: PortfolioTransaction[]
  onEdit: (transaction: PortfolioTransaction) => void
  onRemove: (transaction: PortfolioTransaction) => void
}) {
  const sorted = [...transactions].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt,
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-white/6 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            <th className="px-5 py-3">Hisse</th>
            <th className="px-4 py-3">Tür</th>
            <th className="px-4 py-3">Tarih</th>
            <th className="px-4 py-3 text-right">Adet</th>
            <th className="px-4 py-3 text-right">Fiyat</th>
            <th className="px-4 py-3 text-right">İşlem Tutarı</th>
            <th className="w-24 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((transaction) => {
            const currency = transaction.market === 'BIST' ? 'TRY' : 'USD'
            return (
              <tr key={transaction.id} className="border-b border-white/4 last:border-0 hover:bg-white/[0.025]">
                <td className="px-5 py-4"><StockIdentity symbol={transaction.symbol} name={transaction.name} market={transaction.market} /></td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${transaction.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {transaction.type === 'buy' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                    {transaction.type === 'buy' ? 'ALIM' : 'SATIŞ'}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-zinc-400">{new Date(`${transaction.date}T00:00:00`).toLocaleDateString('tr-TR')}</td>
                <td className="px-4 py-4 text-right text-sm tabular-nums text-zinc-300">{formatQuantity(transaction.quantity)}</td>
                <td className="px-4 py-4 text-right text-sm tabular-nums text-zinc-400">{formatPrice(transaction.price, currency)}</td>
                <td className="px-4 py-4 text-right text-sm font-medium tabular-nums text-white">{formatPrice(transaction.quantity * transaction.price, currency)}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => onEdit(transaction)} title="Düzenle" className="rounded-lg p-2 text-zinc-600 hover:bg-indigo-500/10 hover:text-indigo-400"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => onRemove(transaction)} title="Sil" className="rounded-lg p-2 text-zinc-600 hover:bg-rose-500/10 hover:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function StockIdentity({ symbol, name, market }: { symbol: string; name: string; market: 'BIST' | 'US' }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${market === 'BIST' ? 'bg-rose-500/12 text-rose-400' : 'bg-emerald-500/12 text-emerald-400'}`}>
        {displaySymbol(symbol).slice(0, 3)}
      </div>
      <div>
        <p className="font-semibold text-white">{displaySymbol(symbol)}</p>
        <p className="max-w-[150px] truncate text-xs text-zinc-500">{name}</p>
      </div>
    </div>
  )
}

function EmptyPortfolio({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400"><WalletCards className="h-6 w-6" /></div>
      <p className="mb-2 text-lg font-medium text-zinc-300">Portföyünüz henüz boş</p>
      <p className="mb-6 max-w-md text-center text-sm text-zinc-600">İlk alımı ekleyin; ortalama maliyet ve performans otomatik hesaplansın.</p>
      <button onClick={onAdd} className="flex items-center gap-2 rounded-xl bg-indigo-500/15 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/25"><ArrowDownLeft className="h-4 w-4" /> İlk Alımı Ekle</button>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  bist,
  us,
  colored = false,
}: {
  icon: typeof WalletCards
  label: string
  bist: number
  us: number
  colored?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/6 bg-surface-1/55 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400"><Icon className="h-4 w-4" /></div>
      </div>
      {([
        ['BIST', bist],
        ['US', us],
      ] as const).map(([market, value]) => (
        <div key={market} className="flex items-center justify-between gap-3 py-0.5">
          <span className={`text-[10px] font-semibold ${market === 'BIST' ? 'text-rose-400' : 'text-emerald-400'}`}>{market === 'US' ? 'ABD' : market}</span>
          <span className={`text-base font-semibold tabular-nums ${colored ? (value >= 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-white'}`}>
            {colored ? signedAmount(value, market) : formatAmount(value, market)}
          </span>
        </div>
      ))}
    </div>
  )
}
