import { PinIcon, Users, Tag, KanbanSquare, CalendarCheck2, Settings, Archive, BarChart3 } from 'lucide-react'
import { useStore } from '../store/useStore'
import BackupMenu from './BackupMenu'
import BoardsMenu from './BoardsMenu'

export default function Header() {
  const currentPage = useStore((s) => s.currentPage)
  const setCurrentPage = useStore((s) => s.setCurrentPage)
  const openPeopleManager = useStore((s) => s.openPeopleManager)
  const openCategoriesManager = useStore((s) => s.openCategoriesManager)
  const openSettings = useStore((s) => s.openSettings)
  const openArchive = useStore((s) => s.openArchive)
  const archiveCompleted = useStore((s) => s.archiveCompleted)
  const archiveBadgeCount = useStore(
    (s) => s.tasks.filter((t) => (t.status === 'erledigt' && !t.archived) || (t.archived && t.archiveUnseen)).length,
  )

  return (
    <header className="relative z-50 grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 gap-y-2 px-6 py-4">
      <div className="flex min-w-0 items-center gap-2.5 justify-self-start">
        <img src={`${import.meta.env.BASE_URL}brand/ponturo-icon.svg`} alt="" className="h-9 w-9 shrink-0" />
        <span className="whitespace-nowrap text-lg tracking-tight text-[#151f76]">
          ponturo <span className="font-medium text-[#151f76]/60">Taskwall</span>
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 rounded-full glass p-1">
        <button
          onClick={() => setCurrentPage('pinboard')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
            currentPage === 'pinboard' ? 'accent-gradient text-white shadow-glow' : 'text-[#151f76]/60 hover:text-[#151f76]'
          }`}
        >
          <PinIcon size={14} /> Pinnwand
        </button>
        <button
          onClick={() => setCurrentPage('today')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
            currentPage === 'today' ? 'accent-gradient text-white shadow-glow' : 'text-[#151f76]/60 hover:text-[#151f76]'
          }`}
        >
          <CalendarCheck2 size={14} /> Heute zu tun
        </button>
        <button
          onClick={() => setCurrentPage('board')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
            currentPage === 'board' ? 'accent-gradient text-white shadow-glow' : 'text-[#151f76]/60 hover:text-[#151f76]'
          }`}
        >
          <KanbanSquare size={14} /> Board
        </button>
        <button
          onClick={() => setCurrentPage('analytics')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
            currentPage === 'analytics' ? 'accent-gradient text-white shadow-glow' : 'text-[#151f76]/60 hover:text-[#151f76]'
          }`}
        >
          <BarChart3 size={14} /> Auswertung
        </button>
      </div>

      <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 justify-self-end">
        <button
          onClick={openPeopleManager}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#151f76]/10 bg-white/60 px-4 py-1.5 text-sm font-medium text-[#151f76]/80 transition-colors hover:bg-white/90"
        >
          <Users size={14} /> Personen
        </button>

        <button
          onClick={openCategoriesManager}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#151f76]/10 bg-white/60 px-4 py-1.5 text-sm font-medium text-[#151f76]/80 transition-colors hover:bg-white/90"
        >
          <Tag size={14} /> Kategorien
        </button>

        <BoardsMenu />

        <button
          onClick={() => {
            archiveCompleted()
            openArchive()
          }}
          aria-label="Archiv"
          title="Erledigte archivieren"
          className="relative flex items-center justify-center rounded-full border border-[#151f76]/10 bg-white/60 p-2 text-[#151f76]/80 transition-colors hover:bg-white/90"
        >
          <Archive size={16} />
          {archiveBadgeCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
              {archiveBadgeCount}
            </span>
          )}
        </button>

        <BackupMenu />

        <button
          onClick={openSettings}
          aria-label="Einstellungen"
          className="flex items-center justify-center rounded-full border border-[#151f76]/10 bg-white/60 p-2 text-[#151f76]/80 transition-colors hover:bg-white/90"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  )
}
