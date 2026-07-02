import { useState } from 'react'
import { Plus, Trash2, X, Pencil, Check } from 'lucide-react'
import { useStore } from '../store/useStore'

interface Props {
  onClose: () => void
}

export default function PeopleManager({ onClose }: Props) {
  const people = useStore((s) => s.people)
  const tasks = useStore((s) => s.tasks)
  const addPerson = useStore((s) => s.addPerson)
  const updatePerson = useStore((s) => s.updatePerson)
  const deletePerson = useStore((s) => s.deletePerson)

  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addPerson(name.trim())
    setName('')
  }

  function startEdit(id: string, current: string) {
    setEditingId(id)
    setEditName(current)
  }

  function saveEdit() {
    if (editingId && editName.trim()) {
      updatePerson(editingId, { name: editName.trim() })
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
          <h2 className="text-lg font-bold text-white">Personen verwalten</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleAdd} className="mb-4 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name der Person"
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
          {people.length === 0 && (
            <p className="py-6 text-center text-sm text-white/40">Noch keine Personen angelegt.</p>
          )}
          {people.map((p) => {
            const count = tasks.filter((t) => t.assigneeId === p.id).length
            return (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: p.color }}
                >
                  {p.initials}
                </div>
                {editingId === p.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    className="flex-1 rounded-md border border-violet-400 bg-white/10 px-2 py-1 text-sm text-white outline-none"
                  />
                ) : (
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/90">{p.name}</p>
                    <p className="text-[11px] text-white/40">{count} Aufgabe{count === 1 ? '' : 'n'}</p>
                  </div>
                )}

                {editingId === p.id ? (
                  <button onClick={saveEdit} className="rounded-md p-1.5 text-emerald-300 hover:bg-white/10">
                    <Check size={15} />
                  </button>
                ) : (
                  <button onClick={() => startEdit(p.id, p.name)} className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
                    <Pencil size={14} />
                  </button>
                )}
                <button onClick={() => deletePerson(p.id)} className="rounded-md p-1.5 text-white/50 hover:bg-red-500/20 hover:text-red-300">
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
