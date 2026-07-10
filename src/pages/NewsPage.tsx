import { useMemo, useState } from 'react'
import { ExternalLink, Newspaper, Radio, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWatchlistNews } from '../hooks/useWatchlistNews'
import { displaySymbol } from '../types/stocks'
import { getMarketTheme } from '../utils/stockViews'

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Az önce'
  if (minutes < 60) return `${minutes} dk önce`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} sa önce`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} gün önce`
  return new Date(timestamp).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  })
}

export function NewsPage() {
  const [filter, setFilter] = useState<string>('all')
  const { news, allNews, loading, error, updatedAt, watchlist } = useWatchlistNews(filter)

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of allNews) {
      map.set(item.symbol, (map.get(item.symbol) ?? 0) + 1)
    }
    return map
  }, [allNews])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/6 bg-gradient-to-r from-indigo-500/10 via-transparent to-cyan-500/8 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Hisse Haberleri</h3>
            <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-medium text-zinc-500">
              {allNews.length} haber
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            İzleme listenizdeki hisselere özel güncel haber akışı.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          {updatedAt && (
            <span className="flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-emerald-400" />
              Son güncelleme: {new Date(updatedAt).toLocaleTimeString('tr-TR')}
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
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-24 animate-pulse rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
              <p className="text-sm text-zinc-500">Bu filtre için haber bulunamadı.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {news.map((item) => {
                const theme = getMarketTheme(item.market)
                return (
                  <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className={`group rounded-2xl border bg-surface-1/50 p-4 transition hover:bg-white/[0.03] ${theme.cardBorder}`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${theme.badge}`}>
                        {displaySymbol(item.symbol)}
                      </span>
                      <span className="text-[10px] text-zinc-600">{item.publisher}</span>
                      <span className="text-[10px] text-zinc-700">·</span>
                      <span className="text-[10px] text-zinc-600">
                        {formatRelativeTime(item.publishedAt)}
                      </span>
                      <ExternalLink className="ml-auto h-3.5 w-3.5 text-zinc-700 opacity-0 transition group-hover:opacity-100" />
                    </div>
                    <h4 className="text-sm font-medium leading-6 text-zinc-100 group-hover:text-white">
                      {item.title}
                    </h4>
                  </a>
                )
              })}
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
            ? `${theme.badge}`
            : 'bg-indigo-500/20 text-indigo-300'
          : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {label}
    </button>
  )
}
