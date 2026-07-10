import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  blocksToPlainText,
  createBlock,
  dailyJournalTemplate,
  emptyBlocks,
  formatJournalDate,
  migrateContentToBlocks,
  todayIso,
  type Note,
  type NoteBlock,
  type NoteDraft,
} from '../types/notes'

const STORAGE_KEY = 'nexus_notes_v2'
const LEGACY_KEY = 'nexus_notes'

interface NotesContextValue {
  notes: Note[]
  pages: Note[]
  dailyNotes: Note[]
  addPage: (draft?: NoteDraft) => string
  openOrCreateDaily: (isoDate?: string) => string
  updateNote: (id: string, draft: NoteDraft) => void
  updateBlocks: (id: string, blocks: NoteBlock[]) => void
  deleteNote: (id: string) => void
  togglePin: (id: string) => void
  toggleArchive: (id: string) => void
  getChildren: (parentId: string | null) => Note[]
  getBreadcrumb: (id: string) => Note[]
}

const NotesContext = createContext<NotesContextValue | null>(null)

function normalizeNote(raw: Record<string, unknown>): Note | null {
  if (typeof raw.id !== 'string' || typeof raw.title !== 'string') return null

  let blocks: NoteBlock[]
  if (Array.isArray(raw.blocks) && raw.blocks.length > 0) {
    blocks = raw.blocks
      .filter((block): block is NoteBlock => typeof (block as NoteBlock)?.id === 'string')
      .map((block) => ({
        id: block.id,
        type: block.type ?? 'paragraph',
        text: typeof block.text === 'string' ? block.text : '',
        checked: Boolean(block.checked),
      }))
  } else if (typeof raw.content === 'string') {
    blocks = migrateContentToBlocks(raw.content)
  } else {
    blocks = emptyBlocks()
  }

  if (blocks.length === 0) blocks = emptyBlocks()

  return {
    id: raw.id,
    title: raw.title,
    blocks,
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    color: (raw.color as Note['color']) ?? 'indigo',
    icon: typeof raw.icon === 'string' ? raw.icon : raw.kind === 'daily' ? '📅' : '📄',
    cover: (raw.cover as Note['cover']) ?? 'none',
    kind: raw.kind === 'daily' ? 'daily' : 'page',
    parentId: typeof raw.parentId === 'string' ? raw.parentId : null,
    journalDate: typeof raw.journalDate === 'string' ? raw.journalDate : null,
    pinned: Boolean(raw.pinned),
    archived: Boolean(raw.archived),
    createdAt: Number(raw.createdAt) || Date.now(),
    updatedAt: Number(raw.updatedAt) || Date.now(),
  }
}

function loadNotes(): Note[] {
  try {
    const primary = localStorage.getItem(STORAGE_KEY)
    const legacy = localStorage.getItem(LEGACY_KEY)
    const raw = JSON.parse(primary ?? legacy ?? '[]')
    if (!Array.isArray(raw)) return []
    return raw.map((item) => normalizeNote(item)).filter((note): note is Note => note !== null)
  } catch {
    return []
  }
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(loadNotes)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  }, [notes])

  const addPage = useCallback((draft: NoteDraft = {}) => {
    const now = Date.now()
    const id = crypto.randomUUID()
    const note: Note = {
      id,
      title: draft.title?.trim() || 'Başlıksız',
      blocks: draft.blocks?.length ? draft.blocks : emptyBlocks(),
      tags: draft.tags ?? [],
      color: draft.color ?? 'indigo',
      icon: draft.icon ?? '📄',
      cover: draft.cover ?? 'none',
      kind: draft.kind ?? 'page',
      parentId: draft.parentId ?? null,
      journalDate: draft.journalDate ?? null,
      pinned: draft.pinned ?? false,
      archived: false,
      createdAt: now,
      updatedAt: now,
    }
    setNotes((current) => [note, ...current])
    return id
  }, [])

  const openOrCreateDaily = useCallback(
    (isoDate = todayIso()) => {
      const existing = notes.find(
        (note) => note.kind === 'daily' && note.journalDate === isoDate && !note.archived,
      )
      if (existing) return existing.id

      const label = formatJournalDate(isoDate)
      return addPage({
        title: label,
        kind: 'daily',
        journalDate: isoDate,
        icon: '📅',
        cover: 'midnight',
        color: 'indigo',
        tags: ['günlük'],
        blocks: dailyJournalTemplate(label),
      })
    },
    [addPage, notes],
  )

  const updateNote = useCallback((id: string, draft: NoteDraft) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id
          ? {
              ...note,
              ...draft,
              title: draft.title !== undefined ? draft.title.trim() || 'Başlıksız' : note.title,
              updatedAt: Date.now(),
            }
          : note,
      ),
    )
  }, [])

  const updateBlocks = useCallback((id: string, blocks: NoteBlock[]) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id
          ? {
              ...note,
              blocks: blocks.length > 0 ? blocks : [createBlock()],
              updatedAt: Date.now(),
            }
          : note,
      ),
    )
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((current) => {
      const removeIds = new Set<string>([id])
      let changed = true
      while (changed) {
        changed = false
        for (const note of current) {
          if (note.parentId && removeIds.has(note.parentId) && !removeIds.has(note.id)) {
            removeIds.add(note.id)
            changed = true
          }
        }
      }
      return current.filter((note) => !removeIds.has(note.id))
    })
  }, [])

  const togglePin = useCallback((id: string) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned, updatedAt: Date.now() } : note,
      ),
    )
  }, [])

  const toggleArchive = useCallback((id: string) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id ? { ...note, archived: !note.archived, updatedAt: Date.now() } : note,
      ),
    )
  }, [])

  const getChildren = useCallback(
    (parentId: string | null) =>
      notes
        .filter((note) => !note.archived && note.kind === 'page' && note.parentId === parentId)
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt),
    [notes],
  )

  const getBreadcrumb = useCallback(
    (id: string) => {
      const chain: Note[] = []
      let current = notes.find((note) => note.id === id)
      while (current) {
        chain.unshift(current)
        current = current.parentId
          ? notes.find((note) => note.id === current!.parentId)
          : undefined
      }
      return chain
    },
    [notes],
  )

  const pages = useMemo(
    () => notes.filter((note) => note.kind === 'page' && !note.archived),
    [notes],
  )
  const dailyNotes = useMemo(
    () =>
      notes
        .filter((note) => note.kind === 'daily' && !note.archived)
        .sort((a, b) => (b.journalDate ?? '').localeCompare(a.journalDate ?? '')),
    [notes],
  )

  const value = useMemo(
    () => ({
      notes,
      pages,
      dailyNotes,
      addPage,
      openOrCreateDaily,
      updateNote,
      updateBlocks,
      deleteNote,
      togglePin,
      toggleArchive,
      getChildren,
      getBreadcrumb,
    }),
    [
      notes,
      pages,
      dailyNotes,
      addPage,
      openOrCreateDaily,
      updateNote,
      updateBlocks,
      deleteNote,
      togglePin,
      toggleArchive,
      getChildren,
      getBreadcrumb,
    ],
  )

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (!context) throw new Error('useNotes must be used within NotesProvider')
  return context
}

export function noteSearchText(note: Note) {
  return `${note.title}\n${blocksToPlainText(note.blocks)}\n${note.tags.join(' ')}`
}
