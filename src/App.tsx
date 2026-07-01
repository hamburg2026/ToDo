import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import Header from './components/Header'
import Pinboard from './components/Pinboard'
import KanbanBoard from './components/KanbanBoard'
import PlanView from './components/PlanView'
import EdgeZone from './components/EdgeZone'
import TaskModal from './components/TaskModal'
import PeopleManager from './components/PeopleManager'
import TaskCard from './components/TaskCard'
import { useStore } from './store/useStore'
import type { ColumnId } from './types'

const CARD_W = 256
const CARD_H = 150
const CANVAS_W = 2200
const CANVAS_H = 1400

export default function App() {
  const currentPage = useStore((s) => s.currentPage)
  const setCurrentPage = useStore((s) => s.setCurrentPage)
  const boardView = useStore((s) => s.boardView)
  const tasks = useStore((s) => s.tasks)
  const setTaskPosition = useStore((s) => s.setTaskPosition)
  const sendTaskToPage = useStore((s) => s.sendTaskToPage)
  const moveTaskToColumn = useStore((s) => s.moveTaskToColumn)
  const reorderColumn = useStore((s) => s.reorderColumn)
  const peopleManagerOpen = useStore((s) => s.peopleManagerOpen)
  const closePeopleManager = useStore((s) => s.closePeopleManager)

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

    // Navigate to the other page via edge drop
    if (typeof over?.id === 'string' && over.id.startsWith('edge-nav-')) {
      if (task.page === 'pinboard') {
        sendTaskToPage(task.id, 'board')
        setCurrentPage('board')
      } else {
        const randX = 200 + Math.random() * 500
        const randY = 150 + Math.random() * 400
        sendTaskToPage(task.id, 'pinboard', { x: randX, y: randY })
        setCurrentPage('pinboard')
      }
      return
    }

    if (task.page === 'pinboard') {
      const nextX = Math.min(Math.max(0, task.x + delta.x), CANVAS_W - CARD_W)
      const nextY = Math.min(Math.max(0, task.y + delta.y), CANVAS_H - CARD_H)
      setTaskPosition(task.id, nextX, nextY)
      return
    }

    // Kanban card logic
    if (!over) return
    const overType = (over.data.current as { type?: string } | undefined)?.type

    if (overType === 'column') {
      const columnId = over.id as ColumnId
      if (columnId !== task.columnId) {
        moveTaskToColumn(task.id, columnId)
      }
      return
    }

    if (overType === 'kanban-card') {
      const overTask = tasks.find((t) => t.id === over.id)
      if (!overTask) return
      if (overTask.columnId === task.columnId) {
        const columnTasks = tasks
          .filter((t) => t.columnId === task.columnId)
          .sort((a, b) => a.order - b.order)
        const oldIndex = columnTasks.findIndex((t) => t.id === task.id)
        const newIndex = columnTasks.findIndex((t) => t.id === overTask.id)
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reordered = arrayMove(columnTasks, oldIndex, newIndex)
          reorderColumn(task.columnId, reordered.map((t) => t.id))
        }
      } else {
        const targetTasks = tasks
          .filter((t) => t.columnId === overTask.columnId)
          .sort((a, b) => a.order - b.order)
        const targetIndex = targetTasks.findIndex((t) => t.id === overTask.id)
        moveTaskToColumn(task.id, overTask.columnId, targetIndex)
      }
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="relative h-screen w-screen">
        <div className="aurora-bg" />
        <div className="relative z-10 flex h-full flex-col">
          <Header />
          <main className="relative flex-1 overflow-hidden">
            {currentPage === 'pinboard' && <Pinboard onCreate={openCreateModal} onEdit={openEditModal} />}
            {currentPage === 'board' && boardView === 'kanban' && <KanbanBoard onEdit={openEditModal} />}
            {currentPage === 'board' && boardView === 'plan' && <PlanView onEdit={openEditModal} />}
          </main>
        </div>

        <EdgeZone side="right" label="Kanban Board" active={currentPage === 'pinboard'} />
        <EdgeZone side="left" label="Zur Pinnwand" active={currentPage === 'board'} />

        <DragOverlay style={{ zIndex: 9999 }}>
          {activeTask ? (
            <div style={{ transform: activeTask.page === 'pinboard' ? `rotate(${activeTask.rotation}deg)` : undefined }}>
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
    </DndContext>
  )
}
