import { useStore } from '../store/useStore'
import { COLUMNS } from '../lib/constants'
import KanbanColumn from './KanbanColumn'

interface Props {
  onEdit: (id: string) => void
}

export default function KanbanBoard({ onEdit }: Props) {
  const tasks = useStore((s) => s.tasks).filter((t) => t.page === 'board')

  return (
    <div className="flex h-full gap-4 overflow-x-auto pl-20 pr-6 py-6">
      {COLUMNS.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          tasks={tasks.filter((t) => t.columnId === column.id)}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}
