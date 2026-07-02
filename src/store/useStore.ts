import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Board, BoardView, CardFont, CardFontSize, ColumnId, Page, Person, Task, TaskDraft } from '../types'
import { BOARD_COLORS, CARD_COLORS, PERSON_COLORS, initialsOf, randomPick } from '../lib/constants'

interface StoreState {
  tasks: Task[]
  people: Person[]
  boards: Board[]
  activeBoardId: string
  currentPage: Page
  boardView: BoardView
  cardFont: CardFont
  cardFontSize: CardFontSize
  peopleManagerOpen: boolean
  boardsManagerOpen: boolean
  settingsOpen: boolean
  activeTaskId: string | null

  setCurrentPage: (page: Page) => void
  setBoardView: (view: BoardView) => void
  setCardFont: (font: CardFont) => void
  setCardFontSize: (size: CardFontSize) => void
  openPeopleManager: () => void
  closePeopleManager: () => void
  openBoardsManager: () => void
  closeBoardsManager: () => void
  openSettings: () => void
  closeSettings: () => void
  setActiveTaskId: (id: string | null) => void

  addTask: (draft: TaskDraft, position?: { x: number; y: number }) => Task
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTaskToColumn: (id: string, boardId: string, columnId: ColumnId, targetIndex?: number) => void
  reorderColumn: (boardId: string, columnId: ColumnId, orderedIds: string[]) => void
  setTaskPosition: (id: string, x: number, y: number) => void
  sendTaskToPage: (id: string, page: Page, position?: { x: number; y: number }) => void
  moveTaskToBoard: (id: string, boardId: string) => void

  addPerson: (name: string) => Person
  updatePerson: (id: string, patch: Partial<Person>) => void
  deletePerson: (id: string) => void

  setActiveBoardId: (id: string) => void
  addBoard: (name: string) => Board
  updateBoard: (id: string, patch: Partial<Board>) => void
  deleteBoard: (id: string) => void

  exportData: () => string
  importData: (json: string) => { ok: true } | { ok: false; error: string }
  resetData: () => void
}

export const BACKUP_VERSION = 2

interface BackupPayload {
  version: number
  exportedAt: number
  tasks: Task[]
  people: Person[]
  boards: Board[]
  activeBoardId: string
  cardFont: CardFont
  cardFontSize: CardFontSize
}

const seedPeople: Person[] = [
  { id: nanoid(), name: 'Jürgen Kriszio', color: '#8b5cf6', initials: 'JK' },
  { id: nanoid(), name: 'Anna Weber', color: '#22d3ee', initials: 'AW' },
]

const seedBoards: Board[] = [
  { id: nanoid(), name: 'Arbeit', color: BOARD_COLORS[0] },
  { id: nanoid(), name: 'Privat', color: BOARD_COLORS[1] },
]

const now = () => Date.now()

function seedTasks(people: Person[]): Task[] {
  const t = now()
  return [
    {
      id: nanoid(),
      title: 'Willkommen bei Taskwall 👋',
      description:
        'Ziehe Karten frei auf der Pinnwand. Ziehe eine Karte auf eine der Laschen am rechten Bildrand, um sie in ein Board zu schicken.',
      assigneeId: people[0]?.id ?? null,
      start: null,
      end: null,
      category: 'Idee',
      hashtags: ['start', 'willkommen'],
      page: 'pinboard',
      boardId: null,
      columnId: 'backlog',
      order: 0,
      x: 60,
      y: 90,
      rotation: -2,
      color: '#facc15',
      createdAt: t,
      updatedAt: t,
    },
    {
      id: nanoid(),
      title: 'Projektplan erstellen',
      description: 'Grobe Phasen und Meilensteine für das nächste Quartal definieren.',
      assigneeId: people[1]?.id ?? null,
      start: null,
      end: null,
      category: 'Projekt',
      hashtags: ['planung'],
      page: 'pinboard',
      boardId: null,
      columnId: 'backlog',
      order: 1,
      x: 420,
      y: 160,
      rotation: 3,
      color: '#93c5fd',
      createdAt: t,
      updatedAt: t,
    },
  ]
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      tasks: seedTasks(seedPeople),
      people: seedPeople,
      boards: seedBoards,
      activeBoardId: seedBoards[0].id,
      currentPage: 'pinboard',
      boardView: 'kanban',
      cardFont: 'sans',
      cardFontSize: 'md',
      peopleManagerOpen: false,
      boardsManagerOpen: false,
      settingsOpen: false,
      activeTaskId: null,

      setCurrentPage: (page) => set({ currentPage: page }),
      setBoardView: (view) => set({ boardView: view }),
      setCardFont: (font) => set({ cardFont: font }),
      setCardFontSize: (size) => set({ cardFontSize: size }),
      openPeopleManager: () => set({ peopleManagerOpen: true }),
      closePeopleManager: () => set({ peopleManagerOpen: false }),
      openBoardsManager: () => set({ boardsManagerOpen: true }),
      closeBoardsManager: () => set({ boardsManagerOpen: false }),
      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),
      setActiveTaskId: (id) => set({ activeTaskId: id }),

      addTask: (draft, position) => {
        const t = now()
        const task: Task = {
          ...draft,
          id: nanoid(),
          page: 'pinboard',
          boardId: null,
          columnId: 'backlog',
          order: get().tasks.filter((x) => x.columnId === 'backlog' && x.page === 'pinboard').length,
          x: position?.x ?? 80 + Math.random() * 160,
          y: position?.y ?? 80 + Math.random() * 160,
          rotation: Math.random() * 6 - 3,
          color: draft.color || randomPick(CARD_COLORS),
          createdAt: t,
          updatedAt: t,
        }
        set({ tasks: [...get().tasks, task] })
        return task
      },

      updateTask: (id, patch) =>
        set({
          tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now() } : t)),
        }),

      deleteTask: (id) => set({ tasks: get().tasks.filter((t) => t.id !== id) }),

      moveTaskToColumn: (id, boardId, columnId, targetIndex) => {
        const tasks = get().tasks
        const columnTasks = tasks.filter((t) => t.columnId === columnId && t.boardId === boardId && t.id !== id)
        const insertAt = targetIndex ?? columnTasks.length
        columnTasks.splice(insertAt, 0, tasks.find((t) => t.id === id) as Task)
        const orderMap = new Map(columnTasks.map((t, idx) => [t.id, idx]))
        set({
          tasks: tasks.map((t) => {
            if (t.id === id) {
              return { ...t, columnId, boardId, page: 'board', order: orderMap.get(id) ?? 0, updatedAt: now() }
            }
            if (orderMap.has(t.id)) {
              return { ...t, order: orderMap.get(t.id) as number }
            }
            return t
          }),
        })
      },

      reorderColumn: (boardId, columnId, orderedIds) => {
        const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]))
        set({
          tasks: get().tasks.map((t) =>
            t.boardId === boardId && t.columnId === columnId && orderMap.has(t.id)
              ? { ...t, order: orderMap.get(t.id) as number }
              : t,
          ),
        })
      },

      setTaskPosition: (id, x, y) =>
        set({
          tasks: get().tasks.map((t) => (t.id === id ? { ...t, x, y, updatedAt: now() } : t)),
        }),

      sendTaskToPage: (id, page, position) => {
        const tasks = get().tasks
        set({
          tasks: tasks.map((t) =>
            t.id === id
              ? { ...t, page, x: position?.x ?? t.x, y: position?.y ?? t.y, updatedAt: now() }
              : t,
          ),
        })
      },

      moveTaskToBoard: (id, boardId) => {
        const tasks = get().tasks
        const task = tasks.find((t) => t.id === id)
        if (!task) return
        const columnId = task.columnId
        const order = tasks.filter((t) => t.boardId === boardId && t.columnId === columnId && t.id !== id).length
        set({
          tasks: tasks.map((t) => (t.id === id ? { ...t, page: 'board', boardId, order, updatedAt: now() } : t)),
        })
      },

      addPerson: (name) => {
        const person: Person = {
          id: nanoid(),
          name,
          color: randomPick(PERSON_COLORS),
          initials: initialsOf(name),
        }
        set({ people: [...get().people, person] })
        return person
      },

      updatePerson: (id, patch) =>
        set({
          people: get().people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }),

      deletePerson: (id) =>
        set({
          people: get().people.filter((p) => p.id !== id),
          tasks: get().tasks.map((t) => (t.assigneeId === id ? { ...t, assigneeId: null } : t)),
        }),

      setActiveBoardId: (id) => set({ activeBoardId: id }),

      addBoard: (name) => {
        const board: Board = { id: nanoid(), name, color: randomPick(BOARD_COLORS) }
        set({ boards: [...get().boards, board] })
        return board
      },

      updateBoard: (id, patch) =>
        set({
          boards: get().boards.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        }),

      deleteBoard: (id) => {
        const { boards, tasks, activeBoardId } = get()
        if (boards.length <= 1) return
        const remaining = boards.filter((b) => b.id !== id)
        const reassigned = tasks.map((t) =>
          t.boardId === id
            ? {
                ...t,
                page: 'pinboard' as Page,
                boardId: null,
                x: 80 + Math.random() * 400,
                y: 80 + Math.random() * 300,
                updatedAt: now(),
              }
            : t,
        )
        set({
          boards: remaining,
          tasks: reassigned,
          activeBoardId: activeBoardId === id ? remaining[0].id : activeBoardId,
        })
      },

      exportData: () => {
        const payload: BackupPayload = {
          version: BACKUP_VERSION,
          exportedAt: now(),
          tasks: get().tasks,
          people: get().people,
          boards: get().boards,
          activeBoardId: get().activeBoardId,
          cardFont: get().cardFont,
          cardFontSize: get().cardFontSize,
        }
        return JSON.stringify(payload, null, 2)
      },

      importData: (json) => {
        let parsed: unknown
        try {
          parsed = JSON.parse(json)
        } catch {
          return { ok: false, error: 'Die Datei enthält kein gültiges JSON.' }
        }
        if (
          !parsed ||
          typeof parsed !== 'object' ||
          !Array.isArray((parsed as BackupPayload).tasks) ||
          !Array.isArray((parsed as BackupPayload).people)
        ) {
          return { ok: false, error: 'Die Datei hat nicht das erwartete Taskwall-Backup-Format.' }
        }
        const payload = parsed as Partial<BackupPayload> & { tasks: Task[]; people: Person[] }
        let tasks = payload.tasks
        let boards = Array.isArray(payload.boards) && payload.boards.length > 0 ? payload.boards : null

        if (!boards) {
          // Legacy backup (before multi-board support): route any board tasks into one new board.
          const fallbackBoard: Board = { id: nanoid(), name: 'Team Board', color: BOARD_COLORS[0] }
          boards = [fallbackBoard]
          tasks = tasks.map((t) => (t.page === 'board' ? { ...t, boardId: fallbackBoard.id } : { ...t, boardId: null }))
        } else {
          const validIds = new Set(boards.map((b) => b.id))
          const fallbackId = boards[0].id
          tasks = tasks.map((t) =>
            t.page === 'board' && (!t.boardId || !validIds.has(t.boardId)) ? { ...t, boardId: fallbackId } : t,
          )
        }

        const activeBoardId =
          payload.activeBoardId && boards.some((b) => b.id === payload.activeBoardId)
            ? payload.activeBoardId
            : boards[0].id

        set({
          tasks,
          people: payload.people,
          boards,
          activeBoardId,
          cardFont: payload.cardFont ?? get().cardFont,
          cardFontSize: payload.cardFontSize ?? get().cardFontSize,
          currentPage: 'pinboard',
          activeTaskId: null,
        })
        return { ok: true }
      },

      resetData: () => {
        const people = seedPeople.map((p) => ({ ...p, id: nanoid() }))
        const boards = seedBoards.map((b) => ({ ...b, id: nanoid() }))
        set({
          tasks: seedTasks(people),
          people,
          boards,
          activeBoardId: boards[0].id,
          currentPage: 'pinboard',
          boardView: 'kanban',
          activeTaskId: null,
        })
      },
    }),
    { name: 'taskwall-storage' },
  ),
)
