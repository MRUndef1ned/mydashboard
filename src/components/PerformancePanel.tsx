import { performanceMetrics } from '../data/mockData'
import { Gauge } from 'lucide-react'

function CircularProgress({
  value,
  color,
  size = 80,
}: {
  value: number
  color: string
  size?: number
}) {
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
        style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
      />
    </svg>
  )
}

export function PerformancePanel() {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-6 flex items-center gap-2">
        <Gauge className="h-4 w-4 text-cyan-400" />
        <h3 className="text-base font-semibold text-white">Sistem Performansı</h3>
      </div>

      <div className="space-y-5">
        {performanceMetrics.map((metric) => (
          <div key={metric.label} className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <CircularProgress value={metric.value} color={metric.color} />
              <span className="absolute text-xs font-bold text-white">
                {metric.value}
                {metric.label.includes('Uptime') ? '%' : metric.label.includes('Süresi') ? 'ms' : '%'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-300">{metric.label}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/6">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${metric.value}%`,
                    backgroundColor: metric.color,
                    boxShadow: `0 0 8px ${metric.color}60`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">
            Tüm sistemler çalışıyor
          </span>
        </div>
        <p className="mt-1 text-[11px] text-zinc-500">
          Son kontrol: 2 dakika önce · Ortalama yanıt: 124ms
        </p>
      </div>
    </div>
  )
}
