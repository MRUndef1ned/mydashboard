import { useEffect, useState } from 'react'

export interface ArticleContent {
  url: string
  finalUrl: string
  title: string
  description: string
  image: string | null
  publisher: string | null
  paragraphs: string[]
  excerpt: string
  fetchedAt: number
  partial: boolean
}

const memoryCache = new Map<string, ArticleContent>()

export function useArticleReader(url: string | null, meta?: { title?: string; publisher?: string }) {
  const [article, setArticle] = useState<ArticleContent | null>(url ? memoryCache.get(url) ?? null : null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) {
      setArticle(null)
      setError(null)
      setLoading(false)
      return
    }

    const cached = memoryCache.get(url)
    if (cached) {
      setArticle(cached)
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    async function load() {
      if (!url) return
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({ url })
        if (meta?.title) params.set('title', meta.title)
        if (meta?.publisher) params.set('publisher', meta.publisher)
        const response = await fetch(`/api/stocks/news/article?${params}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('article failed')
        const data = await response.json()
        memoryCache.set(url, data.article)
        setArticle(data.article)
      } catch (reason) {
        if ((reason as Error).name !== 'AbortError') {
          setError('Haber içeriği yüklenemedi')
          setArticle(null)
        }
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [url, meta?.title, meta?.publisher])

  return { article, loading, error }
}
