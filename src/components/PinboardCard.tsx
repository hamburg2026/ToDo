import { useDraggable } from '@dnd-kit/core'
import type { Task } from '../types'
import TaskCard from './TaskCard'

interface Props {
  task: Task
  onEdit: () => void
  z: number
}

export default function PinboardCard({ task, onEdit, z }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { type: 'pinboard-card', task },
  })

  const style: React.CSSProperties = {
    position: 'absolute',
    left: task.x,
    top: task.y,
    transform: `rotate(${task.rotation}deg)`,
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 999 : z,
    touchAction: 'none',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <TaskCard task={task} dragging={isDragging} onEdit={onEdit} />
    </div>
  )
}
