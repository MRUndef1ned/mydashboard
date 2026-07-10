export type NoteColor = 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'zinc'

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  color: NoteColor
  pinned: boolean
  createdAt: number
  updatedAt: number
}

export type NoteDraft = Pick<Note, 'title' | 'content' | 'tags' | 'color'>
