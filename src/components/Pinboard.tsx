import { useState } from 'react'
import { Plus, PenLine } from 'lucide-react'
import { useStore } from '../store/useStore'
import FreeformBoard from './FreeformBoard'
import HandwritingCapture from './HandwritingCapture'

interface Props {
  onCreate: (position?: { x: number; y: number }) => void
  onEdit: (id: string) => void
}

export default function Pinboard({ onCreate, onEdit }: Props) {
  const tasks = useStore((s) => s.tasks).filter((t) => t.page === 'pinboard' && !t.archived)
  const zoom = useStore((s) => s.pinboardZoom)
  const setZoom = useStore((s) => s.setPinboardZoom)
  const [handwritingOpen, setHandwritingOpen] = useState(false)

  return (
    <FreeformBoard
      tasks={tasks}
      onEdit={onEdit}
      zoom={zoom}
      setZoom={setZoom}
      emptyTitle="Deine Pinnwand ist leer"
      emptyHint="Klicke auf „Neue Aufgabe“, um zu starten."
      actions={
        <>
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
        </>
      }
    />
  )
}
