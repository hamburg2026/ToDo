import { useState } from 'react'
import { Plus, PenLine } from 'lucide-react'
import { useStore } from '../store/useStore'
import FreeformBoard from './FreeformBoard'
import HandwritingCapture from './HandwritingCapture'
import TaskTable from './TaskTable'
import TodayCard from './TodayCard'

interface Props {
  onCreate: () => void
  onEdit: (id: string) => void
}

export default function TodayBoard({ onCreate, onEdit }: Props) {
  const tasks = useStore((s) => s.tasks).filter((t) => t.today && !t.archived)
  const activeBoardId = useStore((s) => s.activeBoardId)
  const layoutMode = useStore((s) => s.layoutMode)
  const zoom = useStore((s) => s.todayZoom)
  const setZoom = useStore((s) => s.setTodayZoom)
  const [handwritingOpen, setHandwritingOpen] = useState(false)

  const emptyHint = 'Markiere eine Aufgabe auf der Pinnwand oder in einem Board als „Heute“, oder ziehe eine Karte auf die „Heute zu tun“-Zone am linken Rand.'

  const actionButtons = (
    <div className="fixed bottom-8 left-8 z-30 flex items-center gap-3">
      <button
        onClick={onCreate}
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
  )

  if (layoutMode === 'list') {
    return (
      <div className="relative h-full w-full overflow-y-auto px-6 py-6 pb-28">
        <TaskTable tasks={tasks} onEdit={onEdit} showBoard showMoveTo emptyMessage={`Für heute ist nichts geplant. ${emptyHint}`} />
        {actionButtons}
        {handwritingOpen && (
          <HandwritingCapture onClose={() => setHandwritingOpen(false)} page="board" boardId={activeBoardId} defaultToday />
        )}
      </div>
    )
  }

  return (
    <FreeformBoard
      tasks={tasks}
      onEdit={onEdit}
      zoom={zoom}
      setZoom={setZoom}
      emptyTitle="Für heute ist nichts geplant"
      emptyHint={emptyHint}
      renderCard={(task, idx) => <TodayCard task={task} onEdit={() => onEdit(task.id)} z={idx + 1} />}
      actions={
        <>
          {actionButtons}
          {handwritingOpen && (
            <HandwritingCapture onClose={() => setHandwritingOpen(false)} page="board" boardId={activeBoardId} defaultToday />
          )}
        </>
      }
    />
  )
}
