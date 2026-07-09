import { useEffect, useState } from 'react'
import { StatCard } from '../components/StatCard'
import { RevenueChart } from '../components/RevenueChart'
import { ActivityFeed } from '../components/ActivityFeed'
import { TransactionsTable } from '../components/TransactionsTable'
import { PerformancePanel } from '../components/PerformancePanel'
import { stats } from '../data/mockData'
import { Calendar, Sparkles } from 'lucide-react'

function QuickActions() {
  const actions = [
    { label: 'Rapor Oluştur', desc: 'PDF veya Excel', color: 'from-indigo-500/20 to-indigo-500/5' },
    { label: 'Ekip Davet Et', desc: 'Yeni üye ekle', color: 'from-cyan-500/20 to-cyan-500/5' },
    { label: 'API Anahtarı', desc: 'Entegrasyonlar', color: 'from-violet-500/20 to-violet-500/5' },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {actions.map((action) => (
        <button
          key={action.label}
          className={`group flex items-center gap-3 rounded-xl border border-white/6 bg-gradient-to-br ${action.color} p-4 text-left transition hover:border-white/10 hover:bg-white/5`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 transition group-hover:bg-white/10">
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{action.label}</p>
            <p className="text-[11px] text-zinc-500">{action.desc}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

function DateBanner() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const formatted = now.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  })

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-gradient-to-r from-indigo-500/8 via-transparent to-cyan-500/8 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15">
          <Calendar className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{formatted}</p>
          <p className="text-xs text-zinc-500">Bu ay 3 yeni proje ve 12 tamamlanan görev</p>
        </div>
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
          +18% büyüme
        </span>
        <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
          Hedefin %87'si
        </span>
      </div>
    </div>
  )
}

export function OverviewPage() {
  return (
    <div className="space-y-6">
      <DateBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>
        <PerformancePanel />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TransactionsTable />
        </div>
        <ActivityFeed />
      </div>
    </div>
  )
}
