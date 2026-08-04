import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Users, Tag, Workflow } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function ManageMenu() {
  const openPeopleManager = useStore((s) => s.openPeopleManager)
  const openCategoriesManager = useStore((s) => s.openCategoriesManager)
  const openProcessManager = useStore((s) => s.openProcessManager)

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
        <Users size={14} /> Verwalten
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-52 overflow-hidden rounded-xl glass p-1.5 shadow-glow animate-pop-in">
          <button
            onClick={() => {
              openPeopleManager()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[#151f76]/90 hover:bg-[#151f76]/6"
          >
            <Users size={15} className="text-[#151f76]/60" />
            Personen
          </button>
          <button
            onClick={() => {
              openCategoriesManager()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[#151f76]/90 hover:bg-[#151f76]/6"
          >
            <Tag size={15} className="text-[#151f76]/60" />
            Kategorien
          </button>
          <button
            onClick={() => {
              openProcessManager()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[#151f76]/90 hover:bg-[#151f76]/6"
          >
            <Workflow size={15} className="text-[#151f76]/60" />
            Prozesse
          </button>
        </div>
      )}
    </div>
  )
}
