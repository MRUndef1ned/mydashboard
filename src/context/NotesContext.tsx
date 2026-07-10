import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Note, NoteDraft } from '../types/notes'

const STORAGE_KEY = 'nexus_notes'

interface NotesContextValue {
  notes: Note[]
  addNote: (draft: NoteDraft) => void
  updateNote: (id: string, draft: NoteDraft) => void
  deleteNote: (id: string) => void
  togglePin: (id: string) => void
}

const NotesContext = createContext<NotesContextValue | null>(null)

function loadNotes(): Note[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (note): note is Note =>
        typeof note?.id === 'string' &&
        typeof note?.title === 'string' &&
        typeof note?.content === 'string' &&
        Array.isArray(note?.tags),
    )
  } catch {
    return []
  }
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(loadNotes)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  }, [notes])

  const addNote = useCallback((draft: NoteDraft) => {
    const now = Date.now()
    setNotes((current) => [
      {
        ...draft,
        id: crypto.randomUUID(),
        pinned: false,
        createdAt: now,
        updatedAt: now,
      },
      ...current,
    ])
  }, [])

  const updateNote = useCallback((id: string, draft: NoteDraft) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id ? { ...note, ...draft, updatedAt: Date.now() } : note,
      ),
    )
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((current) => current.filter((note) => note.id !== id))
  }, [])

  const togglePin = useCallback((id: string) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned, updatedAt: Date.now() } : note,
      ),
    )
  }, [])

  const value = useMemo(
    () => ({ notes, addNote, updateNote, deleteNote, togglePin }),
    [notes, addNote, updateNote, deleteNote, togglePin],
  )

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (!context) throw new Error('useNotes must be used within NotesProvider')
  return context
}
