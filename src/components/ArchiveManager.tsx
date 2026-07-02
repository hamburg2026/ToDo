import { X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { STATUS_OPTIONS, categoryColor } from '../lib/constants'

interface Props {
  onClose: () => void
}

export default function ArchiveManager({ onClose }: Props) {
  const tasks = useStore((s) => s.tasks).filter((t) => t.archived)
  const restoreFromArchive = useStore((s) => s.restoreFromArchive)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#151f76]/35 p-4 animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl glass p-6 shadow-glow animate-pop-in"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#151f76]">Archiv</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-[#151f76]/55 hover:bg-[#151f76]/6 hover:text-[#151f76]">
            <X size={18} />
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#151f76]/45">
            Noch keine erledigten Aufgaben archiviert.
          </p>
        ) : (
          <div className="space-y-3">
            {tasks
              .slice()
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((task) => (
                <div key={task.id} className="rounded-xl border border-[#151f76]/10 bg-[#151f76]/4 p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-[#151f76]">{task.title}</p>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm"
                      style={{ backgroundColor: categoryColor(task.category) }}
                    >
                      {task.category || 'Ohne Kategorie'}
                    </span>
                  </div>

                  <p className="mb-1.5 text-[11px] text-[#151f76]/55">
                    Status ändern, um die Aufgabe zurück auf die Pinnwand zu holen:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => restoreFromArchive(task.id, 'none')}
                      className="rounded-full border border-[#151f76]/15 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-[#151f76]/65 transition-transform hover:scale-105 hover:bg-white"
                    >
                      Kein Status
                    </button>
                    {STATUS_OPTIONS.filter((s) => s.id !== 'erledigt').map((s) => (
                      <button
                        key={s.id}
                        onClick={() => restoreFromArchive(task.id, s.id)}
                        className="rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-transform hover:scale-105"
                        style={{ borderColor: s.color, backgroundColor: `${s.color}18`, color: s.color }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
