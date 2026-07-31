import { useState } from 'react'
import { Plus, Trash2, X, Pencil, Check, Play, Workflow, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../store/useStore'

interface Props {
  onClose: () => void
  onOpenPeople: () => void
}

export default function ProcessManager({ onClose, onOpenPeople }: Props) {
  const processTemplates = useStore((s) => s.processTemplates)
  const people = useStore((s) => s.people)
  const addProcessTemplate = useStore((s) => s.addProcessTemplate)
  const updateProcessTemplate = useStore((s) => s.updateProcessTemplate)
  const deleteProcessTemplate = useStore((s) => s.deleteProcessTemplate)
  const addProcessTask = useStore((s) => s.addProcessTask)
  const updateProcessTask = useStore((s) => s.updateProcessTask)
  const deleteProcessTask = useStore((s) => s.deleteProcessTask)
  const runProcess = useStore((s) => s.runProcess)

  const [name, setName] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const [editingProcessId, setEditingProcessId] = useState<string | null>(null)
  const [editProcessName, setEditProcessName] = useState('')

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editTaskTitle, setEditTaskTitle] = useState('')

  const [runningId, setRunningId] = useState<string | null>(null)
  const [runEmployeePersonId, setRunEmployeePersonId] = useState<string | null>(null)
  const [runStartDate, setRunStartDate] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const process = addProcessTemplate(name.trim())
    setName('')
    setExpandedId(process.id)
  }

  function startEditProcess(id: string, current: string) {
    setEditingProcessId(id)
    setEditProcessName(current)
  }

  function saveProcessEdit() {
    if (editingProcessId && editProcessName.trim()) {
      updateProcessTemplate(editingProcessId, { name: editProcessName.trim() })
    }
    setEditingProcessId(null)
  }

  function handleAddTask(processId: string, e: React.FormEvent) {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    addProcessTask(processId, newTaskTitle.trim())
    setNewTaskTitle('')
  }

  function startEditTask(id: string, current: string) {
    setEditingTaskId(id)
    setEditTaskTitle(current)
  }

  function saveTaskEdit(processId: string) {
    if (editingTaskId && editTaskTitle.trim()) {
      updateProcessTask(processId, editingTaskId, { title: editTaskTitle.trim() })
    }
    setEditingTaskId(null)
  }

  function startRun(processId: string) {
    setRunningId(processId)
    setRunEmployeePersonId(null)
    setRunStartDate('')
  }

  function handleRun(processId: string, e: React.FormEvent) {
    e.preventDefault()
    if (!runStartDate || !runEmployeePersonId) return
    runProcess(processId, { employeePersonId: runEmployeePersonId, startDate: runStartDate })
    setRunningId(null)
    onClose()
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-dvh items-center justify-center bg-[#151f76]/35 p-4 animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl glass p-6 shadow-glow animate-pop-in"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#151f76]">Prozesse verwalten</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-[#151f76]/55 hover:bg-[#151f76]/6 hover:text-[#151f76]">
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-sm text-[#151f76]/65">
          Lege Prozessvorlagen mit wiederkehrenden Aufgaben an, z.&nbsp;B. für die Einstellung neuer Mitarbeiter.
          Beim Ausführen werden alle Aufgaben der Vorlage neu angelegt, mit Fälligkeit relativ zum Startdatum.
        </p>

        <form onSubmit={handleAdd} className="mb-4 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name des Prozesses"
            className="flex-1 rounded-lg border border-[#151f76]/10 bg-[#151f76]/4 px-3 py-2 text-[#151f76] placeholder-[#151f76]/35 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg accent-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
          >
            <Plus size={16} /> Hinzufügen
          </button>
        </form>

        <div className="space-y-2">
          {processTemplates.length === 0 && (
            <p className="py-6 text-center text-sm text-[#151f76]/50">Noch keine Prozesse angelegt.</p>
          )}
          {processTemplates.map((process) => {
            const expanded = expandedId === process.id
            const running = runningId === process.id
            return (
              <div key={process.id} className="rounded-xl border border-[#151f76]/10 bg-[#151f76]/4 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">
                    <Workflow size={16} />
                  </div>
                  {editingProcessId === process.id ? (
                    <input
                      autoFocus
                      value={editProcessName}
                      onChange={(e) => setEditProcessName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveProcessEdit()}
                      className="flex-1 rounded-md border border-violet-400 bg-[#151f76]/6 px-2 py-1 text-sm text-[#151f76] outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : process.id)}
                      className="flex flex-1 items-center gap-1.5 text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#151f76]">{process.name}</p>
                        <p className="text-[11px] text-[#151f76]/50">
                          {process.tasks.length} Aufgabe{process.tasks.length === 1 ? '' : 'n'}
                        </p>
                      </div>
                      {expanded ? <ChevronUp size={14} className="text-[#151f76]/40" /> : <ChevronDown size={14} className="text-[#151f76]/40" />}
                    </button>
                  )}

                  {editingProcessId === process.id ? (
                    <button onClick={saveProcessEdit} className="rounded-md p-1.5 text-emerald-600 hover:bg-[#151f76]/6">
                      <Check size={15} />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => startRun(process.id)}
                        disabled={process.tasks.length === 0}
                        title={process.tasks.length === 0 ? 'Prozess hat noch keine Aufgaben' : 'Prozess ausführen'}
                        className="flex items-center gap-1 rounded-full accent-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-glow transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
                      >
                        <Play size={12} /> Ausführen
                      </button>
                      <button onClick={() => startEditProcess(process.id, process.name)} className="rounded-md p-1.5 text-[#151f76]/55 hover:bg-[#151f76]/6 hover:text-[#151f76]">
                        <Pencil size={14} />
                      </button>
                    </>
                  )}
                  <button onClick={() => deleteProcessTemplate(process.id)} className="rounded-md p-1.5 text-[#151f76]/55 hover:bg-red-500/20 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>

                {expanded && (
                  <div className="mt-2.5 space-y-1.5 border-t border-[#151f76]/10 pt-2.5">
                    {process.tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-2">
                        {editingTaskId === task.id ? (
                          <input
                            autoFocus
                            value={editTaskTitle}
                            onChange={(e) => setEditTaskTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveTaskEdit(process.id)}
                            onBlur={() => saveTaskEdit(process.id)}
                            className="min-w-0 flex-1 rounded-md border border-violet-400 bg-white/70 px-1.5 py-1 text-sm text-[#151f76] outline-none"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditTask(task.id, task.title)}
                            className="min-w-0 flex-1 truncate text-left text-sm text-[#151f76] hover:text-violet-400"
                          >
                            {task.title}
                          </button>
                        )}
                        <input
                          type="number"
                          min={0}
                          value={task.offsetWeeks}
                          onChange={(e) => updateProcessTask(process.id, task.id, { offsetWeeks: Math.max(0, Number(e.target.value) || 0) })}
                          className="w-14 shrink-0 rounded-md border border-[#151f76]/10 bg-white/70 px-1.5 py-1 text-center text-xs text-[#151f76] outline-none focus:border-violet-400"
                        />
                        <span className="shrink-0 text-[11px] text-[#151f76]/45">Wo.</span>
                        <input
                          type="number"
                          min={0}
                          value={task.offsetDays}
                          onChange={(e) => updateProcessTask(process.id, task.id, { offsetDays: Math.max(0, Number(e.target.value) || 0) })}
                          className="w-14 shrink-0 rounded-md border border-[#151f76]/10 bg-white/70 px-1.5 py-1 text-center text-xs text-[#151f76] outline-none focus:border-violet-400"
                        />
                        <span className="shrink-0 text-[11px] text-[#151f76]/45">Tg. vorher</span>
                        <button
                          type="button"
                          onClick={() => deleteProcessTask(process.id, task.id)}
                          className="shrink-0 text-[#151f76]/35 hover:text-rose-500"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                    <form onSubmit={(e) => handleAddTask(process.id, e)} className="flex items-center gap-2 pt-0.5">
                      <Plus size={14} className="shrink-0 text-[#151f76]/35" />
                      <input
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Aufgabe hinzufügen + Enter"
                        className="min-w-0 flex-1 bg-transparent px-0 py-1 text-sm text-[#151f76] placeholder-[#151f76]/35 outline-none"
                      />
                    </form>
                  </div>
                )}

                {running && (
                  <form
                    onSubmit={(e) => handleRun(process.id, e)}
                    className="mt-2.5 space-y-2.5 border-t border-[#151f76]/10 pt-2.5"
                  >
                    <div>
                      <div className="mb-1 flex items-center justify-between gap-1">
                        <label className="text-[11px] font-semibold uppercase tracking-wide text-[#151f76]/55">
                          Neuer Mitarbeiter (Board-Name)
                        </label>
                        <button
                          type="button"
                          onClick={onOpenPeople}
                          className="flex items-center gap-1 text-[11px] font-medium text-violet-300 hover:text-violet-200"
                        >
                          <Users size={12} /> Verwalten
                        </button>
                      </div>
                      <select
                        required
                        value={runEmployeePersonId ?? ''}
                        onChange={(e) => setRunEmployeePersonId(e.target.value || null)}
                        className="w-full rounded-lg border border-[#151f76]/10 bg-white/70 px-3 py-2 text-sm text-[#151f76] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
                      >
                        <option value="" disabled className="bg-white">Person auswählen…</option>
                        {people.map((p) => (
                          <option key={p.id} value={p.id} className="bg-white">
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[11px] text-[#151f76]/45">
                        Legt ein neues Board mit diesem Namen an; alle Aufgaben landen direkt darin.
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#151f76]/55">
                        Starttermin
                      </label>
                      <input
                        required
                        type="date"
                        value={runStartDate}
                        onChange={(e) => setRunStartDate(e.target.value)}
                        className="w-full rounded-lg border border-[#151f76]/10 bg-white/70 px-3 py-2 text-sm text-[#151f76] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setRunningId(null)}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#151f76]/75 hover:bg-[#151f76]/6"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 rounded-lg accent-gradient px-4 py-1.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
                      >
                        <Play size={13} /> Board mit {process.tasks.length} Aufgabe{process.tasks.length === 1 ? '' : 'n'} anlegen
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
