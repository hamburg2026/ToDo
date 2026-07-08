import { useEffect, useRef, useState } from 'react'
import { Layers, ChevronDown, KanbanSquare, CalendarClock, Check } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function BoardsMenu() {
  const currentPage = useStore((s) => s.currentPage)
  const boardView = useStore((s) => s.boardView)
  const setBoardView = useStore((s) => s.setBoardView)
  const boards = useStore((s) => s.boards)
  const activeBoardId = useStore((s) => s.activeBoardId)
  const openBoardsManager = useStore((s) => s.openBoardsManager)
  const activeBoard = boards.find((b) => b.id === activeBoardId)

  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#151f76]/10 bg-white/60 px-4 py-1.5 text-sm font-medium text-[#151f76]/80 transition-colors hover:bg-white/90"
      >
        <Layers size={14} /> Boards
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-56 overflow-hidden rounded-xl glass p-1.5 shadow-glow animate-pop-in">
          {currentPage === 'board' && activeBoard && (
            <>
              <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#151f76]/55">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: activeBoard.color }} />
                <span className="truncate">{activeBoard.name}</span>
              </div>
              <button
                onClick={() => {
                  setBoardView('kanban')
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[#151f76]/90 hover:bg-[#151f76]/6"
              >
                <KanbanSquare size={15} className="text-[#151f76]/60" />
                <span className="flex-1">Kanban-Ansicht</span>
                {boardView === 'kanban' && <Check size={15} className="text-violet-400" />}
              </button>
              <button
                onClick={() => {
                  setBoardView('plan')
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[#151f76]/90 hover:bg-[#151f76]/6"
              >
                <CalendarClock size={15} className="text-[#151f76]/60" />
                <span className="flex-1">Plan-Ansicht</span>
                {boardView === 'plan' && <Check size={15} className="text-violet-400" />}
              </button>
              <div className="my-1 h-px bg-[#151f76]/6" />
            </>
          )}
          <button
            onClick={() => {
              openBoardsManager()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[#151f76]/90 hover:bg-[#151f76]/6"
          >
            <Layers size={15} className="text-[#151f76]/60" />
            Boards verwalten
          </button>
        </div>
      )}
    </div>
  )
}
