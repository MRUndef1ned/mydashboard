import { useEffect, useState } from 'react'
import {
  Archive,
  Check,
  ChevronRight,
  MoreHorizontal,
  Pin,
  Trash2,
} from 'lucide-react'
import { BlockEditor } from './BlockEditor'
import { useNotes } from '../../context/NotesContext'
import type { Note, NoteColor, NoteCover } from '../../types/notes'

const coverStyles: Record<NoteCover, string> = {
  none: 'bg-white/[0.02]',
  midnight: 'bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950',
  aurora: 'bg-gradient-to-r from-violet-900/80 via-indigo-800/70 to-emerald-800/70',
  ocean: 'bg-gradient-to-r from-cyan-950 via-blue-900 to-indigo-950',
  sunset: 'bg-gradient-to-r from-rose-950 via-orange-900/80 to-amber-900/70',
  forest: 'bg-gradient-to-r from-emerald-950 via-green-900/80 to-teal-950',
}

const colorDots: Record<NoteColor, string> = {
  indigo: 'bg-indigo-400',
  cyan: 'bg-cyan-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
  zinc: 'bg-zinc-400',
}

const emojis = ['📄', '📝', '💡', '📌', '🚀', '🎯', '📚', '🧠', '✨', '✅', '📅', '🗂️', '🔖', '💬', '🌙', '☕']

interface NotePageViewProps {
  note: Note
  onDelete: () => void
  onNavigate: (id: string) => void
}

export function NotePageView({ note, onDelete, onNavigate }: NotePageViewProps) {
  const { updateNote, updateBlocks, togglePin, toggleArchive, getBreadcrumb, addPage } = useNotes()
  const [title, setTitle] = useState(note.title)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [coverOpen, setCoverOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const breadcrumb = getBreadcrumb(note.id)

  useEffect(() => {
    setTitle(note.title)
    setSaveStatus('saved')
    setEmojiOpen(false)
    setCoverOpen(false)
    setMenuOpen(false)
  }, [note.id])

  useEffect(() => {
    if (title === note.title) return
    setSaveStatus('saving')
    const timer = setTimeout(() => {
      updateNote(note.id, { title })
      setSaveStatus('saved')
    }, 500)
    return () => clearTimeout(timer)
  }, [title, note.id, note.title, updateNote])

  function handleBlocks(blocks: Note['blocks']) {
    setSaveStatus('saving')
    updateBlocks(note.id, blocks)
    setTimeout(() => setSaveStatus('saved'), 400)
  }

  function addTag() {
    const tag = tagInput.trim().replace(/^#/, '')
    if (!tag || note.tags.includes(tag)) {
      setTagInput('')
      return
    }
    updateNote(note.id, { tags: [...note.tags, tag].slice(0, 12) })
    setTagInput('')
  }

  function createSubpage() {
    const id = addPage({
      title: 'Başlıksız alt sayfa',
      parentId: note.id,
      icon: '📄',
    })
    onNavigate(id)
  }

  return (
    <div className="min-h-full">
      <div className={`relative h-32 sm:h-40 ${coverStyles[note.cover]}`}>
        <div className="absolute right-3 top-3 sm:right-4">
          <button
            onClick={() => setCoverOpen((open) => !open)}
            className="rounded-lg bg-black/35 px-2.5 py-1.5 text-[10px] text-zinc-300 backdrop-blur"
          >
            Kapak
          </button>
          {coverOpen && (
            <div className="absolute right-0 top-9 z-20 flex w-52 flex-wrap gap-2 rounded-xl border border-white/10 bg-[#121218] p-3 shadow-xl">
              {(Object.keys(coverStyles) as NoteCover[]).map((cover) => (
                <button
                  key={cover}
                  onClick={() => {
                    updateNote(note.id, { cover })
                    setCoverOpen(false)
                  }}
                  className={`h-8 w-14 rounded-md border border-white/10 ${coverStyles[cover]} ${
                    note.cover === cover ? 'ring-2 ring-indigo-400' : ''
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative mx-auto max-w-3xl px-5 pb-28 sm:px-10">
        <div className="relative -mt-10 mb-2 w-fit">
          <button
            onClick={() => setEmojiOpen((open) => !open)}
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl transition hover:bg-white/5 sm:h-20 sm:w-20 sm:text-5xl"
          >
            {note.icon}
          </button>
          {emojiOpen && (
            <div className="absolute left-0 top-20 z-30 grid w-64 grid-cols-8 gap-1 rounded-xl border border-white/10 bg-[#121218] p-2 shadow-2xl">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    updateNote(note.id, { icon: emoji })
                    setEmojiOpen(false)
                  }}
                  className="rounded-lg p-1.5 text-lg hover:bg-white/5"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-600">
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            {breadcrumb.map((item, index) => (
              <span key={item.id} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3 w-3" />}
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`max-w-28 truncate hover:text-zinc-300 ${
                    item.id === note.id ? 'text-zinc-400' : ''
                  }`}
                >
                  {item.title}
                </button>
              </span>
            ))}
            {note.kind === 'daily' && (
              <span className="ml-2 rounded-full bg-indigo-500/15 px-2 py-0.5 text-indigo-300">
                Günlük
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="mr-2 flex items-center gap-1 text-zinc-600">
              {saveStatus === 'saving' ? (
                'Kaydediliyor...'
              ) : (
                <>
                  <Check className="h-3 w-3 text-emerald-500" /> Kaydedildi
                </>
              )}
            </span>
            <button
              onClick={() => togglePin(note.id)}
              className={`rounded-lg p-2 hover:bg-white/5 ${note.pinned ? 'text-indigo-400' : 'text-zinc-600'}`}
              title="Favori"
            >
              <Pin className="h-4 w-4" />
            </button>
            <button
              onClick={() => toggleArchive(note.id)}
              className="rounded-lg p-2 text-zinc-600 hover:bg-white/5 hover:text-zinc-300"
              title="Arşivle"
            >
              <Archive className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg p-2 text-zinc-600 hover:bg-rose-500/10 hover:text-rose-400"
              title="Sil"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="rounded-lg p-2 text-zinc-600 hover:bg-white/5 hover:text-zinc-300"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#121218] py-1 shadow-xl">
                  <button
                    onClick={() => {
                      createSubpage()
                      setMenuOpen(false)
                    }}
                    className="block w-full px-3 py-2 text-left text-xs text-zinc-300 hover:bg-white/5"
                  >
                    Alt sayfa ekle
                  </button>
                  <button
                    onClick={() => {
                      toggleArchive(note.id)
                      setMenuOpen(false)
                    }}
                    className="block w-full px-3 py-2 text-left text-xs text-zinc-300 hover:bg-white/5"
                  >
                    {note.archived ? 'Arşivden çıkar' : 'Arşivle'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Başlıksız"
          className="mb-4 w-full border-0 bg-transparent text-3xl font-bold tracking-tight text-zinc-50 outline-none placeholder:text-zinc-800 sm:text-5xl"
        />

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {note.tags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                updateNote(note.id, { tags: note.tags.filter((item) => item !== tag) })
              }
              className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] text-indigo-300 hover:bg-rose-500/10 hover:text-rose-300"
            >
              #{tag}
            </button>
          ))}
          <input
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addTag()
              }
            }}
            placeholder="Etiket ekle"
            className="w-24 bg-transparent text-[10px] text-zinc-500 outline-none placeholder:text-zinc-700"
          />
          <div className="flex w-full gap-2 pt-1 sm:ml-auto sm:w-auto sm:pt-0">
            {(Object.keys(colorDots) as NoteColor[]).map((color) => (
              <button
                key={color}
                onClick={() => updateNote(note.id, { color })}
                className={`h-3 w-3 rounded-full ${colorDots[color]} ${
                  note.color === color
                    ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-[#0a0a0e]'
                    : 'opacity-40 hover:opacity-80'
                }`}
              />
            ))}
          </div>
        </div>

        <BlockEditor blocks={note.blocks} onChange={handleBlocks} />
      </div>
    </div>
  )
}
