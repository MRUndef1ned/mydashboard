import { useEffect, useRef, useState } from 'react'
import {
  Code2,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Plus,
  Quote,
  Type,
} from 'lucide-react'
import { createBlock, type BlockType, type NoteBlock } from '../../types/notes'

const slashItems: Array<{
  type: BlockType
  label: string
  description: string
  icon: typeof Type
  keywords: string
}> = [
  { type: 'paragraph', label: 'Metin', description: 'Düz paragraf', icon: Type, keywords: 'text metin p' },
  { type: 'heading1', label: 'Başlık 1', description: 'Büyük başlık', icon: Heading1, keywords: 'h1 başlık' },
  { type: 'heading2', label: 'Başlık 2', description: 'Orta başlık', icon: Heading2, keywords: 'h2' },
  { type: 'heading3', label: 'Başlık 3', description: 'Küçük başlık', icon: Heading3, keywords: 'h3' },
  { type: 'bullet', label: 'Madde listesi', description: 'İşaretsiz liste', icon: List, keywords: 'bullet liste' },
  { type: 'numbered', label: 'Numaralı liste', description: 'Sıralı liste', icon: ListOrdered, keywords: 'numbered ol' },
  { type: 'todo', label: 'Yapılacak', description: 'Kontrol listesi', icon: ListChecks, keywords: 'todo checkbox görev' },
  { type: 'quote', label: 'Alıntı', description: 'Vurgulu alıntı', icon: Quote, keywords: 'quote alıntı' },
  { type: 'code', label: 'Kod', description: 'Kod bloğu', icon: Code2, keywords: 'code kod' },
  { type: 'divider', label: 'Ayırıcı', description: 'Görsel çizgi', icon: Minus, keywords: 'divider ayırıcı' },
]

interface BlockEditorProps {
  blocks: NoteBlock[]
  onChange: (blocks: NoteBlock[]) => void
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [focusId, setFocusId] = useState<string | null>(null)
  const [slash, setSlash] = useState<{ blockId: string; query: string; index: number } | null>(null)
  const inputRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  useEffect(() => {
    if (!focusId) return
    const node = inputRefs.current[focusId]
    if (!node) return
    node.focus()
    const length = node.value.length
    node.setSelectionRange(length, length)
    setFocusId(null)
  }, [focusId, blocks])

  function commit(next: NoteBlock[]) {
    onChange(next.length > 0 ? next : [createBlock()])
  }

  function updateBlock(id: string, patch: Partial<NoteBlock>) {
    commit(blocks.map((block) => (block.id === id ? { ...block, ...patch } : block)))
  }

  function insertAfter(id: string, type: BlockType = 'paragraph', text = '') {
    const index = blocks.findIndex((block) => block.id === id)
    const nextBlock = createBlock(type, text)
    const next = [...blocks]
    next.splice(index + 1, 0, nextBlock)
    commit(next)
    setFocusId(nextBlock.id)
  }

  function removeBlock(id: string) {
    const index = blocks.findIndex((block) => block.id === id)
    if (blocks.length === 1) {
      commit([createBlock()])
      setFocusId(blocks[0]?.id ?? null)
      return
    }
    const next = blocks.filter((block) => block.id !== id)
    commit(next)
    setFocusId(next[Math.max(0, index - 1)]?.id ?? null)
  }

  function convertBlock(id: string, type: BlockType) {
    const block = blocks.find((item) => item.id === id)
    if (!block) return
    if (type === 'divider') {
      updateBlock(id, { type, text: '' })
      insertAfter(id)
      setSlash(null)
      return
    }
    updateBlock(id, {
      type,
      text: block.text.replace(/^\//, ''),
      checked: type === 'todo' ? Boolean(block.checked) : undefined,
    })
    setSlash(null)
    setFocusId(id)
  }

  function handleTextChange(block: NoteBlock, value: string) {
    updateBlock(block.id, { text: value })
    if (value.startsWith('/')) {
      setSlash({ blockId: block.id, query: value.slice(1).toLocaleLowerCase('tr-TR'), index: 0 })
    } else {
      setSlash((current) => (current?.blockId === block.id ? null : current))
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>, block: NoteBlock) {
    const filtered = slashItems.filter((item) =>
      `${item.label} ${item.keywords}`.toLocaleLowerCase('tr-TR').includes(slash?.query ?? ''),
    )

    if (slash && slash.blockId === block.id) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSlash({ ...slash, index: Math.min(slash.index + 1, filtered.length - 1) })
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSlash({ ...slash, index: Math.max(slash.index - 1, 0) })
        return
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        const selected = filtered[slash.index]
        if (selected) convertBlock(block.id, selected.type)
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        setSlash(null)
        return
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (block.type === 'todo' || block.type === 'bullet' || block.type === 'numbered') {
        if (!block.text.trim()) {
          updateBlock(block.id, { type: 'paragraph', text: '' })
          return
        }
        insertAfter(block.id, block.type)
        return
      }
      insertAfter(block.id)
      return
    }

    if (event.key === 'Backspace' && block.text === '') {
      event.preventDefault()
      if (block.type !== 'paragraph') {
        updateBlock(block.id, { type: 'paragraph' })
        return
      }
      removeBlock(block.id)
    }

    if (event.key === '/' && block.text === '') {
      setSlash({ blockId: block.id, query: '', index: 0 })
    }
  }

  function autoSize(node: HTMLTextAreaElement | null) {
    if (!node) return
    node.style.height = '0px'
    node.style.height = `${Math.max(node.scrollHeight, 28)}px`
  }

  return (
    <div className="space-y-1">
      {blocks.map((block, index) => {
        const filtered =
          slash?.blockId === block.id
            ? slashItems.filter((item) =>
                `${item.label} ${item.keywords}`
                  .toLocaleLowerCase('tr-TR')
                  .includes(slash.query),
              )
            : []

        return (
          <div key={block.id} className="group relative">
            <div className="absolute -left-10 top-1.5 hidden items-center gap-0.5 opacity-0 transition group-hover:opacity-100 sm:flex">
              <button
                type="button"
                onClick={() => insertAfter(block.id)}
                className="rounded p-0.5 text-zinc-700 hover:bg-white/5 hover:text-zinc-300"
                title="Altına blok ekle"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <span className="cursor-grab rounded p-0.5 text-zinc-800">
                <GripVertical className="h-3.5 w-3.5" />
              </span>
            </div>

            {block.type === 'divider' ? (
              <button
                type="button"
                onClick={() => setFocusId(block.id)}
                className="flex w-full items-center py-3"
              >
                <div className="h-px w-full bg-white/10" />
              </button>
            ) : (
              <div className="flex items-start gap-2">
                {block.type === 'todo' && (
                  <button
                    type="button"
                    onClick={() => updateBlock(block.id, { checked: !block.checked })}
                    className={`mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      block.checked
                        ? 'border-indigo-400 bg-indigo-500 text-white'
                        : 'border-white/20'
                    }`}
                  >
                    {block.checked && <span className="text-[10px] leading-none">✓</span>}
                  </button>
                )}
                {block.type === 'bullet' && (
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-500" />
                )}
                {block.type === 'numbered' && (
                  <span className="mt-1 w-5 shrink-0 text-sm tabular-nums text-zinc-500">
                    {blocks.slice(0, index + 1).filter((item) => item.type === 'numbered').length}.
                  </span>
                )}
                {block.type === 'quote' && (
                  <span className="mt-1 w-1 shrink-0 self-stretch rounded-full bg-indigo-500/50" />
                )}

                <textarea
                  ref={(node) => {
                    inputRefs.current[block.id] = node
                    autoSize(node)
                  }}
                  value={block.text}
                  rows={1}
                  placeholder={
                    index === 0 && !block.text
                      ? "Yazmaya başlayın veya '/' ile komut açın..."
                      : block.type === 'heading1'
                        ? 'Başlık'
                        : block.type === 'todo'
                          ? 'Yapılacak'
                          : ''
                  }
                  onChange={(event) => {
                    handleTextChange(block, event.target.value)
                    autoSize(event.currentTarget)
                  }}
                  onKeyDown={(event) => handleKeyDown(event, block)}
                  onFocus={() => {
                    if (!block.text.startsWith('/')) setSlash(null)
                  }}
                  className={`w-full resize-none border-0 bg-transparent outline-none placeholder:text-zinc-700 ${
                    block.type === 'heading1'
                      ? 'py-1 text-3xl font-bold text-zinc-50'
                      : block.type === 'heading2'
                        ? 'py-1 text-2xl font-semibold text-zinc-100'
                        : block.type === 'heading3'
                          ? 'py-1 text-xl font-semibold text-zinc-200'
                          : block.type === 'code'
                            ? 'rounded-lg bg-black/30 px-3 py-2 font-mono text-sm text-cyan-200'
                            : block.type === 'quote'
                              ? 'py-1 text-[15px] italic text-zinc-400'
                              : block.type === 'todo' && block.checked
                                ? 'py-1 text-[15px] text-zinc-500 line-through'
                                : 'py-1 text-[15px] leading-7 text-zinc-300'
                  }`}
                />
              </div>
            )}

            {slash?.blockId === block.id && filtered.length > 0 && (
              <div className="absolute left-0 top-full z-40 mt-1 w-72 overflow-hidden rounded-xl border border-white/10 bg-[#121218] p-1.5 shadow-2xl">
                <p className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
                  Bloklar
                </p>
                {filtered.map((item, itemIndex) => (
                  <button
                    key={item.type}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault()
                      convertBlock(block.id, item.type)
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left ${
                      itemIndex === slash.index ? 'bg-indigo-500/15' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/3 text-zinc-400">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-200">{item.label}</p>
                      <p className="text-[10px] text-zinc-600">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
