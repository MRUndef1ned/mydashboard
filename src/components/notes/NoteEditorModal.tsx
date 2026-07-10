import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Tag, X } from 'lucide-react'
import { useNotes } from '../../context/NotesContext'
import { useUI } from '../../context/UIContext'
import type { Note, NoteColor } from '../../types/notes'

const colors: Array<{ value: NoteColor; className: string; label: string }> = [
  { value: 'indigo', className: 'bg-indigo-400', label: 'İndigo' },
  { value: 'cyan', className: 'bg-cyan-400', label: 'Camgöbeği' },
  { value: 'emerald', className: 'bg-emerald-400', label: 'Yeşil' },
  { value: 'amber', className: 'bg-amber-400', label: 'Sarı' },
  { value: 'rose', className: 'bg-rose-400', label: 'Pembe' },
  { value: 'zinc', className: 'bg-zinc-400', label: 'Gri' },
]

export function NoteEditorModal({
  open,
  note,
  onClose,
}: {
  open: boolean
  note: Note | null
  onClose: () => void
}) {
  const { addNote, updateNote } = useNotes()
  const { addToast } = useUI()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [color, setColor] = useState<NoteColor>('indigo')
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setTitle(note?.title ?? '')
    setContent(note?.content ?? '')
    setTags(note?.tags.join(', ') ?? '')
    setColor(note?.color ?? 'indigo')
    setTimeout(() => titleRef.current?.focus(), 100)
  }, [open, note])

  function save(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() && !content.trim()) {
      addToast('Boş not kaydedilemez.', 'info')
      return
    }

    const draft = {
      title: title.trim() || 'Başlıksız Not',
      content: content.trim(),
      tags: [...new Set(tags.split(',').map((tag) => tag.trim()).filter(Boolean))].slice(0, 8),
      color,
    }
    if (note) {
      updateNote(note.id, draft)
      addToast('Not güncellendi.')
    } else {
      addNote(draft)
      addToast('Not kaydedildi.')
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="fixed left-1/2 top-[8%] z-50 w-full max-w-2xl -translate-x-1/2 px-4"
          >
            <form
              onSubmit={save}
              className="overflow-hidden rounded-2xl border border-white/10 bg-surface-1/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
                <div>
                  <h3 className="font-semibold text-white">{note ? 'Notu Düzenle' : 'Yeni Not'}</h3>
                  <p className="text-xs text-zinc-500">Fikirlerinizi, bağlantıları ve hatırlatmaları kaydedin.</p>
                </div>
                <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <input
                  ref={titleRef}
                  value={title}
                  maxLength={100}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Not başlığı"
                  className="w-full border-0 bg-transparent text-xl font-semibold text-white outline-none placeholder:text-zinc-700"
                />
                <textarea
                  value={content}
                  maxLength={5000}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Notunuzu buraya yazın..."
                  className="min-h-64 w-full resize-none rounded-xl border border-white/6 bg-white/3 p-4 text-sm leading-6 text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-indigo-500/30"
                />

                <div className="relative">
                  <Tag className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
                  <input
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="Etiketler — virgülle ayırın (iş, fikir, önemli)"
                    className="w-full rounded-xl border border-white/6 bg-white/3 py-2.5 pl-10 pr-4 text-sm text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-indigo-500/30"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="mr-1 text-xs text-zinc-500">Renk</span>
                    {colors.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        title={item.label}
                        onClick={() => setColor(item.value)}
                        className={`h-6 w-6 rounded-full ${item.className} transition ${
                          color === item.value ? 'scale-110 ring-2 ring-white/70 ring-offset-2 ring-offset-surface-1' : 'opacity-45 hover:opacity-80'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] tabular-nums text-zinc-700">{content.length}/5000</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-white/6 px-5 py-4">
                <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:bg-white/5">
                  Vazgeç
                </button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20">
                  {note ? 'Değişiklikleri Kaydet' : 'Notu Kaydet'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
