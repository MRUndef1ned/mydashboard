export type NoteColor = 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'zinc'
export type NoteCover = 'none' | 'midnight' | 'aurora' | 'ocean' | 'sunset' | 'forest'
export type NoteKind = 'page' | 'daily'
export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bullet'
  | 'numbered'
  | 'todo'
  | 'quote'
  | 'code'
  | 'divider'

export interface NoteBlock {
  id: string
  type: BlockType
  text: string
  checked?: boolean
}

export interface Note {
  id: string
  title: string
  blocks: NoteBlock[]
  tags: string[]
  color: NoteColor
  icon: string
  cover: NoteCover
  kind: NoteKind
  parentId: string | null
  journalDate: string | null
  pinned: boolean
  archived: boolean
  createdAt: number
  updatedAt: number
  /** @deprecated migrated into blocks */
  content?: string
}

export type NoteDraft = Partial<
  Pick<
    Note,
    | 'title'
    | 'blocks'
    | 'tags'
    | 'color'
    | 'icon'
    | 'cover'
    | 'kind'
    | 'parentId'
    | 'journalDate'
    | 'pinned'
    | 'archived'
  >
>

export function createBlock(type: BlockType = 'paragraph', text = '', checked = false): NoteBlock {
  return {
    id: crypto.randomUUID(),
    type,
    text,
    ...(type === 'todo' ? { checked } : {}),
  }
}

export function emptyBlocks(): NoteBlock[] {
  return [createBlock('paragraph')]
}

export function blocksToPlainText(blocks: NoteBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === 'divider') return '---'
      if (block.type === 'todo') return `${block.checked ? '☑' : '☐'} ${block.text}`
      return block.text
    })
    .join('\n')
}

export function migrateContentToBlocks(content: string): NoteBlock[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  if (lines.length === 1 && !lines[0]) return emptyBlocks()

  return lines.map((line) => {
    if (line === '---' || line === '***') return createBlock('divider')
    if (line.startsWith('# ')) return createBlock('heading1', line.slice(2))
    if (line.startsWith('## ')) return createBlock('heading2', line.slice(3))
    if (line.startsWith('### ')) return createBlock('heading3', line.slice(4))
    if (line.startsWith('• ') || line.startsWith('- ')) return createBlock('bullet', line.slice(2))
    if (/^\d+\.\s/.test(line)) return createBlock('numbered', line.replace(/^\d+\.\s/, ''))
    if (line.startsWith('☐ ') || line.startsWith('[ ] ')) {
      return createBlock('todo', line.replace(/^☐\s|^\[ \]\s/, ''), false)
    }
    if (line.startsWith('☑ ') || line.startsWith('[x] ') || line.startsWith('[X] ')) {
      return createBlock('todo', line.replace(/^☑\s|^\[[xX]\]\s/, ''), true)
    }
    if (line.startsWith('❝ ') || line.startsWith('> ')) {
      return createBlock('quote', line.replace(/^❝\s|^>\s/, ''))
    }
    if (line.startsWith('```')) return createBlock('code', line.replace(/^```/, ''))
    return createBlock('paragraph', line)
  })
}

export function dailyJournalTemplate(dateLabel: string): NoteBlock[] {
  return [
    createBlock('heading2', `${dateLabel}`),
    createBlock('heading3', 'Bugün nasıl geçti?'),
    createBlock('paragraph', ''),
    createBlock('heading3', 'Öncelikler'),
    createBlock('todo', '', false),
    createBlock('todo', '', false),
    createBlock('todo', '', false),
    createBlock('heading3', 'Notlar'),
    createBlock('paragraph', ''),
    createBlock('heading3', 'Yarın için'),
    createBlock('bullet', ''),
  ]
}

export function formatJournalDate(isoDate: string) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function todayIso() {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}
