import { useEffect, useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { NotesSidebar } from '../components/notes/NotesSidebar'
import { NotePageView } from '../components/notes/NotePageView'
import { useNotes } from '../context/NotesContext'
import { useUI } from '../context/UIContext'
import { todayIso, type Note } from '../types/notes'

export function NotesPage() {
  const { notes, addPage, openOrCreateDaily, deleteNote } = useNotes()
  const { addToast } = useUI()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Note | null>(null)

  const selected = notes.find((note) => note.id === selectedId) ?? null
  const activeNotes = notes.filter((note) => !note.archived)

  useEffect(() => {
    if (selectedId && notes.some((note) => note.id === selectedId)) return
    if (activeNotes[0]) {
      setSelectedId(activeNotes[0].id)
      return
    }
    setSelectedId(null)
  }, [notes, selectedId, activeNotes])

  function createFirstPage() {
    const id = addPage({ title: 'İlk sayfam', icon: '📝', cover: 'aurora' })
    setSelectedId(id)
    addToast('İlk sayfa oluşturuldu.')
  }

  function openToday() {
    const id = openOrCreateDaily(todayIso())
    setSelectedId(id)
  }

  function confirmDelete() {
    if (!removeTarget) return
    deleteNote(removeTarget.id)
    addToast('Sayfa silindi.', 'info')
    setRemoveTarget(null)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/6 bg-[#0a0a0e] shadow-2xl">
      <div className="grid min-h-[620px] lg:h-[calc(100vh-13rem)] lg:min-h-[720px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <NotesSidebar
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDelete={setRemoveTarget}
        />

        <main className="min-w-0 overflow-x-hidden overflow-y-auto bg-[#0a0a0e]">
          {!selected ? (
            <div className="flex min-h-[620px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/6 bg-white/3">
                <FileText className="h-7 w-7 text-indigo-400" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-zinc-200">Not çalışma alanın hazır</h2>
              <p className="mb-6 max-w-md text-sm leading-6 text-zinc-600">
                Günlük tut, sayfalar oluştur, alt sayfalar ekle ve bloklarla yaz.
                Notion tarzı bir defter gibi kullanabilirsin.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={openToday}
                  className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20"
                >
                  Bugünün günlüğünü aç
                </button>
                <button
                  onClick={createFirstPage}
                  className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-sm text-zinc-300"
                >
                  <Plus className="h-4 w-4" /> Yeni sayfa
                </button>
              </div>
            </div>
          ) : (
            <NotePageView
              note={selected}
              onDelete={() => setRemoveTarget(selected)}
              onNavigate={setSelectedId}
            />
          )}
        </main>
      </div>

      <ConfirmDialog
        open={removeTarget != null}
        title="Sayfayı sil?"
        message={
          removeTarget
            ? `“${removeTarget.title}” ve varsa alt sayfaları kalıcı olarak silinecek.`
            : ''
        }
        confirmLabel="Evet, Sil"
        cancelLabel="Vazgeç"
        onConfirm={confirmDelete}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  )
}
