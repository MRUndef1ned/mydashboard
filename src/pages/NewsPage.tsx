import { useMemo, useState } from 'react'
import { CalendarDays, ExternalLink, Newspaper, Radio, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWatchlistNews, type StockNewsItem } from '../hooks/useWatchlistNews'
import { displaySymbol } from '../types/stocks'
import { getMarketTheme } from '../utils/stockViews'

function startOfDay(timestamp: number) {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

function dayLabel(timestamp: number) {
  const today = startOfDay(Date.now())
  const day = startOfDay(timestamp)
  const diff = Math.round((today - day) / 86_400_000)
  if (diff === 0) return 'Bugün'
  if (diff === 1) return 'Dün'
  return new Date(timestamp).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatClock(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function NewsPage() {
  const [filter, setFilter] = useState<string>('all')
  const { news, allNews, loading, error, updatedAt, watchlist } = useWatchlistNews(filter)

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of allNews) map.set(item.symbol, (map.get(item.symbol) ?? 0) + 1)
    return map
  }, [allNews])

  const grouped = useMemo(() => {
    const map = new Map<string, StockNewsItem[]>()
    for (const item of news) {
      const key = String(startOfDay(item.publishedAt))
      const list = map.get(key) ?? []
      list.push(item)
      map.set(key, list)
    }
    return [...map.entries()].sort((a, b) => Number(b[0]) - Number(a[0]))
  }, [news])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/6 bg-gradient-to-r from-indigo-500/10 via-transparent to-cyan-500/8 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Hisse Haberleri</h3>
            <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400">
              Son 7 gün
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Sadece izleme listenizdeki hisselerle doğrudan ilgili, güncel haberler.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="rounded-full bg-white/5 px-2 py-1">{allNews.length} haber</span>
          {updatedAt && (
            <span className="flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-emerald-400" />
              {new Date(updatedAt).toLocaleTimeString('tr-TR')}
            </span>
          )}
          {loading && (
            <span className="flex items-center gap-1.5 text-amber-400">
              <RefreshCw className="h-3 w-3 animate-spin" /> Yenileniyor
            </span>
          )}
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20">
          <Newspaper className="mb-4 h-10 w-10 text-zinc-700" />
          <p className="mb-2 text-lg font-medium text-zinc-300">Önce hisse listesi gerekli</p>
          <p className="mb-6 max-w-md text-center text-sm text-zinc-600">
            Haberler, Borsa sayfasındaki izleme listenize göre çekilir.
          </p>
          <Link
            to="/stocks"
            className="rounded-xl bg-indigo-500/15 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/25"
          >
            Borsa sayfasına git
          </Link>
        </div>
      ) : (
        <>
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/6 bg-white/3 p-1">
            <FilterChip
              active={filter === 'all'}
              label={`Tümü (${allNews.length})`}
              onClick={() => setFilter('all')}
            />
            {watchlist.map((item) => (
              <FilterChip
                key={item.symbol}
                active={filter === item.symbol}
                label={`${displaySymbol(item.symbol)} (${counts.get(item.symbol) ?? 0})`}
                market={item.market}
                onClick={() => setFilter(item.symbol)}
              />
            ))}
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          {loading && news.length === 0 ? (
            <div className="grid gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
              <p className="text-sm text-zinc-500">
                Son 7 günde bu filtre için yeterince ilgili haber bulunamadı.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map(([dayKey, items]) => (
                <section key={dayKey} className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <CalendarDays className="h-3.5 w-3.5 text-zinc-600" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      {dayLabel(Number(dayKey))}
                    </h4>
                    <span className="text-[10px] text-zinc-700">{items.length}</span>
                  </div>
                  <div className="grid gap-3">
                    {items.map((item) => {
                      const theme = getMarketTheme(item.market)
                      return (
                        <a
                          key={item.id}
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className={`group grid gap-3 rounded-2xl border bg-surface-1/55 p-4 transition hover:bg-white/[0.03] sm:grid-cols-[88px_minmax(0,1fr)_auto] ${theme.cardBorder}`}
                        >
                          <div className="flex items-center gap-3 sm:block">
                            <div className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-semibold ${theme.badge}`}>
                              {displaySymbol(item.symbol)}
                            </div>
                            <p className="text-[11px] tabular-nums text-zinc-600 sm:mt-2">
                              {formatClock(item.publishedAt)}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-[15px] font-medium leading-6 text-zinc-100 group-hover:text-white">
                              {item.title}
                            </h4>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-600">
                              <span>{item.publisher}</span>
                              <span>·</span>
                              <span className="uppercase tracking-wide">
                                {item.source === 'yahoo' ? 'Yahoo' : 'Google'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start justify-end">
                            <span className="inline-flex items-center gap-1 rounded-lg border border-white/6 bg-white/3 px-2.5 py-1.5 text-[11px] text-zinc-500 transition group-hover:border-indigo-500/20 group-hover:text-indigo-300">
                              Oku <ExternalLink className="h-3 w-3" />
                            </span>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function FilterChip({
  active,
  label,
  market,
  onClick,
}: {
  active: boolean
  label: string
  market?: 'BIST' | 'US'
  onClick: () => void
}) {
  const theme = market ? getMarketTheme(market) : null
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
        active
          ? theme
            ? theme.badge
            : 'bg-indigo-500/20 text-indigo-300'
          : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {label}
    </button>
  )
}
