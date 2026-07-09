import { transactions } from '../data/mockData'
import { MoreHorizontal, ArrowUpRight } from 'lucide-react'

const statusStyles: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
}

export function TransactionsTable() {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Son İşlemler</h3>
          <p className="mt-0.5 text-sm text-zinc-500">En güncel 5 işlem kaydı</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/6 bg-white/3 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white">
          Dışa Aktar
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/6 text-left">
              {['İşlem ID', 'Müşteri', 'Tutar', 'Durum', 'Tarih', 'Yöntem', ''].map(
                (col) => (
                  <th
                    key={col}
                    className="pb-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 last:pr-0"
                  >
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="group border-b border-white/4 transition hover:bg-white/2 last:border-0"
              >
                <td className="py-3.5 pr-4">
                  <span className="font-mono text-xs text-indigo-400">{tx.id}</span>
                </td>
                <td className="py-3.5 pr-4 text-sm text-zinc-300">{tx.customer}</td>
                <td className="py-3.5 pr-4 text-sm font-semibold text-white">{tx.amount}</td>
                <td className="py-3.5 pr-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${statusStyles[tx.statusColor]}`}
                  >
                    {tx.status}
                  </span>
                </td>
                <td className="py-3.5 pr-4 text-sm text-zinc-500">{tx.date}</td>
                <td className="py-3.5 pr-4 text-sm text-zinc-500">{tx.method}</td>
                <td className="py-3.5">
                  <button className="rounded-lg p-1 text-zinc-600 opacity-0 transition group-hover:opacity-100 hover:bg-white/5 hover:text-zinc-300">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
