import { BarChart2, MousePointerClick, Eye, Clock } from 'lucide-react'
import { RevenueChart } from '../components/RevenueChart'
import { PerformancePanel } from '../components/PerformancePanel'

const metrics = [
  { label: 'Sayfa Görüntüleme', value: '48.2K', change: '+14%', icon: Eye, color: 'text-cyan-400' },
  { label: 'Tıklama Oranı', value: '%4.8', change: '+0.6%', icon: MousePointerClick, color: 'text-indigo-400' },
  { label: 'Ort. Oturum', value: '3m 42s', change: '+22s', icon: Clock, color: 'text-violet-400' },
  { label: 'Hemen Çıkma', value: '%28', change: '-3%', icon: BarChart2, color: 'text-emerald-400' },
]

const channels = [
  { name: 'Organik Arama', share: 42, color: 'bg-indigo-500' },
  { name: 'Doğrudan', share: 28, color: 'bg-cyan-500' },
  { name: 'Sosyal Medya', share: 18, color: 'bg-violet-500' },
  { name: 'Referans', share: 12, color: 'bg-emerald-500' },
]

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <m.icon className={`h-5 w-5 ${m.color}`} />
              <span className="text-xs font-medium text-emerald-400">{m.change}</span>
            </div>
            <p className="text-sm text-zinc-500">{m.label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-5 text-base font-semibold text-white">Trafik Kaynakları</h3>
          <div className="space-y-4">
            {channels.map((ch) => (
              <div key={ch.name}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-zinc-400">{ch.name}</span>
                  <span className="font-medium text-white">%{ch.share}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/6">
                  <div
                    className={`h-full rounded-full ${ch.color} transition-all duration-700`}
                    style={{ width: `${ch.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PerformancePanel />
    </div>
  )
}
