export type Page = 'pinboard' | 'today' | 'board'

export type AppView = 'pinboard' | 'today' | 'board' | 'analytics'

export type BoardView = 'kanban' | 'plan'

export type CardFont = 'sans' | 'hand' | 'serif'

export type CardFontSize = 'sm' | 'md' | 'lg'

export type ThemeId = 'blue' | 'teal' | 'purple' | 'navy'

export type ColumnId = 'backlog' | 'progress' | 'review' | 'done'

export type TaskStatus = 'none' | 'offen' | 'in-arbeit' | 'erledigt' | 'blockiert'

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

export interface Board {
  id: string
  name: string
  color: string
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
  today: boolean
  important: boolean
  status: TaskStatus
  archived: boolean
  archiveUnseen: boolean
  page: Page
  boardId: string | null
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
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'x'
  | 'y'
  | 'rotation'
  | 'page'
  | 'boardId'
  | 'columnId'
  | 'order'
  | 'archived'
  | 'archiveUnseen'
>
