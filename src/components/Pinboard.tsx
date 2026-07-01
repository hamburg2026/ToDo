import { Plus } from 'lucide-react'
import { useStore } from '../store/useStore'
import PinboardCard from './PinboardCard'

interface Props {
  onCreate: (position?: { x: number; y: number }) => void
  onEdit: (id: string) => void
}

export default function Pinboard({ onCreate, onEdit }: Props) {
  const tasks = useStore((s) => s.tasks).filter((t) => t.page === 'pinboard')

  return (
    <div className="no-scrollbar relative h-full w-full overflow-auto bg-grid pr-16">
      <div className="relative" style={{ width: 2200, height: 1400 }}>
        {tasks.length === 0 && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white/40">
            <p className="mb-2 font-hand text-3xl">Deine Pinnwand ist leer</p>
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

      <button
        onClick={() => onCreate()}
        className="fixed bottom-8 left-8 z-30 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 font-semibold text-white shadow-glow transition-transform hover:scale-105 active:scale-95"
      >
        <Plus size={18} />
        Neue Aufgabe
      </button>
    </div>
  )
}
