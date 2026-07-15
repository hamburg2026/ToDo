import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Plus, PenLine } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CARD_FONT_CLASSES } from '../lib/constants'
import type { Task } from '../types'
import HandwritingCapture from './HandwritingCapture'
import TaskCard from './TaskCard'

interface Props {
  onCreate: () => void
  onEdit: (id: string) => void
}

// Board tasks shown here have no meaningful x/y (their real position is
// their board/column), so this is a plain draggable, not a freeform-canvas
// or sortable one — it only needs to work as a drag *source* so a card can
// be sent to a different board (right-edge tabs) or back to the Pinnwand
// (left-edge zone).
function DraggableTodayCard({ task, onEdit }: { task: Task; onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { type: 'today-card', task },
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ opacity: isDragging ? 0.4 : 1, touchAction: 'none' }}
      className="cursor-grab active:cursor-grabbing"
    >
      <TaskCard task={task} dragging={isDragging} onEdit={onEdit} />
    </div>
  )
}

export default function TodayBoard({ onCreate, onEdit }: Props) {
  const tasks = useStore((s) => s.tasks).filter((t) => t.page === 'board' && t.today && !t.archived)
  const boards = useStore((s) => s.boards)
  const activeBoardId = useStore((s) => s.activeBoardId)
  const cardFont = useStore((s) => s.cardFont)
  const [handwritingOpen, setHandwritingOpen] = useState(false)

  return (
    <div className="no-scrollbar relative h-full w-full overflow-auto bg-grid py-8 pl-20 pr-20">
      {tasks.length === 0 ? (
        <div className="flex h-full items-center justify-center text-center text-[#151f76]/50">
          <div>
            <p className={`mb-2 ${CARD_FONT_CLASSES[cardFont]} text-3xl`}>Für heute ist nichts geplant</p>
            <p className="text-sm">
              Markiere eine Aufgabe in einem Board als „Heute“, oder ziehe eine Board-Karte auf die
              „Heute zu tun“-Zone am linken Rand.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-5">
          {tasks
            .slice()
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((task) => {
              const board = boards.find((b) => b.id === task.boardId)
              return (
                <div key={task.id} className="w-64">
                  {board && (
                    <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-[#151f76]/50">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: board.color }} />
                      {board.name}
                    </div>
                  )}
                  <DraggableTodayCard task={task} onEdit={() => onEdit(task.id)} />
                </div>
              )
            })}
        </div>
      )}

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

      {handwritingOpen && (
        <HandwritingCapture onClose={() => setHandwritingOpen(false)} page="board" boardId={activeBoardId} defaultToday />
      )}
    </div>
  )
}
