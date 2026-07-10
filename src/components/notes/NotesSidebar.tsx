import { useMemo, useState } from 'react'
import {
  Archive,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  FilePlus2,
  Pin,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { noteSearchText, useNotes } from '../../context/NotesContext'
import { todayIso, type Note } from '../../types/notes'

interface NotesSidebarProps {
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (note: Note) => void
}

export function NotesSidebar({ selectedId, onSelect, onDelete }: NotesSidebarProps) {
  const {
    notes,
    dailyNotes,
    addPage,
    openOrCreateDaily,
    getChildren,
  } = useNotes()
  const [query, setQuery] = useState('')
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [showArchived, setShowArchived] = useState(false)

  const today = todayIso()
  const searchHits = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR')
    if (!q) return []
    return notes
      .filter((note) => !note.archived)
      .filter((note) => noteSearchText(note).toLocaleLowerCase('tr-TR').includes(q))
      .slice(0, 20)
  }, [notes, query])

  const favorites = notes.filter((note) => note.pinned && !note.archived)
  const archived = notes.filter((note) => note.archived)
  const rootPages = getChildren(null)

  const journalDates = useMemo(
    () => new Set(dailyNotes.map((note) => note.journalDate).filter(Boolean) as string[]),
    [dailyNotes],
  )

  const monthLabel = calendarMonth.toLocaleDateString('tr-TR', {
    month: 'long',
    year: 'numeric',
  })

  const calendarCells = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = (firstDay.getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: Array<{ iso: string | null; day: number | null }> = []
    for (let i = 0; i < startOffset; i++) cells.push({ iso: null, day: null })
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      cells.push({ iso, day })
    }
    return cells
  }, [calendarMonth])

  function createChild(parentId: string | null = null) {
    const id = addPage({
      title: 'Başlıksız',
      parentId,
      icon: '📄',
    })
    if (parentId) setExpanded((current) => ({ ...current, [parentId]: true }))
    onSelect(id)
  }

  function renderTree(parentId: string | null, depth = 0): React.ReactNode {
    return getChildren(parentId).map((note) => {
      const children = getChildren(note.id)
      const isOpen = expanded[note.id] ?? depth < 1
      return (
        <div key={note.id}>
          <div
            className={`group flex items-center gap-1 rounded-lg pr-1 ${
              selectedId === note.id ? 'bg-white/[0.07] text-zinc-100' : 'text-zinc-500 hover:bg-white/[0.04]'
            }`}
            style={{ paddingLeft: 8 + depth * 12 }}
          >
            <button
              type="button"
              onClick={() =>
                setExpanded((current) => ({ ...current, [note.id]: !isOpen }))
              }
              className={`rounded p-0.5 ${children.length ? 'text-zinc-600' : 'invisible'}`}
            >
              {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
            <button
              type="button"
              onClick={() => onSelect(note.id)}
              className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left"
            >
              <span className="text-sm">{note.icon}</span>
              <span className="truncate text-xs font-medium">{note.title}</span>
            </button>
            <button
              type="button"
              title="Alt sayfa ekle"
              onClick={() => createChild(note.id)}
              className="rounded p-1 opacity-0 hover:bg-white/5 group-hover:opacity-100"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          {isOpen && children.length > 0 && renderTree(note.id, depth + 1)}
        </div>
      )
    })
  }

  return (
    <aside className="flex min-h-0 flex-col border-b border-white/6 bg-[#0d0d12] lg:border-b-0 lg:border-r">
      <div className="space-y-3 border-b border-white/6 p-3">
        <button
          onClick={() => onSelect(openOrCreateDaily(today))}
          className="flex w-full items-center gap-2 rounded-xl bg-indigo-500/15 px-3 py-2.5 text-left text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/25"
        >
          <CalendarDays className="h-4 w-4" />
          Bugünün günlüğü
        </button>
        <button
          onClick={() => createChild(null)}
          className="flex w-full items-center gap-2 rounded-xl border border-white/6 bg-white/[0.03] px-3 py-2.5 text-left text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-zinc-200"
        >
          <FilePlus2 className="h-4 w-4" />
          Yeni sayfa
        </button>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-700" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Sayfa ve günlük ara..."
            className="w-full rounded-lg border border-white/5 bg-white/[0.025] py-2 pl-8 pr-3 text-xs text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-indigo-500/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {query.trim() ? (
          <div className="space-y-1">
            <p className="px-2 pb-1 text-[9px] font-semibold uppercase tracking-widest text-zinc-700">
              Arama sonuçları
            </p>
            {searchHits.length === 0 ? (
              <p className="px-2 py-4 text-xs text-zinc-600">Sonuç yok</p>
            ) : (
              searchHits.map((note) => (
                <button
                  key={note.id}
                  onClick={() => onSelect(note.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs ${
                    selectedId === note.id ? 'bg-white/[0.07] text-zinc-100' : 'text-zinc-500 hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{note.icon}</span>
                  <span className="truncate">{note.title}</span>
                  {note.kind === 'daily' && (
                    <span className="ml-auto text-[9px] text-zinc-700">günlük</span>
                  )}
                </button>
              ))
            )}
          </div>
        ) : (
          <>
            <section className="mb-4">
              <div className="mb-2 flex items-center justify-between px-2">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-700">
                  Günlük
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      setCalendarMonth(
                        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1),
                      )
                    }
                    className="rounded px-1.5 text-[10px] text-zinc-600 hover:bg-white/5"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setCalendarMonth(
                        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1),
                      )
                    }
                    className="rounded px-1.5 text-[10px] text-zinc-600 hover:bg-white/5"
                  >
                    ›
                  </button>
                </div>
              </div>
              <p className="mb-2 px-2 text-[11px] capitalize text-zinc-500">{monthLabel}</p>
              <div className="grid grid-cols-7 gap-1 px-1">
                {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map((day) => (
                  <span key={day} className="text-center text-[9px] text-zinc-700">
                    {day}
                  </span>
                ))}
                {calendarCells.map((cell, index) =>
                  cell.iso ? (
                    <button
                      key={cell.iso}
                      onClick={() => onSelect(openOrCreateDaily(cell.iso!))}
                      className={`rounded-md py-1.5 text-[10px] tabular-nums transition ${
                        cell.iso === today
                          ? 'bg-indigo-500 text-white'
                          : journalDates.has(cell.iso)
                            ? 'bg-indigo-500/15 text-indigo-300'
                            : 'text-zinc-500 hover:bg-white/5'
                      }`}
                    >
                      {cell.day}
                    </button>
                  ) : (
                    <span key={`empty-${index}`} />
                  ),
                )}
              </div>
            </section>

            {favorites.length > 0 && (
              <section className="mb-4">
                <p className="mb-1 px-2 text-[9px] font-semibold uppercase tracking-widest text-zinc-700">
                  Favoriler
                </p>
                {favorites.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => onSelect(note.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs ${
                      selectedId === note.id ? 'bg-white/[0.07] text-zinc-100' : 'text-zinc-500 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{note.icon}</span>
                    <span className="min-w-0 flex-1 truncate">{note.title}</span>
                    <Pin className="h-2.5 w-2.5 text-indigo-500" />
                  </button>
                ))}
              </section>
            )}

            <section className="mb-4">
              <div className="mb-1 flex items-center justify-between px-2">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-700">
                  Sayfalar
                </p>
                <button
                  onClick={() => createChild(null)}
                  className="rounded p-1 text-zinc-700 hover:bg-white/5 hover:text-zinc-300"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              {rootPages.length === 0 ? (
                <p className="px-2 py-3 text-xs text-zinc-700">Henüz sayfa yok</p>
              ) : (
                renderTree(null)
              )}
            </section>

            {dailyNotes.length > 0 && (
              <section className="mb-4">
                <p className="mb-1 px-2 text-[9px] font-semibold uppercase tracking-widest text-zinc-700">
                  Son günlükler
                </p>
                {dailyNotes.slice(0, 8).map((note) => (
                  <button
                    key={note.id}
                    onClick={() => onSelect(note.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs ${
                      selectedId === note.id ? 'bg-white/[0.07] text-zinc-100' : 'text-zinc-500 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>📅</span>
                    <span className="truncate">{note.journalDate}</span>
                  </button>
                ))}
              </section>
            )}

            {archived.length > 0 && (
              <section>
                <button
                  onClick={() => setShowArchived((value) => !value)}
                  className="mb-1 flex w-full items-center gap-2 px-2 text-[9px] font-semibold uppercase tracking-widest text-zinc-700"
                >
                  <Archive className="h-3 w-3" />
                  Arşiv ({archived.length})
                </button>
                {showArchived &&
                  archived.map((note) => (
                    <div key={note.id} className="group flex items-center gap-1">
                      <button
                        onClick={() => onSelect(note.id)}
                        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-zinc-600 hover:bg-white/[0.04]"
                      >
                        <span>{note.icon}</span>
                        <span className="truncate">{note.title}</span>
                      </button>
                      <button
                        onClick={() => onDelete(note)}
                        className="rounded p-1 opacity-0 hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
              </section>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
