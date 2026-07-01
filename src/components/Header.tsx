import { LayoutGrid, PinIcon, Users, KanbanSquare, CalendarClock, Settings } from 'lucide-react'
import { useStore } from '../store/useStore'
import BackupMenu from './BackupMenu'

export default function Header() {
  const currentPage = useStore((s) => s.currentPage)
  const setCurrentPage = useStore((s) => s.setCurrentPage)
  const boardView = useStore((s) => s.boardView)
  const setBoardView = useStore((s) => s.setBoardView)
  const openPeopleManager = useStore((s) => s.openPeopleManager)
  const openSettings = useStore((s) => s.openSettings)

  return (
    <header className="relative z-50 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-glow">
          <LayoutGrid size={18} className="text-white" />
        </div>
        <span className="text-lg font-extrabold tracking-tight text-white">Taskwall</span>
      </div>

      <div className="flex items-center gap-2 rounded-full glass p-1">
        <button
          onClick={() => setCurrentPage('pinboard')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
            currentPage === 'pinboard' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-glow' : 'text-white/60 hover:text-white'
          }`}
        >
          <PinIcon size={14} /> Pinnwand
        </button>
        <button
          onClick={() => setCurrentPage('board')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
            currentPage === 'board' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-glow' : 'text-white/60 hover:text-white'
          }`}
        >
          <KanbanSquare size={14} /> Board
        </button>
      </div>

      <div className="flex items-center gap-3">
        {currentPage === 'board' && (
          <div className="flex items-center gap-1 rounded-full glass p-1">
            <button
              onClick={() => setBoardView('kanban')}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                boardView === 'kanban' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <KanbanSquare size={13} /> Kanban
            </button>
            <button
              onClick={() => setBoardView('plan')}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                boardView === 'plan' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <CalendarClock size={13} /> Plan
            </button>
          </div>
        )}

        <button
          onClick={openPeopleManager}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
        >
          <Users size={14} /> Personen
        </button>

        <BackupMenu />

        <button
          onClick={openSettings}
          aria-label="Einstellungen"
          className="flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-white/80 transition-colors hover:bg-white/10"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  )
}
