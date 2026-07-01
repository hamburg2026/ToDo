import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { BoardView, ColumnId, Page, Person, Task, TaskDraft } from '../types'
import { CARD_COLORS, PERSON_COLORS, initialsOf, randomPick } from '../lib/constants'

interface StoreState {
  tasks: Task[]
  people: Person[]
  currentPage: Page
  boardView: BoardView
  peopleManagerOpen: boolean
  activeTaskId: string | null

  setCurrentPage: (page: Page) => void
  setBoardView: (view: BoardView) => void
  openPeopleManager: () => void
  closePeopleManager: () => void
  setActiveTaskId: (id: string | null) => void

  addTask: (draft: TaskDraft, position?: { x: number; y: number }) => Task
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTaskToColumn: (id: string, columnId: ColumnId, targetIndex?: number) => void
  reorderColumn: (columnId: ColumnId, orderedIds: string[]) => void
  setTaskPosition: (id: string, x: number, y: number) => void
  sendTaskToPage: (id: string, page: Page, position?: { x: number; y: number }) => void

  addPerson: (name: string) => Person
  updatePerson: (id: string, patch: Partial<Person>) => void
  deletePerson: (id: string) => void

  exportData: () => string
  importData: (json: string) => { ok: true } | { ok: false; error: string }
  resetData: () => void
}

export const BACKUP_VERSION = 1

interface BackupPayload {
  version: number
  exportedAt: number
  tasks: Task[]
  people: Person[]
}

const seedPeople: Person[] = [
  { id: nanoid(), name: 'Jürgen Kriszio', color: '#8b5cf6', initials: 'JK' },
  { id: nanoid(), name: 'Anna Weber', color: '#22d3ee', initials: 'AW' },
]

const now = () => Date.now()

function seedTasks(people: Person[]): Task[] {
  const t = now()
  return [
    {
      id: nanoid(),
      title: 'Willkommen bei Taskwall 👋',
      description: 'Ziehe Karten frei auf der Pinnwand. Ziehe eine Karte an den rechten Bildrand, um sie ins Kanban-Board zu schicken.',
      assigneeId: people[0]?.id ?? null,
      start: null,
      end: null,
      category: 'Idee',
      hashtags: ['start', 'willkommen'],
      page: 'pinboard',
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
      currentPage: 'pinboard',
      boardView: 'kanban',
      peopleManagerOpen: false,
      activeTaskId: null,

      setCurrentPage: (page) => set({ currentPage: page }),
      setBoardView: (view) => set({ boardView: view }),
      openPeopleManager: () => set({ peopleManagerOpen: true }),
      closePeopleManager: () => set({ peopleManagerOpen: false }),
      setActiveTaskId: (id) => set({ activeTaskId: id }),

      addTask: (draft, position) => {
        const t = now()
        const task: Task = {
          ...draft,
          id: nanoid(),
          page: 'pinboard',
          columnId: 'backlog',
          order: get().tasks.filter((x) => x.columnId === 'backlog').length,
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

      moveTaskToColumn: (id, columnId, targetIndex) => {
        const tasks = get().tasks
        const columnTasks = tasks.filter((t) => t.columnId === columnId && t.id !== id)
        const insertAt = targetIndex ?? columnTasks.length
        columnTasks.splice(insertAt, 0, tasks.find((t) => t.id === id) as Task)
        const orderMap = new Map(columnTasks.map((t, idx) => [t.id, idx]))
        set({
          tasks: tasks.map((t) => {
            if (t.id === id) {
              return { ...t, columnId, page: 'board', order: orderMap.get(id) ?? 0, updatedAt: now() }
            }
            if (orderMap.has(t.id)) {
              return { ...t, order: orderMap.get(t.id) as number }
            }
            return t
          }),
        })
      },

      reorderColumn: (columnId, orderedIds) => {
        const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]))
        set({
          tasks: get().tasks.map((t) =>
            t.columnId === columnId && orderMap.has(t.id) ? { ...t, order: orderMap.get(t.id) as number } : t,
          ),
        })
      },

      setTaskPosition: (id, x, y) =>
        set({
          tasks: get().tasks.map((t) => (t.id === id ? { ...t, x, y, updatedAt: now() } : t)),
        }),

      sendTaskToPage: (id, page, position) => {
        const tasks = get().tasks
        if (page === 'board') {
          const task = tasks.find((t) => t.id === id)
          const columnId = task?.columnId ?? 'backlog'
          const order = tasks.filter((t) => t.columnId === columnId && t.id !== id).length
          set({
            tasks: tasks.map((t) => (t.id === id ? { ...t, page, columnId, order, updatedAt: now() } : t)),
          })
          return
        }
        set({
          tasks: tasks.map((t) =>
            t.id === id
              ? { ...t, page, x: position?.x ?? t.x, y: position?.y ?? t.y, updatedAt: now() }
              : t,
          ),
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

      exportData: () => {
        const payload: BackupPayload = {
          version: BACKUP_VERSION,
          exportedAt: now(),
          tasks: get().tasks,
          people: get().people,
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
        const payload = parsed as BackupPayload
        set({
          tasks: payload.tasks,
          people: payload.people,
          currentPage: 'pinboard',
          activeTaskId: null,
        })
        return { ok: true }
      },

      resetData: () => {
        const people = seedPeople.map((p) => ({ ...p, id: nanoid() }))
        set({
          tasks: seedTasks(people),
          people,
          currentPage: 'pinboard',
          boardView: 'kanban',
          activeTaskId: null,
        })
      },
    }),
    { name: 'taskwall-storage' },
  ),
)
