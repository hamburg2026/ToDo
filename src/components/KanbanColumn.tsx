import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Column, Task } from '../types'
import KanbanCard from './KanbanCard'

interface Props {
  column: Column
  tasks: Task[]
  onEdit: (id: string) => void
}

export default function KanbanColumn({ column, tasks, onEdit }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: 'column', columnId: column.id } })

  return (
    <div className="flex h-full w-80 shrink-0 flex-col rounded-2xl glass">
      <div className="flex items-center justify-between rounded-t-2xl border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.accent }} />
          <h2 className="font-semibold text-white/90">{column.title}</h2>
        </div>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">{tasks.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`no-scrollbar flex-1 overflow-y-auto rounded-b-2xl p-3 transition-colors ${
          isOver ? 'bg-white/5' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((task) => (
              <KanbanCard key={task.id} task={task} onEdit={() => onEdit(task.id)} />
            ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-white/30">
            Karten hierher ziehen
          </div>
        )}
      </div>
    </div>
  )
}
