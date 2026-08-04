import { useState } from 'react'
import { nanoid } from 'nanoid'
import {
  Plus,
  Trash2,
  X,
  Pencil,
  Check,
  Play,
  Workflow,
  Users,
  Tag,
  Hash,
  ChevronDown,
  ChevronUp,
  Settings2,
  AlignLeft,
  ListChecks,
  Star,
  Flag,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { categoryColor, STATUS_OPTIONS } from '../lib/constants'
import type { ChecklistItem } from '../types'

interface Props {
  onClose: () => void
}

export default function ProcessManager({ onClose }: Props) {
  const processTemplates = useStore((s) => s.processTemplates)
  const people = useStore((s) => s.people)
  const categories = useStore((s) => s.categories)
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

  const [taskDetailId, setTaskDetailId] = useState<string | null>(null)
  const [taskTagInput, setTaskTagInput] = useState('')
  const [taskChecklistInput, setTaskChecklistInput] = useState('')
  const [editingChecklistItemId, setEditingChecklistItemId] = useState<string | null>(null)
  const [editingChecklistText, setEditingChecklistText] = useState('')

  const [runningId, setRunningId] = useState<string | null>(null)
  const [runBoardName, setRunBoardName] = useState('')
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

  function toggleTaskDetail(taskId: string) {
    setTaskDetailId((v) => (v === taskId ? null : taskId))
    setTaskTagInput('')
    setTaskChecklistInput('')
    setEditingChecklistItemId(null)
  }

  function findTask(processId: string, taskId: string) {
    return processTemplates.find((p) => p.id === processId)?.tasks.find((t) => t.id === taskId)
  }

  function addChecklistItem(processId: string, taskId: string) {
    const clean = taskChecklistInput.trim()
    if (!clean) return
    const task = findTask(processId, taskId)
    if (task) updateProcessTask(processId, taskId, { checklist: [...task.checklist, { id: nanoid(), text: clean, done: false }] })
    setTaskChecklistInput('')
  }

  function handleChecklistKeyDown(processId: string, taskId: string, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addChecklistItem(processId, taskId)
    }
  }

  function toggleChecklistItem(processId: string, taskId: string, itemId: string) {
    const task = findTask(processId, taskId)
    if (task) updateProcessTask(processId, taskId, { checklist: task.checklist.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) })
  }

  function removeChecklistItem(processId: string, taskId: string, itemId: string) {
    const task = findTask(processId, taskId)
    if (task) updateProcessTask(processId, taskId, { checklist: task.checklist.filter((i) => i.id !== itemId) })
  }

  function startEditChecklistItem(item: ChecklistItem) {
    setEditingChecklistItemId(item.id)
    setEditingChecklistText(item.text)
  }

  function commitChecklistItemEdit(processId: string, taskId: string) {
    if (!editingChecklistItemId) return
    const clean = editingChecklistText.trim()
    const task = findTask(processId, taskId)
    if (task && clean) {
      updateProcessTask(processId, taskId, {
        checklist: task.checklist.map((i) => (i.id === editingChecklistItemId ? { ...i, text: clean } : i)),
      })
    }
    setEditingChecklistItemId(null)
  }

  function handleChecklistEditKeyDown(processId: string, taskId: string, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitChecklistItemEdit(processId, taskId)
    } else if (e.key === 'Escape') {
      setEditingChecklistItemId(null)
    }
  }

  function commitTaskTag(processId: string, taskId: string) {
    const clean = taskTagInput.trim().replace(/^#/, '').replace(/\s+/g, '-')
    if (clean) {
      const task = processTemplates.find((p) => p.id === processId)?.tasks.find((t) => t.id === taskId)
      if (task && !task.hashtags.includes(clean)) {
        updateProcessTask(processId, taskId, { hashtags: [...task.hashtags, clean] })
      }
    }
    setTaskTagInput('')
  }

  function removeTaskTag(processId: string, taskId: string, tag: string) {
    const task = processTemplates.find((p) => p.id === processId)?.tasks.find((t) => t.id === taskId)
    if (task) updateProcessTask(processId, taskId, { hashtags: task.hashtags.filter((t) => t !== tag) })
  }

  function startRun(processId: string, defaultName: string) {
    setRunningId(processId)
    setRunBoardName(defaultName)
    setRunStartDate('')
  }

  function handleRun(processId: string, e: React.FormEvent) {
    e.preventDefault()
    if (!runStartDate || !runBoardName.trim()) return
    runProcess(processId, { boardName: runBoardName.trim(), startDate: runStartDate })
    setRunningId(null)
    onClose()
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-dvh items-center justify-center bg-[#151f76]/35 p-4 animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85dvh] w-full max-w-xl overflow-y-auto rounded-2xl glass p-6 shadow-glow animate-pop-in"
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
                        onClick={() => startRun(process.id, process.name)}
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
                    {process.tasks.map((task) => {
                      const taskAssignee = people.find((p) => p.id === task.assigneeId)
                      const detailOpen = taskDetailId === task.id
                      return (
                        <div key={task.id} className="rounded-lg border border-[#151f76]/8 bg-white/40 px-2 py-1.5">
                          <div className="flex items-center gap-1.5">
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
                            {task.important && <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" />}
                            {taskAssignee && (
                              <span
                                title={taskAssignee.name}
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                                style={{ backgroundColor: taskAssignee.color }}
                              >
                                {taskAssignee.initials}
                              </span>
                            )}
                            {task.category && (
                              <span
                                className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white"
                                style={{ backgroundColor: categoryColor(task.category, categories) }}
                              >
                                {task.category}
                              </span>
                            )}
                            {task.hashtags.length > 0 && (
                              <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-[#151f76]/45">
                                <Hash size={10} /> {task.hashtags.length}
                              </span>
                            )}
                            {task.checklist.length > 0 && (
                              <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-[#151f76]/45">
                                <ListChecks size={10} /> {task.checklist.filter((i) => i.done).length}/{task.checklist.length}
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
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
                              onClick={() => toggleTaskDetail(task.id)}
                              title="Standardwerte bearbeiten"
                              className={`ml-auto shrink-0 rounded-md p-1 ${detailOpen ? 'bg-violet-500/20 text-violet-400' : 'text-[#151f76]/35 hover:text-violet-400'}`}
                            >
                              <Settings2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProcessTask(process.id, task.id)}
                              className="shrink-0 text-[#151f76]/35 hover:text-rose-500"
                            >
                              <X size={13} />
                            </button>
                          </div>

                          {detailOpen && (
                            <div className="mt-2 space-y-2 border-t border-[#151f76]/10 pt-2">
                              <div>
                                <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#151f76]/50">
                                  <AlignLeft size={11} /> Beschreibung
                                </label>
                                <textarea
                                  value={task.description}
                                  onChange={(e) => updateProcessTask(process.id, task.id, { description: e.target.value })}
                                  rows={2}
                                  placeholder="Details, Kontext, Notizen…"
                                  className="w-full resize-none rounded-md border border-[#151f76]/10 bg-white/70 px-2 py-1.5 text-sm text-[#151f76] placeholder-[#151f76]/35 outline-none focus:border-violet-400"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => updateProcessTask(process.id, task.id, { important: !task.important })}
                                  className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-sm transition-colors ${
                                    task.important
                                      ? 'border-amber-400 bg-amber-400/15 text-amber-600'
                                      : 'border-[#151f76]/10 bg-white/70 text-[#151f76]/60 hover:border-amber-300'
                                  }`}
                                >
                                  <Star size={13} className={task.important ? 'fill-amber-400' : ''} />
                                  Wichtig
                                </button>
                                <div className="flex flex-1 items-center gap-1.5">
                                  <Flag size={11} className="shrink-0 text-[#151f76]/50" />
                                  <select
                                    value={task.status}
                                    onChange={(e) => updateProcessTask(process.id, task.id, { status: e.target.value as typeof task.status })}
                                    className="w-full rounded-md border border-[#151f76]/10 bg-white/70 px-2 py-1.5 text-sm text-[#151f76] outline-none focus:border-violet-400"
                                  >
                                    <option value="none">Kein Status</option>
                                    {STATUS_OPTIONS.map((s) => (
                                      <option key={s.id} value={s.id}>
                                        {s.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#151f76]/50">
                                  <Users size={11} /> Standard-Zuständigkeit
                                </label>
                                <select
                                  value={task.assigneeId ?? ''}
                                  onChange={(e) => updateProcessTask(process.id, task.id, { assigneeId: e.target.value || null })}
                                  className="w-full rounded-md border border-[#151f76]/10 bg-white/70 px-2 py-1.5 text-sm text-[#151f76] outline-none focus:border-violet-400"
                                >
                                  <option value="">Nicht zugewiesen</option>
                                  {people.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#151f76]/50">
                                  <Tag size={11} /> Standard-Kategorie
                                </label>
                                <input
                                  value={task.category}
                                  onChange={(e) => updateProcessTask(process.id, task.id, { category: e.target.value })}
                                  placeholder="z. B. Projekt"
                                  className="w-full rounded-md border border-[#151f76]/10 bg-white/70 px-2 py-1.5 text-sm text-[#151f76] placeholder-[#151f76]/35 outline-none focus:border-violet-400"
                                />
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {categories.map((c) => (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => updateProcessTask(process.id, task.id, { category: c.name })}
                                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white transition-transform hover:scale-105"
                                      style={{ backgroundColor: categoryColor(c.name, categories), opacity: task.category === c.name ? 1 : 0.55 }}
                                    >
                                      {c.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#151f76]/50">
                                  <Hash size={11} /> Standard-Hashtags
                                </label>
                                <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-[#151f76]/10 bg-white/70 px-2 py-1.5 focus-within:border-violet-400">
                                  {task.hashtags.map((tag) => (
                                    <span key={tag} className="flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-500">
                                      #{tag}
                                      <button type="button" onClick={() => removeTaskTag(process.id, task.id, tag)} className="hover:text-violet-700">
                                        <X size={11} />
                                      </button>
                                    </span>
                                  ))}
                                  <input
                                    value={taskTagInput}
                                    onChange={(e) => setTaskTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ',') {
                                        e.preventDefault()
                                        commitTaskTag(process.id, task.id)
                                      }
                                    }}
                                    onBlur={() => commitTaskTag(process.id, task.id)}
                                    placeholder="tag + Enter"
                                    className="min-w-[80px] flex-1 bg-transparent px-1 py-0.5 text-sm text-[#151f76] placeholder-[#151f76]/35 outline-none"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#151f76]/50">
                                  <ListChecks size={11} /> Standard-Checkliste
                                </label>
                                <div className="space-y-1 rounded-md border border-[#151f76]/10 bg-white/70 p-1.5">
                                  {task.checklist.map((item) => (
                                    <div key={item.id} className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => toggleChecklistItem(process.id, task.id, item.id)}
                                        aria-label={item.done ? 'Erledigt' : 'Offen'}
                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                          item.done ? 'border-violet-400 bg-violet-400 text-white' : 'border-[#151f76]/25 text-transparent hover:border-violet-400'
                                        }`}
                                      >
                                        <Check size={10} />
                                      </button>
                                      {editingChecklistItemId === item.id ? (
                                        <input
                                          autoFocus
                                          value={editingChecklistText}
                                          onChange={(e) => setEditingChecklistText(e.target.value)}
                                          onKeyDown={(e) => handleChecklistEditKeyDown(process.id, task.id, e)}
                                          onBlur={() => commitChecklistItemEdit(process.id, task.id)}
                                          className="min-w-0 flex-1 rounded-md border border-violet-400 bg-white/70 px-1.5 py-0.5 text-sm text-[#151f76] outline-none"
                                        />
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => startEditChecklistItem(item)}
                                          className={`min-w-0 flex-1 truncate text-left text-sm ${item.done ? 'text-[#151f76]/40 line-through' : 'text-[#151f76]'}`}
                                        >
                                          {item.text}
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => removeChecklistItem(process.id, task.id, item.id)}
                                        className="shrink-0 text-[#151f76]/35 hover:text-rose-500"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ))}
                                  <div className="flex items-center gap-1.5 pt-0.5">
                                    <Plus size={13} className="shrink-0 text-[#151f76]/35" />
                                    <input
                                      value={taskChecklistInput}
                                      onChange={(e) => setTaskChecklistInput(e.target.value)}
                                      onKeyDown={(e) => handleChecklistKeyDown(process.id, task.id, e)}
                                      onBlur={() => addChecklistItem(process.id, task.id)}
                                      placeholder="Punkt hinzufügen + Enter"
                                      className="min-w-0 flex-1 bg-transparent px-0 py-0.5 text-sm text-[#151f76] placeholder-[#151f76]/35 outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
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
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#151f76]/55">
                        Boardname
                      </label>
                      <input
                        required
                        autoFocus
                        value={runBoardName}
                        onChange={(e) => setRunBoardName(e.target.value)}
                        placeholder="z. B. Max Mustermann"
                        className="w-full rounded-lg border border-[#151f76]/10 bg-white/70 px-3 py-2 text-sm text-[#151f76] placeholder-[#151f76]/35 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
                      />
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
