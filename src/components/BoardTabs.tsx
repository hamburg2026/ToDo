import { useDroppable } from '@dnd-kit/core'
import type { Board } from '../types'
import { useStore } from '../store/useStore'

interface TabProps {
  board: Board
  active: boolean
  onClick: () => void
}

function BoardTab({ board, active, onClick }: TabProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `board-tab-${board.id}`, data: { boardId: board.id } })

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      title={board.name}
      className={`flex items-center gap-2 rounded-l-2xl border py-3 pl-3 pr-2 shadow-card transition-all ${
        isOver
          ? 'scale-110 border-[#151f76]/30 shadow-glow animate-pulse-edge'
          : active
            ? 'border-[#151f76]/15'
            : 'border-[#151f76]/10 hover:border-[#151f76]/15'
      }`}
      style={{
        backgroundColor: active || isOver ? `${board.color}cc` : `${board.color}33`,
      }}
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-white/80" />
      <span
        className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-white"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        {board.name}
      </span>
    </button>
  )
}

export default function BoardTabs() {
  const boards = useStore((s) => s.boards)
  const activeBoardId = useStore((s) => s.activeBoardId)
  const currentPage = useStore((s) => s.currentPage)
  const setActiveBoardId = useStore((s) => s.setActiveBoardId)
  const setCurrentPage = useStore((s) => s.setCurrentPage)

  return (
    <div className="fixed right-0 top-0 z-40 flex h-full flex-col items-end justify-center gap-3 py-6">
      {boards.map((board) => (
        <BoardTab
          key={board.id}
          board={board}
          active={currentPage === 'board' && activeBoardId === board.id}
          onClick={() => {
            setActiveBoardId(board.id)
            setCurrentPage('board')
          }}
        />
      ))}
    </div>
  )
}
