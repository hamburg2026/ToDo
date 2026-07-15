import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { AppView, Board, BoardView, CardFont, CardFontSize, Category, ColumnId, Page, Person, Task, TaskDraft, TaskStatus, ThemeId } from '../types'
import { BOARD_COLORS, CARD_COLORS, CATEGORY_COLOR_PALETTE, DEFAULT_CATEGORIES, PERSON_COLORS, clampZoom, initialsOf, randomPick } from '../lib/constants'

interface StoreState {
  tasks: Task[]
  people: Person[]
  boards: Board[]
  categories: Category[]
  activeBoardId: string
  currentPage: AppView
  boardView: BoardView
  cardFont: CardFont
  cardFontSize: CardFontSize
  theme: ThemeId
  pinboardZoom: number
  kanbanZoom: number
  peopleManagerOpen: boolean
  boardsManagerOpen: boolean
  categoriesManagerOpen: boolean
  settingsOpen: boolean
  archiveOpen: boolean
  activeTaskId: string | null
  // Remembers whether a task's "Details"/"Checkliste" sections are expanded,
  // keyed by task id. Both default open when a task has no entry here yet;
  // an entry only exists once the user has explicitly toggled a section.
  cardSectionState: Record<string, { details?: boolean; checklist?: boolean }>

  setCurrentPage: (page: AppView) => void
  setBoardView: (view: BoardView) => void
  setCardFont: (font: CardFont) => void
  setCardFontSize: (size: CardFontSize) => void
  setTheme: (theme: ThemeId) => void
  setPinboardZoom: (zoom: number) => void
  setKanbanZoom: (zoom: number) => void
  openPeopleManager: () => void
  closePeopleManager: () => void
  openBoardsManager: () => void
  closeBoardsManager: () => void
  openCategoriesManager: () => void
  closeCategoriesManager: () => void
  openSettings: () => void
  closeSettings: () => void
  openArchive: () => void
  closeArchive: () => void
  archiveCompleted: () => void
  markArchiveSeen: (id: string) => void
  markAllArchiveSeen: () => void
  setActiveTaskId: (id: string | null) => void

  addTask: (draft: TaskDraft, position?: { x: number; y: number }, page?: Page, boardId?: string | null) => Task
  updateTask: (id: string, patch: Partial<Task>) => void
  toggleChecklistItem: (taskId: string, itemId: string) => void
  setCardSectionOpen: (taskId: string, section: 'details' | 'checklist', open: boolean) => void
  deleteTask: (id: string) => void
  moveTaskToColumn: (id: string, boardId: string, columnId: ColumnId, targetIndex?: number) => void
  reorderColumn: (boardId: string, columnId: ColumnId, orderedIds: string[]) => void
  setTaskPosition: (id: string, x: number, y: number) => void
  sendTaskToPage: (id: string, page: Page, position?: { x: number; y: number }) => void
  moveTaskToBoard: (id: string, boardId: string) => void
  restoreFromArchive: (id: string, status: TaskStatus) => void

  addPerson: (name: string) => Person
  updatePerson: (id: string, patch: Partial<Person>) => void
  deletePerson: (id: string) => void

  setActiveBoardId: (id: string) => void
  addBoard: (name: string) => Board
  updateBoard: (id: string, patch: Partial<Board>) => void
  deleteBoard: (id: string) => void

  addCategory: (name: string, color?: string) => Category
  updateCategory: (id: string, patch: Partial<Category>) => void
  deleteCategory: (id: string) => void

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
  categories: Category[]
  activeBoardId: string
  cardFont: CardFont
  cardFontSize: CardFontSize
  theme: ThemeId
}

const seedPeople: Person[] = [
  { id: nanoid(), name: 'Jürgen Kriszio', color: '#8b5cf6', initials: 'JK' },
  { id: nanoid(), name: 'Anna Weber', color: '#22d3ee', initials: 'AW' },
]

const seedBoards: Board[] = [
  { id: nanoid(), name: 'Arbeit', color: BOARD_COLORS[0] },
  { id: nanoid(), name: 'Privat', color: BOARD_COLORS[1] },
]

const seedCategories: Category[] = DEFAULT_CATEGORIES.map((c) => ({ ...c, id: nanoid() }))

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
      checklist: [],
      today: false,
      important: false,
      status: 'none',
      archived: false,
      archiveUnseen: false,
      archivedAt: null,
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
      checklist: [
        { id: nanoid(), text: 'Ziele festlegen', done: true },
        { id: nanoid(), text: 'Meilensteine definieren', done: false },
        { id: nanoid(), text: 'Team informieren', done: false },
      ],
      today: true,
      important: true,
      status: 'in-arbeit',
      archived: false,
      archiveUnseen: false,
      archivedAt: null,
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
      categories: seedCategories,
      activeBoardId: seedBoards[0].id,
      currentPage: 'pinboard',
      boardView: 'kanban',
      cardFont: 'sans',
      cardFontSize: 'md',
      theme: 'blue',
      pinboardZoom: 1,
      kanbanZoom: 1,
      peopleManagerOpen: false,
      boardsManagerOpen: false,
      categoriesManagerOpen: false,
      settingsOpen: false,
      archiveOpen: false,
      activeTaskId: null,
      cardSectionState: {},

      setCurrentPage: (page) => set({ currentPage: page }),
      setBoardView: (view) => set({ boardView: view }),
      setCardFont: (font) => set({ cardFont: font }),
      setCardFontSize: (size) => set({ cardFontSize: size }),
      setTheme: (theme) => set({ theme }),
      setPinboardZoom: (zoom) => set({ pinboardZoom: clampZoom(zoom) }),
      setKanbanZoom: (zoom) => set({ kanbanZoom: clampZoom(zoom) }),
      openPeopleManager: () => set({ peopleManagerOpen: true }),
      closePeopleManager: () => set({ peopleManagerOpen: false }),
      openBoardsManager: () => set({ boardsManagerOpen: true }),
      closeBoardsManager: () => set({ boardsManagerOpen: false }),
      openCategoriesManager: () => set({ categoriesManagerOpen: true }),
      closeCategoriesManager: () => set({ categoriesManagerOpen: false }),
      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),
      openArchive: () => set({ archiveOpen: true }),
      closeArchive: () => set({ archiveOpen: false }),
      archiveCompleted: () =>
        set({
          tasks: get().tasks.map((t) =>
            t.status === 'erledigt' && !t.archived
              ? { ...t, archived: true, archiveUnseen: true, archivedAt: now(), updatedAt: now() }
              : t,
          ),
        }),
      markArchiveSeen: (id) =>
        set({
          tasks: get().tasks.map((t) => (t.id === id ? { ...t, archiveUnseen: false } : t)),
        }),
      markAllArchiveSeen: () =>
        set({
          tasks: get().tasks.map((t) => (t.archived ? { ...t, archiveUnseen: false } : t)),
        }),
      setActiveTaskId: (id) => set({ activeTaskId: id }),

      addTask: (draft, position, page = 'pinboard', boardId = null) => {
        const t = now()
        const resolvedBoardId = page === 'board' ? boardId : null
        const task: Task = {
          ...draft,
          id: nanoid(),
          archived: false,
          archiveUnseen: false,
          archivedAt: null,
          page,
          boardId: resolvedBoardId,
          columnId: 'backlog',
          order: get().tasks.filter((x) => x.columnId === 'backlog' && x.page === page && x.boardId === resolvedBoardId).length,
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

      toggleChecklistItem: (taskId, itemId) =>
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklist: t.checklist.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)),
                  updatedAt: now(),
                }
              : t,
          ),
        }),

      setCardSectionOpen: (taskId, section, open) =>
        set({
          cardSectionState: {
            ...get().cardSectionState,
            [taskId]: { ...get().cardSectionState[taskId], [section]: open },
          },
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
              ? {
                  ...t,
                  page,
                  boardId: page === 'pinboard' ? null : t.boardId,
                  today: page === 'pinboard' ? false : t.today,
                  x: position?.x ?? t.x,
                  y: position?.y ?? t.y,
                  updatedAt: now(),
                }
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

      restoreFromArchive: (id, status) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  archived: false,
                  archiveUnseen: false,
                  archivedAt: null,
                  page: 'pinboard',
                  boardId: null,
                  columnId: 'backlog',
                  x: 80 + Math.random() * 400,
                  y: 80 + Math.random() * 300,
                  updatedAt: now(),
                }
              : t,
          ),
          currentPage: 'pinboard',
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

      addCategory: (name, color) => {
        const category: Category = { id: nanoid(), name, color: color || randomPick(CATEGORY_COLOR_PALETTE) }
        set({ categories: [...get().categories, category] })
        return category
      },

      updateCategory: (id, patch) => {
        const previous = get().categories.find((c) => c.id === id)
        set({
          categories: get().categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
          tasks:
            previous && patch.name && patch.name !== previous.name
              ? get().tasks.map((t) => (t.category === previous.name ? { ...t, category: patch.name as string, updatedAt: now() } : t))
              : get().tasks,
        })
      },

      deleteCategory: (id) => set({ categories: get().categories.filter((c) => c.id !== id) }),

      exportData: () => {
        const payload: BackupPayload = {
          version: BACKUP_VERSION,
          exportedAt: now(),
          tasks: get().tasks,
          people: get().people,
          boards: get().boards,
          categories: get().categories,
          activeBoardId: get().activeBoardId,
          cardFont: get().cardFont,
          cardFontSize: get().cardFontSize,
          theme: get().theme,
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
          categories: Array.isArray(payload.categories) && payload.categories.length > 0 ? payload.categories : get().categories,
          activeBoardId,
          cardFont: payload.cardFont ?? get().cardFont,
          cardFontSize: payload.cardFontSize ?? get().cardFontSize,
          theme: payload.theme ?? get().theme,
          currentPage: 'pinboard',
          activeTaskId: null,
        })
        return { ok: true }
      },

      resetData: () => {
        const people = seedPeople.map((p) => ({ ...p, id: nanoid() }))
        const boards = seedBoards.map((b) => ({ ...b, id: nanoid() }))
        const categories = DEFAULT_CATEGORIES.map((c) => ({ ...c, id: nanoid() }))
        set({
          tasks: seedTasks(people),
          people,
          boards,
          categories,
          activeBoardId: boards[0].id,
          currentPage: 'pinboard',
          boardView: 'kanban',
          activeTaskId: null,
        })
      },
    }),
    {
      name: 'taskwall-storage',
      version: 2,
      migrate: (persistedState, version) => {
        const state = persistedState as
          | { tasks?: Array<Omit<Task, 'page' | 'columnId'> & { page: string; columnId: string }> }
          | undefined
        if (!state?.tasks) return state

        if (version < 1) {
          // "today" was a distinct task location (its own freeform page); it's
          // now just a `today` flag on board tasks, so any task still parked
          // on that now-removed page location is routed back to the Pinnwand.
          state.tasks = state.tasks.map((t) =>
            t.page === 'today' ? { ...t, page: 'pinboard', boardId: null, today: false } : t,
          )
        }

        if (version < 2) {
          // The "Review" and "Erledigt" Kanban columns were removed; fold
          // their tasks into "In Arbeit" rather than losing them from view.
          state.tasks = state.tasks.map((t) =>
            t.columnId === 'review' || t.columnId === 'done' ? { ...t, columnId: 'progress' } : t,
          )
        }

        return state
      },
    },
  ),
)
