import { useState } from 'react'
import { Plus, Trash2, X, Pencil, Check, LayoutDashboard } from 'lucide-react'
import { useStore } from '../store/useStore'

interface Props {
  onClose: () => void
}

export default function BoardsManager({ onClose }: Props) {
  const boards = useStore((s) => s.boards)
  const tasks = useStore((s) => s.tasks)
  const activeBoardId = useStore((s) => s.activeBoardId)
  const addBoard = useStore((s) => s.addBoard)
  const updateBoard = useStore((s) => s.updateBoard)
  const deleteBoard = useStore((s) => s.deleteBoard)

  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addBoard(name.trim())
    setName('')
  }

  function startEdit(id: string, current: string) {
    setEditingId(id)
    setEditName(current)
  }

  function saveEdit() {
    if (editingId && editName.trim()) {
      updateBoard(editingId, { name: editName.trim() })
    }
    setEditingId(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl glass p-6 shadow-glow animate-pop-in"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Boards verwalten</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-sm text-white/60">
          Boards erscheinen als Laschen am rechten Bildrand. Ziehe eine Karte von der Pinnwand auf eine Lasche, um
          sie dorthin zu verschieben – z. B. für unterschiedliche Projekte oder ein privates Board.
        </p>

        <form onSubmit={handleAdd} className="mb-4 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name des Boards"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg accent-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
          >
            <Plus size={16} /> Hinzufügen
          </button>
        </form>

        <div className="max-h-80 space-y-2 overflow-y-auto">
          {boards.map((b) => {
            const count = tasks.filter((t) => t.boardId === b.id).length
            const isLast = boards.length <= 1
            return (
              <div key={b.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: b.color }}
                >
                  <LayoutDashboard size={16} />
                </div>
                {editingId === b.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    className="flex-1 rounded-md border border-violet-400 bg-white/10 px-2 py-1 text-sm text-white outline-none"
                  />
                ) : (
                  <div className="flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-white/90">
                      {b.name}
                      {b.id === activeBoardId && (
                        <span className="rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
                          Aktiv
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-white/40">{count} Aufgabe{count === 1 ? '' : 'n'}</p>
                  </div>
                )}

                {editingId === b.id ? (
                  <button onClick={saveEdit} className="rounded-md p-1.5 text-emerald-300 hover:bg-white/10">
                    <Check size={15} />
                  </button>
                ) : (
                  <button onClick={() => startEdit(b.id, b.name)} className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
                    <Pencil size={14} />
                  </button>
                )}
                <button
                  onClick={() => !isLast && deleteBoard(b.id)}
                  disabled={isLast}
                  title={isLast ? 'Mindestens ein Board muss bestehen bleiben' : 'Board löschen'}
                  className="rounded-md p-1.5 text-white/50 hover:bg-red-500/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
