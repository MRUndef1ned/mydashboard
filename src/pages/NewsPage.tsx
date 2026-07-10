import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Newspaper,
  Radio,
  RefreshCw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useArticleReader } from '../hooks/useArticleReader'
import { useWatchlistNews, type StockNewsItem } from '../hooks/useWatchlistNews'
import { displaySymbol } from '../types/stocks'
import { getMarketTheme } from '../utils/stockViews'

function formatWhen(timestamp: number) {
  const diff = Date.now() - timestamp
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'Az önce'
  if (hours < 24) return `${hours} sa önce`
  if (hours < 48) return 'Dün'
  return new Date(timestamp).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  })
}

export function NewsPage() {
  const [filter, setFilter] = useState('all')
  const { news, allNews, loading, error, updatedAt, watchlist } = useWatchlistNews(filter)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mobileReader, setMobileReader] = useState(false)

  const selected = news.find((item) => item.id === selectedId) ?? news[0] ?? null

  useEffect(() => {
    if (!selectedId && news[0]) setSelectedId(news[0].id)
    if (selectedId && !news.some((item) => item.id === selectedId) && news[0]) {
      setSelectedId(news[0].id)
    }
  }, [news, selectedId])

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of allNews) map.set(item.symbol, (map.get(item.symbol) ?? 0) + 1)
    return map
  }, [allNews])

  function openStory(item: StockNewsItem) {
    setSelectedId(item.id)
    setMobileReader(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-white">Haberler</h3>
          <p className="mt-1.5 max-w-xl text-sm text-zinc-500">
            İzleme listendeki hisselerin haberleri — tıkla, dashboard içinde oku.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1">
            Son 7 gün · {allNews.length}
          </span>
          {updatedAt && (
            <span className="flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-emerald-400" />
              {new Date(updatedAt).toLocaleTimeString('tr-TR')}
            </span>
          )}
          {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />}
        </div>
      </div>

      {watchlist.length === 0 ? (
        <EmptyWatchlist />
      ) : (
        <>
          <div className="flex gap-1 overflow-x-auto rounded-2xl border border-white/6 bg-white/[0.03] p-1.5">
            <FilterChip active={filter === 'all'} label={`Tümü (${allNews.length})`} onClick={() => setFilter('all')} />
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
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          {loading && news.length === 0 ? (
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.35fr]">
              <div className="h-[70vh] animate-pulse rounded-[24px] bg-white/5" />
              <div className="h-[70vh] animate-pulse rounded-[24px] bg-white/5" />
            </div>
          ) : news.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 py-20 text-center text-sm text-zinc-500">
              Bu filtre için yeterince taze ve ilgili haber yok.
            </div>
          ) : (
            <div className="grid overflow-hidden rounded-[24px] border border-white/8 bg-[#0c0c10] lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
              <aside className={`${mobileReader ? 'hidden lg:flex' : 'flex'} min-h-[70vh] flex-col border-b border-white/6 lg:border-b-0 lg:border-r`}>
                <div className="border-b border-white/6 px-5 py-4">
                  <p className="text-xs font-semibold text-zinc-300">Akış</p>
                  <p className="text-[11px] text-zinc-600">Habere tıkla, sağda oku</p>
                </div>
                <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
                  {news.map((item) => {
                    const active = selected?.id === item.id
                    const theme = getMarketTheme(item.market)
                    return (
                      <button
                        key={item.id}
                        onClick={() => openStory(item)}
                        className={`w-full rounded-xl px-3.5 py-3.5 text-left transition ${
                          active
                            ? 'bg-white/[0.07] ring-1 ring-white/10'
                            : 'hover:bg-white/[0.035]'
                        }`}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${theme.badge}`}>
                            {displaySymbol(item.symbol)}
                          </span>
                          <span className="truncate text-[10px] text-zinc-600">{item.publisher}</span>
                          <span className="ml-auto shrink-0 text-[10px] text-zinc-700">
                            {formatWhen(item.publishedAt)}
                          </span>
                        </div>
                        <p className={`text-sm leading-5 ${active ? 'text-white' : 'text-zinc-300'}`}>
                          {item.title}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </aside>

              <main className={`${mobileReader ? 'flex' : 'hidden lg:flex'} min-h-[70vh] flex-col`}>
                {selected ? (
                  <ArticleReader item={selected} onBack={() => setMobileReader(false)} />
                ) : (
                  <div className="flex flex-1 items-center justify-center text-sm text-zinc-600">
                    Okumak için bir haber seç
                  </div>
                )}
              </main>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ArticleReader({
  item,
  onBack,
}: {
  item: StockNewsItem
  onBack: () => void
}) {
  const { article, loading, error } = useArticleReader(item.link, {
    title: item.title,
    publisher: item.publisher,
  })
  const theme = getMarketTheme(item.market)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-white/6 px-4 py-3 sm:px-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-zinc-500 hover:bg-white/5 hover:text-zinc-300 lg:hidden"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Akış
        </button>
        <div className="flex min-w-0 items-center gap-2">
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${theme.badge}`}>
            {displaySymbol(item.symbol)}
          </span>
          <span className="truncate text-xs text-zinc-500">
            {article?.publisher || item.publisher}
          </span>
        </div>
        <a
          href={article?.finalUrl || item.link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-zinc-400 hover:text-white"
        >
          Kaynak <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
            <BookOpen className="h-3 w-3" />
            {formatWhen(item.publishedAt)} · {item.source === 'yahoo' ? 'Yahoo' : 'Google'}
          </p>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            {article?.title || item.title}
          </h2>

          {loading && (
            <div className="mt-8 space-y-3">
              <div className="h-52 animate-pulse rounded-2xl bg-white/5" />
              <div className="h-4 w-full animate-pulse rounded bg-white/5" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-white/5" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-white/5" />
              <p className="pt-2 text-xs text-zinc-600">Haber metni çekiliyor…</p>
            </div>
          )}

          {error && !loading && (
            <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
              Tam metin alınamadı. Başlık listeden geliyor; kaynak linkinden devam edebilirsin.
            </div>
          )}

          {!loading && article && (
            <>
              {article.image && (
                <div className="mt-8 overflow-hidden rounded-2xl border border-white/8">
                  <img
                    src={article.image}
                    alt=""
                    className="aspect-[16/9] w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {article.description && (
                <p className="mt-8 border-l-2 border-emerald-400/35 pl-4 text-base leading-7 text-zinc-400">
                  {article.description}
                </p>
              )}

              <div className="mt-8 space-y-5">
                {article.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="text-[16px] leading-8 text-zinc-300">
                    {paragraph}
                  </p>
                ))}
              </div>

              {article.partial && (
                <div className="mt-10 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-zinc-500">
                  Bazı siteler tam metni engelliyor. Okuduğun içerik özet + çekilebilen paragraflardan oluşuyor.
                </div>
              )}

              {!article.partial && article.paragraphs.length === 0 && (
                <div className="mt-10 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-zinc-500">
                  Bu kaynak için gövde metni gelmedi. Sağ üstteki Kaynak ile orijinal sayfayı açabilirsin.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyWatchlist() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 py-20">
      <Newspaper className="mb-4 h-10 w-10 text-zinc-700" />
      <p className="mb-2 text-lg font-medium text-zinc-300">Önce hisse listesi gerekli</p>
      <p className="mb-6 max-w-md text-center text-sm text-zinc-600">
        Haberler, Borsa sayfasındaki izleme listene göre dolar.
      </p>
      <Link to="/stocks" className="rounded-xl bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-400">
        Borsa sayfasına git
      </Link>
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
      className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-medium transition ${
        active
          ? theme
            ? theme.badge
            : 'bg-white/10 text-white'
          : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {label}
    </button>
  )
}
