export type Page = 'pinboard' | 'board'

export type BoardView = 'kanban' | 'plan'

export type CardFont = 'sans' | 'hand' | 'serif'

export type ColumnId = 'backlog' | 'progress' | 'review' | 'done'

export interface Column {
  id: ColumnId
  title: string
  accent: string
}

export interface Person {
  id: string
  name: string
  color: string
  initials: string
}

export interface Task {
  id: string
  title: string
  description: string
  assigneeId: string | null
  start: string | null // ISO date (yyyy-mm-dd)
  end: string | null // ISO date (yyyy-mm-dd)
  category: string
  hashtags: string[]
  page: Page
  columnId: ColumnId
  order: number
  x: number
  y: number
  rotation: number
  color: string
  createdAt: number
  updatedAt: number
}

export type TaskDraft = Omit<
  Task,
  'id' | 'createdAt' | 'updatedAt' | 'x' | 'y' | 'rotation' | 'page' | 'columnId' | 'order'
>
