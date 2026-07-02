import { useStore } from '../store/useStore'
import FreeformBoard from './FreeformBoard'

interface Props {
  onEdit: (id: string) => void
}

export default function TodayBoard({ onEdit }: Props) {
  const tasks = useStore((s) => s.tasks).filter((t) => t.page === 'today' && !t.archived)
  const zoom = useStore((s) => s.todayZoom)
  const setZoom = useStore((s) => s.setTodayZoom)

  return (
    <FreeformBoard
      tasks={tasks}
      onEdit={onEdit}
      zoom={zoom}
      setZoom={setZoom}
      emptyTitle="Für heute ist nichts geplant"
      emptyHint="Ziehe Karten von der Pinnwand hierher (linker Rand), um sie für heute einzuplanen."
    />
  )
}
