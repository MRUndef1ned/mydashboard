import { activities } from '../data/mockData'
import { Activity } from 'lucide-react'

export function ActivityFeed() {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-400" />
          <h3 className="text-base font-semibold text-white">Son Aktiviteler</h3>
        </div>
        <button className="text-xs font-medium text-indigo-400 transition hover:text-indigo-300">
          Tümünü Gör
        </button>
      </div>

      <div className="space-y-1">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`flex items-start gap-3 rounded-xl p-3 transition hover:bg-white/3 ${
              index !== activities.length - 1 ? '' : ''
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${activity.color} text-[11px] font-bold text-white shadow-lg`}
            >
              {activity.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-zinc-300">
                <span className="font-medium text-white">{activity.user}</span>{' '}
                {activity.action}{' '}
                <span className="font-medium text-indigo-300">{activity.target}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-600">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
