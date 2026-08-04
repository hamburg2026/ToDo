import { useDraggable } from '@dnd-kit/core'
import { useStore } from '../store/useStore'
import type { Task } from '../types'
import TaskCard from './TaskCard'

interface Props {
  task: Task
  onEdit: () => void
  z: number
}

// Today mixes tasks from different boards, so unlike PinboardCard each card
// carries a small board-name label above it for context.
export default function TodayCard({ task, onEdit, z }: Props) {
  const board = useStore((s) => s.boards.find((b) => b.id === task.boardId))
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { type: 'today-card', task },
  })

  return (
    <div
      style={{
        position: 'absolute',
        left: task.x,
        top: task.y,
        zIndex: isDragging ? 999 : z,
        opacity: isDragging ? 0 : 1,
      }}
    >
      {board && (
        <div className="mb-1 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-[#151f76]/50">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: board.color }} />
          {board.name}
        </div>
      )}
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{ transform: `rotate(${task.rotation}deg)`, touchAction: 'none' }}
        className="cursor-grab active:cursor-grabbing"
      >
        <TaskCard task={task} dragging={isDragging} onEdit={onEdit} />
      </div>
    </div>
  )
}
