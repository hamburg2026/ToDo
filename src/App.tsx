import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import Header from './components/Header'
import Pinboard from './components/Pinboard'
import TodayBoard from './components/TodayBoard'
import KanbanBoard from './components/KanbanBoard'
import PlanView from './components/PlanView'
import AnalyticsView from './components/AnalyticsView'
import EdgeZone from './components/EdgeZone'
import BoardTabs from './components/BoardTabs'
import TaskModal from './components/TaskModal'
import PeopleManager from './components/PeopleManager'
import BoardsManager from './components/BoardsManager'
import SettingsPanel from './components/SettingsPanel'
import ArchiveManager from './components/ArchiveManager'
import TaskCard from './components/TaskCard'
import { useStore } from './store/useStore'
import { useApplyTheme } from './hooks/useApplyTheme'
import { PINBOARD_CARD_HEIGHT, PINBOARD_CARD_WIDTH, PINBOARD_HEIGHT, PINBOARD_WIDTH } from './lib/constants'
import type { ColumnId, Page } from './types'

const CARD_W = PINBOARD_CARD_WIDTH
const CARD_H = PINBOARD_CARD_HEIGHT
const CANVAS_W = PINBOARD_WIDTH
const CANVAS_H = PINBOARD_HEIGHT

// Prefer whatever droppable the pointer is literally over (correct for narrow
// targets like the board tabs), falling back to rect overlap when the pointer
// briefly isn't inside any droppable (e.g. in gaps between columns).
const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args)
  return pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args)
}

export default function App() {
  useApplyTheme()
  const currentPage = useStore((s) => s.currentPage)
  const setCurrentPage = useStore((s) => s.setCurrentPage)
  const boardView = useStore((s) => s.boardView)
  const tasks = useStore((s) => s.tasks)
  const activeBoardId = useStore((s) => s.activeBoardId)
  const setActiveBoardId = useStore((s) => s.setActiveBoardId)
  const setTaskPosition = useStore((s) => s.setTaskPosition)
  const sendTaskToPage = useStore((s) => s.sendTaskToPage)
  const moveTaskToBoard = useStore((s) => s.moveTaskToBoard)
  const moveTaskToColumn = useStore((s) => s.moveTaskToColumn)
  const reorderColumn = useStore((s) => s.reorderColumn)
  const peopleManagerOpen = useStore((s) => s.peopleManagerOpen)
  const closePeopleManager = useStore((s) => s.closePeopleManager)
  const boardsManagerOpen = useStore((s) => s.boardsManagerOpen)
  const closeBoardsManager = useStore((s) => s.closeBoardsManager)
  const settingsOpen = useStore((s) => s.settingsOpen)
  const closeSettings = useStore((s) => s.closeSettings)
  const archiveOpen = useStore((s) => s.archiveOpen)
  const closeArchive = useStore((s) => s.closeArchive)

  const [modalTaskId, setModalTaskId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | undefined>(undefined)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  )

  const activeTask = useMemo(() => tasks.find((t) => t.id === activeId) ?? null, [tasks, activeId])

  function openCreateModal(position?: { x: number; y: number }) {
    setModalTaskId(null)
    setModalPosition(position)
    setModalOpen(true)
  }

  function openEditModal(id: string) {
    setModalTaskId(id)
    setModalOpen(true)
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string)
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over, delta } = e
    setActiveId(null)
    const task = tasks.find((t) => t.id === active.id)
    if (!task) return

    // Drag onto a board tab (Lasche) on the right edge: move the task into
    // that Kanban board, but stay on the current page (e.g. the Pinnwand)
    // instead of jumping to the board.
    if (typeof over?.id === 'string' && over.id.startsWith('board-tab-')) {
      const targetBoardId = over.id.slice('board-tab-'.length)
      if (task.page !== 'board' || task.boardId !== targetBoardId) {
        moveTaskToBoard(task.id, targetBoardId)
      }
      setActiveBoardId(targetBoardId)
      return
    }

    // Drag onto an edge tab (e.g. "Zur Pinnwand" or "Heute zu tun"): move the
    // task to whichever page that edge tab currently targets.
    if (typeof over?.id === 'string' && over.id.startsWith('edge-nav-')) {
      const targetPage = (over.data.current as { target?: Page } | undefined)?.target ?? 'pinboard'
      const randX = 200 + Math.random() * 500
      const randY = 150 + Math.random() * 400
      sendTaskToPage(task.id, targetPage, { x: randX, y: randY })
      setCurrentPage(targetPage)
      return
    }

    if (task.page === 'pinboard' || task.page === 'today') {
      // The pinboard/today canvases can be zoomed (see Pinboard.tsx /
      // TodayBoard.tsx), which scales on-screen pixels relative to the
      // underlying, unscaled coordinate space that task.x/y live in — so the
      // raw pointer delta needs to be un-scaled before it's applied.
      const zoom = task.page === 'pinboard' ? useStore.getState().pinboardZoom : useStore.getState().todayZoom
      const nextX = Math.min(Math.max(0, task.x + delta.x / zoom), CANVAS_W - CARD_W)
      const nextY = Math.min(Math.max(0, task.y + delta.y / zoom), CANVAS_H - CARD_H)
      setTaskPosition(task.id, nextX, nextY)
      return
    }

    // Kanban card logic
    if (!over) return
    const overType = (over.data.current as { type?: string } | undefined)?.type

    if (overType === 'column') {
      const columnId = over.id as ColumnId
      if (columnId !== task.columnId) {
        moveTaskToColumn(task.id, activeBoardId, columnId)
      }
      return
    }

    if (overType === 'kanban-card') {
      const overTask = tasks.find((t) => t.id === over.id)
      if (!overTask) return
      if (overTask.columnId === task.columnId) {
        const columnTasks = tasks
          .filter((t) => t.columnId === task.columnId && t.boardId === activeBoardId)
          .sort((a, b) => a.order - b.order)
        const oldIndex = columnTasks.findIndex((t) => t.id === task.id)
        const newIndex = columnTasks.findIndex((t) => t.id === overTask.id)
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reordered = arrayMove(columnTasks, oldIndex, newIndex)
          reorderColumn(activeBoardId, task.columnId, reordered.map((t) => t.id))
        }
      } else {
        const targetTasks = tasks
          .filter((t) => t.columnId === overTask.columnId && t.boardId === activeBoardId)
          .sort((a, b) => a.order - b.order)
        const targetIndex = targetTasks.findIndex((t) => t.id === overTask.id)
        moveTaskToColumn(task.id, activeBoardId, overTask.columnId, targetIndex)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative h-screen w-screen">
        <div className="aurora-bg">
          <div className="brand-watermark" />
        </div>
        <div className="flex h-full flex-col">
          <Header />
          <main className="relative z-0 flex-1 overflow-hidden">
            {currentPage === 'pinboard' && <Pinboard onCreate={openCreateModal} onEdit={openEditModal} />}
            {currentPage === 'today' && <TodayBoard onEdit={openEditModal} />}
            {currentPage === 'board' && boardView === 'kanban' && <KanbanBoard onEdit={openEditModal} />}
            {currentPage === 'board' && boardView === 'plan' && <PlanView onEdit={openEditModal} />}
            {currentPage === 'analytics' && <AnalyticsView onEdit={openEditModal} />}
          </main>
        </div>

        <BoardTabs />
        <EdgeZone
          side="left"
          label={currentPage === 'pinboard' ? 'Heute zu tun' : 'Zur Pinnwand'}
          target={currentPage === 'pinboard' ? 'today' : 'pinboard'}
          active={currentPage === 'pinboard' || currentPage === 'today' || currentPage === 'board'}
        />

        <DragOverlay style={{ zIndex: 9999 }}>
          {activeTask ? (
            <div
              style={{
                transform:
                  activeTask.page === 'pinboard' || activeTask.page === 'today'
                    ? `rotate(${activeTask.rotation}deg)`
                    : undefined,
              }}
            >
              <TaskCard task={activeTask} dragging />
            </div>
          ) : null}
        </DragOverlay>
      </div>

      {modalOpen && (
        <TaskModal
          taskId={modalTaskId}
          initialPosition={modalPosition}
          onClose={() => setModalOpen(false)}
          onOpenPeople={() => useStore.getState().openPeopleManager()}
        />
      )}

      {peopleManagerOpen && <PeopleManager onClose={closePeopleManager} />}
      {boardsManagerOpen && <BoardsManager onClose={closeBoardsManager} />}
      {settingsOpen && <SettingsPanel onClose={closeSettings} />}
      {archiveOpen && <ArchiveManager onClose={closeArchive} />}
    </DndContext>
  )
}
