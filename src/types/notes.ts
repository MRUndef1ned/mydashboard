export type NoteColor = 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'zinc'
export type NoteCover = 'none' | 'midnight' | 'aurora' | 'ocean' | 'sunset' | 'forest'

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  color: NoteColor
  icon: string
  cover: NoteCover
  pinned: boolean
  createdAt: number
  updatedAt: number
}

export type NoteDraft = Pick<Note, 'title' | 'content' | 'tags' | 'color' | 'icon' | 'cover'>
