import {
  Wallet,
  Users,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  wallet: Wallet,
  users: Users,
  'shopping-bag': ShoppingBag,
  'trending-up': TrendingUp,
}

interface StatCardProps {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: string
  gradient: string
  accent: string
}

export function StatCard({
  label,
  value,
  change,
  trend,
  icon,
  gradient,
  accent,
}: StatCardProps) {
  const Icon = iconMap[icon] ?? TrendingUp
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/6 bg-surface-2/60 p-5 transition-all duration-300 hover:border-white/10 hover:bg-surface-2">
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} blur-2xl transition-opacity group-hover:opacity-100 opacity-60`}
      />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${accent}`}>
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              trend === 'up'
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            <TrendIcon className="h-3 w-3" />
            {change}
          </div>
        </div>
        <p className="mb-1 text-sm text-zinc-500">{label}</p>
        <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
      </div>
    </div>
  )
}
