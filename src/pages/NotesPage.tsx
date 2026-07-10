import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Pin,
  PinOff,
  Plus,
  Search,
  Tag,
  Trash2,
} from 'lucide-react'
import { NoteEditorModal } from '../components/notes/NoteEditorModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useNotes } from '../context/NotesContext'
import { useUI } from '../context/UIContext'
import type { Note, NoteColor } from '../types/notes'

const colorThemes: Record<NoteColor, { border: string; glow: string; accent: string; tag: string }> = {
  indigo: {
    border: 'border-indigo-500/20 hover:border-indigo-500/35',
    glow: 'from-indigo-500/10',
    accent: 'text-indigo-400',
    tag: 'bg-indigo-500/10 text-indigo-300',
  },
  cyan: {
    border: 'border-cyan-500/20 hover:border-cyan-500/35',
    glow: 'from-cyan-500/10',
    accent: 'text-cyan-400',
    tag: 'bg-cyan-500/10 text-cyan-300',
  },
  emerald: {
    border: 'border-emerald-500/20 hover:border-emerald-500/35',
    glow: 'from-emerald-500/10',
    accent: 'text-emerald-400',
    tag: 'bg-emerald-500/10 text-emerald-300',
  },
  amber: {
    border: 'border-amber-500/20 hover:border-amber-500/35',
    glow: 'from-amber-500/10',
    accent: 'text-amber-400',
    tag: 'bg-amber-500/10 text-amber-300',
  },
  rose: {
    border: 'border-rose-500/20 hover:border-rose-500/35',
    glow: 'from-rose-500/10',
    accent: 'text-rose-400',
    tag: 'bg-rose-500/10 text-rose-300',
  },
  zinc: {
    border: 'border-zinc-500/20 hover:border-zinc-500/35',
    glow: 'from-zinc-500/10',
    accent: 'text-zinc-400',
    tag: 'bg-zinc-500/10 text-zinc-300',
  },
}

export function NotesPage() {
  const { notes, deleteNote, togglePin } = useNotes()
  const { addToast } = useUI()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'pinned'>('all')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Note | null>(null)

  const tags = useMemo(
    () =>
      [...new Set(notes.flatMap((note) => note.tags))]
        .sort((a, b) => a.localeCompare(b, 'tr'))
        .slice(0, 12),
    [notes],
  )

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR')
    return [...notes]
      .filter((note) => filter === 'all' || note.pinned)
      .filter((note) => !activeTag || note.tags.includes(activeTag))
      .filter(
        (note) =>
          !normalizedQuery ||
          note.title.toLocaleLowerCase('tr-TR').includes(normalizedQuery) ||
          note.content.toLocaleLowerCase('tr-TR').includes(normalizedQuery) ||
          note.tags.some((tag) => tag.toLocaleLowerCase('tr-TR').includes(normalizedQuery)),
      )
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt)
  }, [notes, query, filter, activeTag])

  function createNote() {
    setEditing(null)
    setEditorOpen(true)
  }

  function editNote(note: Note) {
    setEditing(note)
    setEditorOpen(true)
  }

  function closeEditor() {
    setEditorOpen(false)
    setEditing(null)
  }

  function confirmDelete() {
    if (!removeTarget) return
    deleteNote(removeTarget.id)
    addToast('Not silindi.', 'info')
    setRemoveTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/6 bg-gradient-to-r from-indigo-500/10 via-transparent to-cyan-500/8 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Not Defteri</h3>
            <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-medium text-zinc-500">
              {notes.length} not
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Fikirlerinizi, hatırlatmalarınızı ve önemli bilgileri tek yerde tutun.
          </p>
        </div>
        <button
          onClick={createNote}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-indigo-500"
        >
          <Plus className="h-4 w-4" /> Yeni Not
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Notlarda ve etiketlerde ara..."
            className="w-full rounded-xl border border-white/6 bg-white/3 py-2.5 pl-10 pr-4 text-sm text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-indigo-500/30"
          />
        </div>
        <div className="flex rounded-xl border border-white/6 bg-white/3 p-1">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${filter === 'all' ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500'}`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter('pinned')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${filter === 'pinned' ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500'}`}
          >
            <Pin className="h-3 w-3" /> Sabitlenenler
          </button>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-zinc-600" />
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag((current) => (current === tag ? null : tag))}
              className={`rounded-full px-3 py-1 text-[11px] transition ${
                activeTag === tag
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'border border-white/6 bg-white/3 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {visibleNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <FileText className="h-6 w-6" />
          </div>
          <p className="mb-2 text-lg font-medium text-zinc-300">
            {notes.length === 0 ? 'Henüz notunuz yok' : 'Eşleşen not bulunamadı'}
          </p>
          <p className="mb-6 text-sm text-zinc-600">
            {notes.length === 0 ? 'İlk notunuzu oluşturarak başlayın.' : 'Arama veya filtreleri değiştirin.'}
          </p>
          {notes.length === 0 && (
            <button onClick={createNote} className="flex items-center gap-2 rounded-xl bg-indigo-500/15 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/25">
              <Plus className="h-4 w-4" /> İlk Notu Oluştur
            </button>
          )}
        </div>
      ) : (
        <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => editNote(note)}
              onPin={() => {
                togglePin(note.id)
                addToast(note.pinned ? 'Not sabitlemeden kaldırıldı.' : 'Not sabitlendi.')
              }}
              onDelete={() => setRemoveTarget(note)}
            />
          ))}
        </div>
      )}

      <NoteEditorModal open={editorOpen} note={editing} onClose={closeEditor} />
      <ConfirmDialog
        open={removeTarget != null}
        title="Notu sil?"
        message={removeTarget ? `“${removeTarget.title}” notu kalıcı olarak silinecek.` : ''}
        confirmLabel="Evet, Sil"
        cancelLabel="Vazgeç"
        onConfirm={confirmDelete}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  )
}

function NoteCard({
  note,
  onEdit,
  onPin,
  onDelete,
}: {
  note: Note
  onEdit: () => void
  onPin: () => void
  onDelete: () => void
}) {
  const theme = colorThemes[note.color] ?? colorThemes.indigo
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onEdit}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-gradient-to-br ${theme.glow} to-surface-1/60 p-5 transition ${theme.border}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {note.pinned && <Pin className={`h-3.5 w-3.5 shrink-0 ${theme.accent}`} />}
            <h3 className="truncate font-semibold text-white">{note.title}</h3>
          </div>
          <p className="mt-1 text-[10px] text-zinc-600">
            {new Date(note.updatedAt).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex shrink-0 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={(event) => {
              event.stopPropagation()
              onPin()
            }}
            title={note.pinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
            className="rounded-lg p-1.5 text-zinc-600 hover:bg-white/5 hover:text-indigo-400"
          >
            {note.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation()
              onDelete()
            }}
            title="Notu sil"
            className="rounded-lg p-1.5 text-zinc-600 hover:bg-rose-500/10 hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {note.content && (
        <p className="mb-4 max-h-36 overflow-hidden whitespace-pre-wrap text-sm leading-6 text-zinc-400">
          {note.content}
        </p>
      )}

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <span key={tag} className={`rounded-full px-2 py-0.5 text-[10px] ${theme.tag}`}>
              #{tag}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  )
}
