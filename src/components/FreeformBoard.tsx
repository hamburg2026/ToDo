import type { ReactNode } from 'react'
import { useStore } from '../store/useStore'
import { CARD_FONT_CLASSES, PINBOARD_HEIGHT, PINBOARD_WIDTH, ZOOM_STEP, clampZoom } from '../lib/constants'
import type { Task } from '../types'
import PinboardCard from './PinboardCard'
import ZoomControls from './ZoomControls'

interface Props {
  tasks: Task[]
  onEdit: (id: string) => void
  zoom: number
  setZoom: (zoom: number) => void
  emptyTitle: string
  emptyHint: string
  actions?: ReactNode
}

export default function FreeformBoard({ tasks, onEdit, zoom, setZoom, emptyTitle, emptyHint, actions }: Props) {
  const cardFont = useStore((s) => s.cardFont)

  function handleWheelZoom(e: React.WheelEvent) {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    setZoom(clampZoom(zoom * (1 - e.deltaY * 0.001)))
  }

  return (
    <div className="no-scrollbar relative h-full w-full overflow-auto bg-grid pr-16" onWheel={handleWheelZoom}>
      <div style={{ width: PINBOARD_WIDTH * zoom, height: PINBOARD_HEIGHT * zoom }}>
        <div
          className="relative origin-top-left"
          style={{ width: PINBOARD_WIDTH, height: PINBOARD_HEIGHT, transform: `scale(${zoom})` }}
        >
          {tasks.length === 0 && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[#151f76]/50">
              <p className={`mb-2 ${CARD_FONT_CLASSES[cardFont]} text-3xl`}>{emptyTitle}</p>
              <p className="text-sm">{emptyHint}</p>
            </div>
          )}
          {tasks
            .slice()
            .sort((a, b) => a.updatedAt - b.updatedAt)
            .map((task, idx) => (
              <PinboardCard key={task.id} task={task} onEdit={() => onEdit(task.id)} z={idx + 1} />
            ))}
        </div>
      </div>

      <ZoomControls
        zoom={zoom}
        onZoomIn={() => setZoom(zoom + ZOOM_STEP)}
        onZoomOut={() => setZoom(zoom - ZOOM_STEP)}
        onReset={() => setZoom(1)}
      />

      {actions}
    </div>
  )
}
