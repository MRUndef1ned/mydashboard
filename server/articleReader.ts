type ArticleContent = {
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

type CacheEntry = {
  expiresAt: number
  value: ArticleContent
}

const CACHE_TTL_MS = 60 * 60 * 1000
const articleCache = new Map<string, CacheEntry>()
const resolveCache = new Map<string, { expiresAt: number; value: string }>()

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isGoogleNewsUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return host === 'news.google.com' || host.endsWith('.news.google.com')
  } catch {
    return false
  }
}

function stripMarkdownNoise(text: string): string {
  return text
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[[^\]]*]\([^)]+\)/g, (match) => {
      const label = match.match(/^\[([^\]]*)]/)?.[1]?.trim() ?? ''
      return label
    })
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\r/g, '')
    .trim()
}

function looksLikeNav(text: string): boolean {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= 12 && words.every((w) => w.length < 18)) {
    const joined = words.join(' ').toLowerCase()
    if (/(home|ekonomi|piyasa|gündem|business|investing|markets|spor|more|ara|menu)/i.test(joined)) {
      return true
    }
  }
  if (/^(ekonomi|şirket|piyasa|gündem|startup|borsa|haberler)/i.test(text) && text.length < 120) {
    return true
  }
  return false
}

function toParagraphs(text: string, title?: string): string[] {
  const cleaned = stripMarkdownNoise(text)
  const titleNorm = title ? normalizeLoose(title) : ''
  const chunks = cleaned
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 55)
    .filter((p) => !/^(title|url source|markdown content|published time|image source):/i.test(p))
    .filter((p) => !/jina\.ai|r\.jina\.ai/i.test(p))
    .filter((p) => !/cookie|subscribe|sign in|giriş yap|üyelik|newsletter|verification successful|security service|cloudflare|facebook\.com\/sharer|twitter\.com\/intent|whatsapp:\/\//i.test(p))
    .filter((p) => !/^just a moment/i.test(p))
    .filter((p) => !/^https?:\/\//i.test(p))
    .filter((p) => !looksLikeNav(p))
    .filter((p) => (p.match(/[a-zA-ZçğıöşüÇĞİÖŞÜ]/g) || []).length > 30)
    .filter((p) => !titleNorm || normalizeLoose(p) !== titleNorm)

  const unique: string[] = []
  for (const chunk of chunks) {
    if (!unique.some((existing) => existing.slice(0, 90) === chunk.slice(0, 90))) {
      unique.push(chunk)
    }
  }
  return unique.slice(0, 24)
}

function normalizeLoose(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isNoiseTitle(title: string): boolean {
  const t = title.toLowerCase()
  return (
    !title ||
    t.includes('comprehensive up-to-date news coverage') ||
    t === 'google news' ||
    t === 'just a moment...' ||
    t.includes('attention required') ||
    (t.includes('yahoo finance') && t.length < 20)
  )
}

function wrapArticle(partial: {
  url: string
  finalUrl?: string
  title: string
  description: string
  image: string | null
  publisher: string | null
  paragraphs: string[]
  partial: boolean
}): ArticleContent {
  const excerpt = partial.description || partial.paragraphs[0] || ''
  return {
    url: partial.url,
    finalUrl: partial.finalUrl || partial.url,
    title: partial.title,
    description: partial.description,
    image: partial.image,
    publisher: partial.publisher,
    paragraphs: partial.paragraphs,
    excerpt,
    fetchedAt: Date.now(),
    partial: partial.partial,
  }
}

async function resolveGoogleNewsUrl(url: string): Promise<string> {
  const cached = resolveCache.get(url)
  if (cached && cached.expiresAt > Date.now()) return cached.value
  if (!isGoogleNewsUrl(url)) return url

  try {
    const articleId = url.replace(/\/$/, '').split('/').pop()?.split('?')[0]
    if (!articleId) return url

    const pageRes = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html' },
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
    })
    if (!pageRes.ok) return url
    const pageText = await pageRes.text()
    const sig = pageText.match(/data-n-a-sg="([^"]+)"/)?.[1]
    const ts = pageText.match(/data-n-a-ts="([^"]+)"/)?.[1]
    if (!sig || !ts) return url

    const rpcInner = JSON.stringify([
      'garturlreq',
      [
        ['X', 'X', ['X', 'X'], null, null, 1, 1, 'US:en', null, 1, null, null, null, null, null, 0, 1],
        'X',
        'X',
        1,
        [1, 1, 1],
        1,
        1,
        null,
        0,
        0,
        null,
        0,
      ],
      articleId,
      Number(ts),
      sig,
    ])
    const fReq = JSON.stringify([[['Fbv4je', rpcInner, null, 'generic']]])
    const body = new URLSearchParams({ 'f.req': fReq })

    const postRes = await fetch('https://news.google.com/_/DotsSplashUi/data/batchexecute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        Referer: 'https://news.google.com/',
        'User-Agent': UA,
      },
      body,
      signal: AbortSignal.timeout(12000),
    })
    if (!postRes.ok) return url

    let text = await postRes.text()
    if (text.startsWith(")]}'")) text = text.split('\n').slice(1).join('\n')
    text = text.trim()
    const firstLine = text.split('\n')[0]?.trim()
    if (firstLine && /^\d+$/.test(firstLine)) {
      text = text.split('\n').slice(1).join('\n')
    }

    const envelopes = JSON.parse(text) as unknown[]
    for (const env of envelopes) {
      if (
        Array.isArray(env) &&
        env.length >= 3 &&
        env[0] === 'wrb.fr' &&
        env[1] === 'Fbv4je' &&
        typeof env[2] === 'string'
      ) {
        const payload = JSON.parse(env[2]) as unknown[]
        if (Array.isArray(payload) && payload[0] === 'garturlres' && typeof payload[1] === 'string') {
          resolveCache.set(url, { expiresAt: Date.now() + CACHE_TTL_MS, value: payload[1] })
          return payload[1]
        }
      }
    }
  } catch {
    /* keep original */
  }

  return url
}

async function fetchViaJina(url: string): Promise<ArticleContent | null> {
  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        Accept: 'application/json',
        'X-Return-Format': 'markdown',
        'User-Agent': UA,
      },
      signal: AbortSignal.timeout(25000),
    })
    if (!response.ok) return null

    const payload = (await response.json()) as {
      code?: number
      data?: {
        title?: string
        description?: string
        url?: string
        content?: string
      }
    }

    if (payload.code !== 200 || !payload.data?.content) return null

    const title = decodeHtml(payload.data.title ?? '')
    if (isNoiseTitle(title)) return null

    const paragraphs = toParagraphs(payload.data.content, title)
    if (paragraphs.length < 1) return null

    const description = decodeHtml(payload.data.description ?? paragraphs[0] ?? '')
    const body = paragraphs.filter((p) => normalizeLoose(p) !== normalizeLoose(description))

    return wrapArticle({
      url,
      finalUrl: payload.data.url || url,
      title,
      description,
      image: null,
      publisher: null,
      paragraphs: body.length > 0 ? body : paragraphs,
      partial: paragraphs.length < 3,
    })
  } catch {
    return null
  }
}

function extractMeta(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["']`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return decodeHtml(match[1])
  }
  return null
}

function extractTitle(html: string): string {
  return (
    extractMeta(html, 'og:title') ||
    extractMeta(html, 'twitter:title') ||
    decodeHtml(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? '')
  )
}

function extractParagraphsFromHtml(html: string): string[] {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')

  const matches = [...withoutScripts.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
  const paragraphs: string[] = []

  for (const match of matches) {
    const text = decodeHtml(match[1].replace(/<[^>]+>/g, ' '))
    if (text.length < 55) continue
    if (/cookie|subscribe|sign in|newsletter|advertisement|cloudflare/i.test(text)) continue
    if (looksLikeNav(text)) continue
    paragraphs.push(text)
    if (paragraphs.length >= 18) break
  }

  return paragraphs
}

async function fetchMetaExtras(url: string): Promise<{
  image: string | null
  description: string
  publisher: string | null
  title: string
}> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) {
      return { image: null, description: '', publisher: null, title: '' }
    }
    const html = await response.text()
    return {
      image: extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image'),
      description:
        extractMeta(html, 'og:description') ||
        extractMeta(html, 'description') ||
        extractMeta(html, 'twitter:description') ||
        '',
      publisher: extractMeta(html, 'og:site_name'),
      title: extractTitle(html),
    }
  } catch {
    return { image: null, description: '', publisher: null, title: '' }
  }
}

async function fetchViaHtml(url: string): Promise<ArticleContent | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
    })
    if (!response.ok) return null

    const html = await response.text()
    const title = extractTitle(html)
    if (isNoiseTitle(title)) return null

    const description =
      extractMeta(html, 'og:description') ||
      extractMeta(html, 'description') ||
      extractMeta(html, 'twitter:description') ||
      ''
    const image = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image')
    const siteName = extractMeta(html, 'og:site_name')
    const paragraphs = extractParagraphsFromHtml(html)

    if (!description && paragraphs.length === 0) return null

    return wrapArticle({
      url,
      finalUrl: response.url || url,
      title: title || 'Haber',
      description,
      image,
      publisher: siteName,
      paragraphs: paragraphs.length > 0 ? paragraphs : description ? [description] : [],
      partial: paragraphs.length < 2,
    })
  } catch {
    return null
  }
}

export async function fetchArticleContent(
  url: string,
  fallback?: { title?: string; publisher?: string },
): Promise<ArticleContent> {
  const cached = articleCache.get(url)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  const resolvedUrl = await resolveGoogleNewsUrl(url)
  const jina = await fetchViaJina(resolvedUrl)
  let result = jina

  if (!result || result.paragraphs.length < 2) {
    const html = await fetchViaHtml(resolvedUrl)
    if (html && (!result || html.paragraphs.length > result.paragraphs.length)) {
      result = html
    }
  }

  if (result && (!result.image || !result.publisher || !result.description)) {
    const extras = await fetchMetaExtras(resolvedUrl)
    if (!result.image && extras.image) result.image = extras.image
    if (!result.publisher && extras.publisher) result.publisher = extras.publisher
    if (!result.description && extras.description) result.description = extras.description
    if (isNoiseTitle(result.title) && extras.title) result.title = extras.title
  }

  const value =
    result ??
    wrapArticle({
      url,
      finalUrl: resolvedUrl,
      title: fallback?.title || 'Haber içeriği alınamadı',
      description:
        'Bu kaynağın tam metni otomatik olarak çekilemedi. Haberin orijinal sayfasını açarak devam edebilirsiniz.',
      image: null,
      publisher: fallback?.publisher || null,
      paragraphs: [],
      partial: true,
    })

  value.url = url
  if (!value.finalUrl || isGoogleNewsUrl(value.finalUrl)) {
    value.finalUrl = resolvedUrl
  }
  if (fallback?.publisher && !value.publisher) value.publisher = fallback.publisher
  if (fallback?.title && isNoiseTitle(value.title)) value.title = fallback.title

  if (!isNoiseTitle(value.title) || value.paragraphs.length > 0) {
    articleCache.set(url, { expiresAt: Date.now() + CACHE_TTL_MS, value })
  }

  return value
}
