import { useState } from 'react'
import { Plus, PenLine } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CARD_FONT_CLASSES, PINBOARD_HEIGHT, PINBOARD_WIDTH, ZOOM_STEP, clampZoom } from '../lib/constants'
import PinboardCard from './PinboardCard'
import HandwritingCapture from './HandwritingCapture'
import ZoomControls from './ZoomControls'

interface Props {
  onCreate: (position?: { x: number; y: number }) => void
  onEdit: (id: string) => void
}

export default function Pinboard({ onCreate, onEdit }: Props) {
  const tasks = useStore((s) => s.tasks).filter((t) => t.page === 'pinboard')
  const cardFont = useStore((s) => s.cardFont)
  const zoom = useStore((s) => s.pinboardZoom)
  const setZoom = useStore((s) => s.setPinboardZoom)
  const [handwritingOpen, setHandwritingOpen] = useState(false)

  function handleWheelZoom(e: React.WheelEvent) {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    setZoom(clampZoom(useStore.getState().pinboardZoom * (1 - e.deltaY * 0.001)))
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
              <p className={`mb-2 ${CARD_FONT_CLASSES[cardFont]} text-3xl`}>Deine Pinnwand ist leer</p>
              <p className="text-sm">Klicke auf „Neue Aufgabe“, um zu starten.</p>
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

      <div className="fixed bottom-8 left-8 z-30 flex items-center gap-3">
        <button
          onClick={() => onCreate()}
          className="flex items-center gap-2 rounded-full accent-gradient px-5 py-3 font-semibold text-white shadow-glow transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          Neue Aufgabe
        </button>
        <button
          onClick={() => setHandwritingOpen(true)}
          title="Handschriftlich erfassen (Apple Pencil)"
          className="flex items-center gap-2 rounded-full border border-[#151f76]/12 bg-[#151f76]/6 px-4 py-3 font-semibold text-[#151f76] backdrop-blur transition-colors hover:bg-[#151f76]/10"
        >
          <PenLine size={17} />
          Handschrift
        </button>
      </div>

      {handwritingOpen && <HandwritingCapture onClose={() => setHandwritingOpen(false)} />}
    </div>
  )
}
