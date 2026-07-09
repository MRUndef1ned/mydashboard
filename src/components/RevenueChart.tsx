import { chartData } from '../data/mockData'

const maxValue = Math.max(...chartData.map((d) => d.value))

export function RevenueChart() {
  return (
    <div className="glass glow-accent rounded-2xl p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Gelir Trendi</h3>
          <p className="mt-1 text-sm text-zinc-500">Son 12 ay performans özeti</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-white/6 bg-white/3 p-1">
          {['Ay', 'Hafta', 'Gün'].map((period, i) => (
            <button
              key={period}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                i === 0
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-t border-white/4" />
          ))}
        </div>

        <div className="relative flex h-52 items-end justify-between gap-2 px-1">
          {chartData.map((item, index) => {
            const height = (item.value / maxValue) * 100
            const isHighlight = index === chartData.length - 1
            return (
              <div key={item.month} className="group flex flex-1 flex-col items-center gap-2">
                <div className="relative w-full flex justify-center" style={{ height: '180px' }}>
                  <div
                    className={`chart-bar absolute bottom-0 w-full max-w-[28px] rounded-t-md ${
                      isHighlight
                        ? 'bg-gradient-to-t from-indigo-600 to-cyan-400 shadow-lg shadow-indigo-500/30'
                        : 'bg-gradient-to-t from-indigo-500/40 to-indigo-400/20 group-hover:from-indigo-500/60 group-hover:to-cyan-400/30'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  {isHighlight && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-indigo-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg">
                      ₺118K
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium text-zinc-600">{item.month}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/6 pt-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-indigo-600 to-cyan-400" />
            <span className="text-xs text-zinc-500">Gelir</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm bg-indigo-500/30" />
            <span className="text-xs text-zinc-500">Hedef</span>
          </div>
        </div>
        <p className="text-sm text-zinc-400">
          Ortalama: <span className="font-semibold text-white">₺74.2K</span>/ay
        </p>
      </div>
    </div>
  )
}
