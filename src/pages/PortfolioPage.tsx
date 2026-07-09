import { useMemo, useState } from 'react'
import {
  CalendarDays,
  CircleDollarSign,
  Plus,
  Radio,
  Trash2,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import { AddPositionModal } from '../components/portfolio/AddPositionModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { usePortfolio } from '../context/PortfolioContext'
import { useStockStream } from '../hooks/useStockStream'
import { useUI } from '../context/UIContext'
import { displaySymbol, formatPrice } from '../types/stocks'
import type { PortfolioPosition } from '../types/portfolio'

interface CurrencyTotals {
  cost: number
  value: number
  profit: number
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

function holdingDays(date: string) {
  const start = new Date(`${date}T00:00:00`)
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 86_400_000))
}

export function PortfolioPage() {
  const { positions, symbols, removePosition } = usePortfolio()
  const { quotes, status, error } = useStockStream(symbols)
  const { addToast } = useUI()
  const [modalOpen, setModalOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<PortfolioPosition | null>(null)

  const totals = useMemo(() => {
    const result: Record<'BIST' | 'US', CurrencyTotals> = {
      BIST: { cost: 0, value: 0, profit: 0, dayProfit: 0 },
      US: { cost: 0, value: 0, profit: 0, dayProfit: 0 },
    }

    for (const position of positions) {
      const quote = quotes[position.symbol]
      const cost = position.quantity * position.buyPrice
      const value = position.quantity * (quote?.price ?? position.buyPrice)
      const dayProfit = position.quantity * (quote?.change ?? 0)
      result[position.market].cost += cost
      result[position.market].value += value
      result[position.market].profit += value - cost
      result[position.market].dayProfit += dayProfit
    }

    return result
  }, [positions, quotes])

  function confirmRemove() {
    if (!removeTarget) return
    removePosition(removeTarget.id)
    addToast(`${displaySymbol(removeTarget.symbol)} alım kaydı silindi.`, 'info')
    setRemoveTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/6 bg-gradient-to-r from-indigo-500/10 via-transparent to-cyan-500/8 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Portföyüm</h3>
            {positions.length > 0 && (
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
            Alımlarınızı ve aldığınız günden bugüne kâr/zararı takip edin.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-indigo-500"
        >
          <Plus className="h-4 w-4" />
          Yeni Alım Ekle
        </button>
      </div>

      {error && positions.length > 0 && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400">
          Canlı fiyat bağlantısı kurulamadı. Sonuçlar geçici olarak alış fiyatı üzerinden gösteriliyor.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={CircleDollarSign}
          label="Toplam Maliyet"
          bist={totals.BIST.cost}
          us={totals.US.cost}
        />
        <SummaryCard
          icon={WalletCards}
          label="Güncel Değer"
          bist={totals.BIST.value}
          us={totals.US.value}
        />
        <SummaryCard
          icon={TrendingUp}
          label="Aldığımdan Beri"
          bist={totals.BIST.profit}
          us={totals.US.profit}
          colored
        />
        <SummaryCard
          icon={CalendarDays}
          label="Bugünkü K/Z"
          bist={totals.BIST.dayProfit}
          us={totals.US.dayProfit}
          colored
        />
      </div>

      {positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <WalletCards className="h-6 w-6" />
          </div>
          <p className="mb-2 text-lg font-medium text-zinc-300">Portföyünüz henüz boş</p>
          <p className="mb-6 max-w-md text-center text-sm text-zinc-600">
            İlk hisse alımınızı ekleyin; maliyetinizi, güncel değeri ve kâr/zararı otomatik hesaplayalım.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-500/15 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/25"
          >
            <Plus className="h-4 w-4" />
            İlk Alımı Ekle
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/6 bg-surface-1/50">
          <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Alım Kayıtları</h3>
              <p className="text-xs text-zinc-500">{positions.length} işlem · {symbols.length} farklı hisse</p>
            </div>
            <span className="text-[10px] text-zinc-600">TL ve USD ayrı hesaplanır</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-white/6 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                  <th className="px-5 py-3">Hisse</th>
                  <th className="px-4 py-3">Alış Tarihi</th>
                  <th className="px-4 py-3 text-right">Adet</th>
                  <th className="px-4 py-3 text-right">Alış Fiyatı</th>
                  <th className="px-4 py-3 text-right">Güncel Fiyat</th>
                  <th className="px-4 py-3 text-right">Maliyet</th>
                  <th className="px-4 py-3 text-right">Güncel Değer</th>
                  <th className="px-4 py-3 text-right">Aldığımdan Beri</th>
                  <th className="w-12 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => {
                  const quote = quotes[position.symbol]
                  const currency = position.market === 'BIST' ? 'TRY' : 'USD'
                  const currentPrice = quote?.price ?? position.buyPrice
                  const cost = position.quantity * position.buyPrice
                  const value = position.quantity * currentPrice
                  const profit = value - cost
                  const profitPercent = cost > 0 ? (profit / cost) * 100 : 0

                  return (
                    <tr key={position.id} className="border-b border-white/4 transition last:border-0 hover:bg-white/[0.025]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${
                              position.market === 'BIST'
                                ? 'bg-rose-500/12 text-rose-400'
                                : 'bg-emerald-500/12 text-emerald-400'
                            }`}
                          >
                            {displaySymbol(position.symbol).slice(0, 3)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{displaySymbol(position.symbol)}</p>
                            <p className="max-w-[150px] truncate text-xs text-zinc-500">{position.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-zinc-300">
                          {new Date(`${position.buyDate}T00:00:00`).toLocaleDateString('tr-TR')}
                        </p>
                        <p className="text-[10px] text-zinc-600">{holdingDays(position.buyDate)} gündür</p>
                      </td>
                      <td className="px-4 py-4 text-right text-sm tabular-nums text-zinc-300">
                        {formatQuantity(position.quantity)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm tabular-nums text-zinc-400">
                        {formatPrice(position.buyPrice, currency)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <p className="text-sm font-medium tabular-nums text-white">
                          {quote ? formatPrice(quote.price, quote.currency) : 'Yükleniyor...'}
                        </p>
                        {quote && (
                          <p className={`text-[10px] ${quote.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {quote.change >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}% bugün
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right text-sm tabular-nums text-zinc-400">
                        {formatPrice(cost, currency)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium tabular-nums text-white">
                        {formatPrice(value, currency)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <p className={`text-sm font-semibold tabular-nums ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {signedAmount(profit, position.market)}
                        </p>
                        <p className={`text-[10px] tabular-nums ${profit >= 0 ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                          {profit >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <button
                          onClick={() => setRemoveTarget(position)}
                          title="Alım kaydını sil"
                          className="rounded-lg p-2 text-zinc-600 transition hover:bg-rose-500/10 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddPositionModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <ConfirmDialog
        open={removeTarget != null}
        title="Alım kaydını sil?"
        message={
          removeTarget
            ? `${displaySymbol(removeTarget.symbol)} için ${formatQuantity(removeTarget.quantity)} adetlik alım kaydı portföyden silinecek.`
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
  const bistClass = colored ? (bist >= 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-white'
  const usClass = colored ? (us >= 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-white'

  return (
    <div className="rounded-2xl border border-white/6 bg-surface-1/55 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold text-rose-400">BIST</span>
          <span className={`text-base font-semibold tabular-nums ${bistClass}`}>
            {colored ? signedAmount(bist, 'BIST') : formatAmount(bist, 'BIST')}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold text-emerald-400">ABD</span>
          <span className={`text-base font-semibold tabular-nums ${usClass}`}>
            {colored ? signedAmount(us, 'US') : formatAmount(us, 'US')}
          </span>
        </div>
      </div>
    </div>
  )
}
