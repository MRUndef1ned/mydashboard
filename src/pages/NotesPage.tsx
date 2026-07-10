import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  ChevronRight,
  Code2,
  FileText,
  Heading1,
  List,
  ListChecks,
  MoreHorizontal,
  PanelLeft,
  Pin,
  Plus,
  Quote,
  Search,
  Tag,
  Trash2,
  Type,
} from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useNotes } from '../context/NotesContext'
import { useUI } from '../context/UIContext'
import type { Note, NoteColor, NoteCover, NoteDraft } from '../types/notes'

const coverStyles: Record<NoteCover, string> = {
  none: '',
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

const emojis = ['📝', '💡', '📌', '🚀', '🎯', '📚', '🧠', '✨', '✅', '🗂️', '🔖', '💬']

const slashCommands = [
  { label: 'Metin', description: 'Normal metin bloğu', icon: Type, prefix: '' },
  { label: 'Başlık', description: 'Büyük bölüm başlığı', icon: Heading1, prefix: '# ' },
  { label: 'Madde listesi', description: 'Basit madde işareti', icon: List, prefix: '• ' },
  { label: 'Yapılacak', description: 'Kontrol listesi öğesi', icon: ListChecks, prefix: '☐ ' },
  { label: 'Alıntı', description: 'Vurgulanmış alıntı', icon: Quote, prefix: '❝ ' },
  { label: 'Kod', description: 'Kod bloğu başlangıcı', icon: Code2, prefix: '```' },
]

export function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, togglePin } = useNotes()
  const { addToast } = useUI()
  const [selectedId, setSelectedId] = useState<string | null>(notes[0]?.id ?? null)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<NoteDraft | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')
  const [slashOpen, setSlashOpen] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [removeTarget, setRemoveTarget] = useState<Note | null>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  const selected = notes.find((note) => note.id === selectedId) ?? null
  const sortedNotes = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr-TR')
    return [...notes]
      .filter(
        (note) =>
          !normalized ||
          note.title.toLocaleLowerCase('tr-TR').includes(normalized) ||
          note.content.toLocaleLowerCase('tr-TR').includes(normalized),
      )
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt)
  }, [notes, query])

  useEffect(() => {
    if (selectedId && notes.some((note) => note.id === selectedId)) return
    setSelectedId(notes[0]?.id ?? null)
  }, [notes, selectedId])

  useEffect(() => {
    if (!selected) {
      setDraft(null)
      return
    }
    setDraft({
      title: selected.title,
      content: selected.content,
      tags: selected.tags,
      color: selected.color,
      icon: selected.icon,
      cover: selected.cover,
    })
    setSaveStatus('saved')
    setSlashOpen(false)
    setEmojiOpen(false)
  }, [selected?.id])

  useEffect(() => {
    if (!selected || !draft) return
    const changed =
      selected.title !== draft.title ||
      selected.content !== draft.content ||
      selected.color !== draft.color ||
      selected.icon !== draft.icon ||
      selected.cover !== draft.cover ||
      selected.tags.join('|') !== draft.tags.join('|')
    if (!changed) {
      setSaveStatus('saved')
      return
    }

    setSaveStatus('saving')
    const timer = setTimeout(() => {
      updateNote(selected.id, {
        ...draft,
        title: draft.title.trim() || 'Başlıksız',
      })
      setSaveStatus('saved')
    }, 650)
    return () => clearTimeout(timer)
  }, [draft, selected, updateNote])

  function createPage() {
    const id = addNote({
      title: 'Başlıksız',
      content: '',
      tags: [],
      color: 'indigo',
      icon: '📝',
      cover: 'none',
    })
    setSelectedId(id)
    setQuery('')
    addToast('Yeni sayfa oluşturuldu.')
  }

  function patchDraft(patch: Partial<NoteDraft>) {
    setDraft((current) => (current ? { ...current, ...patch } : current))
  }

  function handleContent(value: string) {
    patchDraft({ content: value })
    const lastLine = value.split('\n').at(-1)?.trim()
    setSlashOpen(lastLine === '/')
  }

  function insertSlashCommand(prefix: string) {
    if (!draft) return
    const lines = draft.content.split('\n')
    if (lines.at(-1)?.trim() === '/') lines[lines.length - 1] = prefix
    else lines.push(prefix)
    patchDraft({ content: lines.join('\n') })
    setSlashOpen(false)
    requestAnimationFrame(() => editorRef.current?.focus())
  }

  function addTag() {
    const tag = tagInput.trim().replace(/^#/, '')
    if (!draft || !tag || draft.tags.includes(tag)) {
      setTagInput('')
      return
    }
    patchDraft({ tags: [...draft.tags, tag].slice(0, 10) })
    setTagInput('')
  }

  function confirmDelete() {
    if (!removeTarget) return
    deleteNote(removeTarget.id)
    addToast('Sayfa silindi.', 'info')
    setRemoveTarget(null)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/6 bg-[#0a0a0e] shadow-2xl">
      <div className="grid min-h-[680px] lg:h-[calc(100vh-13rem)] lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex min-h-[220px] flex-col border-b border-white/6 bg-[#0d0d12] lg:min-h-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                <PanelLeft className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-300">Çalışma Alanım</p>
                <p className="text-[9px] text-zinc-600">{notes.length} sayfa</p>
              </div>
            </div>
            <button onClick={createPage} title="Yeni sayfa" className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-700" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Sayfalarda ara..."
                className="w-full rounded-lg border border-white/5 bg-white/[0.025] py-2 pl-8 pr-3 text-xs text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-indigo-500/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {sortedNotes.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <FileText className="mx-auto mb-2 h-5 w-5 text-zinc-800" />
                <p className="text-[11px] text-zinc-600">{notes.length ? 'Sonuç bulunamadı' : 'Henüz sayfa yok'}</p>
              </div>
            ) : (
              <>
                {sortedNotes.some((note) => note.pinned) && (
                  <p className="mb-1 mt-3 px-2 text-[9px] font-semibold uppercase tracking-widest text-zinc-700">
                    Favoriler
                  </p>
                )}
                {sortedNotes.map((note, index) => {
                  const showPrivateLabel =
                    !note.pinned && (index === 0 || sortedNotes[index - 1]?.pinned)
                  return (
                    <div key={note.id}>
                      {showPrivateLabel && (
                        <p className="mb-1 mt-4 px-2 text-[9px] font-semibold uppercase tracking-widest text-zinc-700">
                          Özel
                        </p>
                      )}
                      <button
                        onClick={() => setSelectedId(note.id)}
                        className={`group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition ${
                          selectedId === note.id
                            ? 'bg-white/[0.065] text-zinc-100'
                            : 'text-zinc-500 hover:bg-white/[0.035] hover:text-zinc-300'
                        }`}
                      >
                        <span className="text-sm">{note.icon}</span>
                        <span className="min-w-0 flex-1 truncate text-xs font-medium">{note.title || 'Başlıksız'}</span>
                        {note.pinned && <Pin className="h-2.5 w-2.5 shrink-0 text-indigo-500" />}
                        <ChevronRight className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-50" />
                      </button>
                    </div>
                  )
                })}
              </>
            )}
          </div>

          <button onClick={createPage} className="m-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-600 transition hover:bg-white/4 hover:text-zinc-300">
            <Plus className="h-3.5 w-3.5" /> Yeni sayfa
          </button>
        </aside>

        <main className="min-w-0 overflow-y-auto bg-[#0a0a0e]">
          {!selected || !draft ? (
            <EmptyWorkspace onCreate={createPage} />
          ) : (
            <div className="min-h-full">
              <div className={`relative h-28 transition-all sm:h-36 ${coverStyles[draft.cover] || 'bg-white/[0.015]'}`}>
                <div className="absolute right-4 top-3 flex items-center gap-2">
                  <div className="group relative">
                    <button className="rounded-lg bg-black/20 px-2.5 py-1.5 text-[10px] text-zinc-500 opacity-0 backdrop-blur transition hover:text-zinc-200 group-hover:opacity-100">
                      Kapak
                    </button>
                    <div className="invisible absolute right-0 top-8 z-20 flex w-48 flex-wrap gap-2 rounded-xl border border-white/10 bg-surface-1/95 p-3 opacity-0 shadow-xl backdrop-blur transition group-hover:visible group-hover:opacity-100">
                      {(Object.keys(coverStyles) as NoteCover[]).map((cover) => (
                        <button
                          key={cover}
                          onClick={() => patchDraft({ cover })}
                          title={cover}
                          className={`h-8 w-12 rounded-md border border-white/10 ${coverStyles[cover] || 'bg-zinc-900'} ${draft.cover === cover ? 'ring-2 ring-indigo-400' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mx-auto max-w-4xl px-6 pb-24 sm:px-12">
                <div className="relative -mt-10 mb-3 w-fit">
                  <button
                    onClick={() => setEmojiOpen((open) => !open)}
                    className="flex h-20 w-20 items-center justify-center rounded-2xl text-5xl transition hover:bg-white/5"
                    title="Sayfa ikonunu değiştir"
                  >
                    {draft.icon}
                  </button>
                  {emojiOpen && (
                    <div className="absolute left-0 top-20 z-30 grid w-56 grid-cols-6 gap-1 rounded-xl border border-white/10 bg-surface-1/95 p-2 shadow-2xl backdrop-blur">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            patchDraft({ icon: emoji })
                            setEmojiOpen(false)
                          }}
                          className="rounded-lg p-2 text-xl hover:bg-white/5"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-3 flex items-center justify-between gap-3 text-[10px] text-zinc-700">
                  <div className="flex items-center gap-1.5">
                    <span>Notlar</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="max-w-48 truncate text-zinc-600">{draft.title || 'Başlıksız'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="mr-2 flex items-center gap-1 text-zinc-600">
                      {saveStatus === 'saving' ? (
                        'Kaydediliyor...'
                      ) : (
                        <><Check className="h-3 w-3 text-emerald-500" /> Kaydedildi</>
                      )}
                    </span>
                    <button
                      onClick={() => togglePin(selected.id)}
                      title={selected.pinned ? 'Favorilerden kaldır' : 'Favorilere ekle'}
                      className={`rounded-lg p-2 hover:bg-white/5 ${selected.pinned ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-300'}`}
                    >
                      <Pin className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setRemoveTarget(selected)}
                      title="Sayfayı sil"
                      className="rounded-lg p-2 text-zinc-600 hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-2 text-zinc-600 hover:bg-white/5 hover:text-zinc-300">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <input
                  value={draft.title}
                  onChange={(event) => patchDraft({ title: event.target.value })}
                  placeholder="Başlıksız"
                  className="mb-4 w-full border-0 bg-transparent text-4xl font-bold tracking-tight text-zinc-100 outline-none placeholder:text-zinc-800 sm:text-5xl"
                />

                <div className="mb-5 flex flex-wrap items-center gap-2">
                  {draft.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => patchDraft({ tags: draft.tags.filter((item) => item !== tag) })}
                      title="Etiketi kaldır"
                      className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] text-indigo-300 hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      #{tag}
                    </button>
                  ))}
                  <div className="flex items-center gap-1 text-zinc-700">
                    <Tag className="h-3 w-3" />
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
                      className="w-24 bg-transparent text-[10px] text-zinc-400 outline-none placeholder:text-zinc-700"
                    />
                  </div>
                  <div className="ml-auto flex gap-1.5">
                    {(Object.keys(colorDots) as NoteColor[]).map((color) => (
                      <button
                        key={color}
                        onClick={() => patchDraft({ color })}
                        className={`h-3 w-3 rounded-full ${colorDots[color]} ${
                          draft.color === color ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-[#0a0a0e]' : 'opacity-35 hover:opacity-80'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    ref={editorRef}
                    value={draft.content}
                    onChange={(event) => handleContent(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') setSlashOpen(false)
                    }}
                    placeholder="Yazmaya başlayın veya komutlar için '/' yazın..."
                    className="min-h-[380px] w-full resize-none border-0 bg-transparent text-[15px] leading-7 text-zinc-300 outline-none placeholder:text-zinc-700"
                  />
                  {slashOpen && (
                    <div className="absolute left-0 top-8 z-30 w-72 overflow-hidden rounded-xl border border-white/10 bg-surface-1/98 p-1.5 shadow-2xl backdrop-blur-xl">
                      <p className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-widest text-zinc-700">Temel bloklar</p>
                      {slashCommands.map((command) => (
                        <button
                          key={command.label}
                          onClick={() => insertSlashCommand(command.prefix)}
                          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/5"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/6 bg-white/3 text-zinc-500">
                            <command.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-zinc-200">{command.label}</p>
                            <p className="text-[10px] text-zinc-600">{command.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <ConfirmDialog
        open={removeTarget != null}
        title="Sayfayı sil?"
        message={removeTarget ? `“${removeTarget.title}” sayfası kalıcı olarak silinecek.` : ''}
        confirmLabel="Evet, Sil"
        cancelLabel="Vazgeç"
        onConfirm={confirmDelete}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  )
}

function EmptyWorkspace({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-[680px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/6 bg-white/3 text-3xl">📝</div>
      <h2 className="mb-2 text-xl font-semibold text-zinc-200">İlk sayfanızı oluşturun</h2>
      <p className="mb-6 max-w-sm text-sm leading-6 text-zinc-600">
        Fikirlerinizi, planlarınızı ve önemli bilgileri sade bir çalışma alanında tutun.
      </p>
      <button onClick={onCreate} className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20">
        <Plus className="h-4 w-4" /> Yeni sayfa
      </button>
    </div>
  )
}
