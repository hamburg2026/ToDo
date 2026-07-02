import { useStore } from '../store/useStore'
import { COLUMNS, ZOOM_STEP, clampZoom } from '../lib/constants'
import KanbanColumn from './KanbanColumn'
import ZoomControls from './ZoomControls'

interface Props {
  onEdit: (id: string) => void
}

export default function KanbanBoard({ onEdit }: Props) {
  const activeBoardId = useStore((s) => s.activeBoardId)
  const tasks = useStore((s) => s.tasks).filter((t) => t.page === 'board' && t.boardId === activeBoardId && !t.archived)
  const zoom = useStore((s) => s.kanbanZoom)
  const setZoom = useStore((s) => s.setKanbanZoom)

  function handleWheelZoom(e: React.WheelEvent) {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    setZoom(clampZoom(useStore.getState().kanbanZoom * (1 - e.deltaY * 0.001)))
  }

  return (
    <div className="relative h-full">
      <div className="h-full overflow-x-auto overflow-y-hidden pl-20 pr-6 py-6" onWheel={handleWheelZoom}>
        <div className="flex h-full origin-top-left gap-4" style={{ transform: `scale(${zoom})`, width: 'max-content' }}>
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasks.filter((t) => t.columnId === column.id)}
              onEdit={onEdit}
            />
          ))}
        </div>
      </div>

      <ZoomControls
        zoom={zoom}
        onZoomIn={() => setZoom(zoom + ZOOM_STEP)}
        onZoomOut={() => setZoom(zoom - ZOOM_STEP)}
        onReset={() => setZoom(1)}
      />
    </div>
  )
}
