import { useEffect, useState } from 'react'
import { nanoid } from 'nanoid'
import { X, Users, Hash, PenLine, CalendarDays, Star, Check, ChevronDown, ChevronUp, Plus, ListChecks, Tag } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CARD_COLORS, STATUS_OPTIONS, categoryColor } from '../lib/constants'
import type { ChecklistItem, Page, Task, TaskStatus } from '../types'
import HandwritingOverlay from './HandwritingOverlay'

interface Props {
  taskId: string | null
  initialPosition?: { x: number; y: number }
  targetPage?: Page
  targetBoardId?: string | null
  onClose: () => void
  onOpenPeople: () => void
  onOpenCategories: () => void
}

export default function TaskModal({ taskId, initialPosition, targetPage, targetBoardId, onClose, onOpenPeople, onOpenCategories }: Props) {
  const task = useStore((s) => s.tasks.find((t) => t.id === taskId))
  const people = useStore((s) => s.people)
  const categories = useStore((s) => s.categories)
  const addTask = useStore((s) => s.addTask)
  const updateTask = useStore((s) => s.updateTask)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [category, setCategory] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [checklistInput, setChecklistInput] = useState('')
  const [checklistOpen, setChecklistOpen] = useState(false)
  const [color, setColor] = useState(CARD_COLORS[0])
  const [today, setToday] = useState(false)
  const [important, setImportant] = useState(false)
  const [status, setStatus] = useState<TaskStatus>('none')
  const [handwritingOpen, setHandwritingOpen] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setAssigneeId(task.assigneeId)
      setStart(task.start ?? '')
      setEnd(task.end ?? '')
      setCategory(task.category)
      setHashtags(task.hashtags)
      setChecklist(task.checklist ?? [])
      setChecklistOpen((task.checklist ?? []).length > 0)
      setColor(task.color)
      setToday(task.today ?? false)
      setImportant(task.important ?? false)
      setStatus(task.status ?? 'none')
    } else {
      setTitle('')
      setDescription('')
      setAssigneeId(null)
      setStart('')
      setEnd('')
      setCategory('')
      setHashtags([])
      setChecklist([])
      setChecklistOpen(false)
      setColor(CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)])
      setToday(false)
      setImportant(false)
      setStatus('none')
    }
    setTagInput('')
    setChecklistInput('')
  }, [task, taskId])

  function commitTag() {
    const clean = tagInput.trim().replace(/^#/, '').replace(/\s+/g, '-')
    if (clean && !hashtags.includes(clean)) {
      setHashtags([...hashtags, clean])
    }
    setTagInput('')
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitTag()
    } else if (e.key === 'Backspace' && !tagInput && hashtags.length > 0) {
      setHashtags(hashtags.slice(0, -1))
    }
  }

  function addChecklistItem() {
    const clean = checklistInput.trim()
    if (!clean) return
    setChecklist([...checklist, { id: nanoid(), text: clean, done: false }])
    setChecklistInput('')
  }

  function handleChecklistKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addChecklistItem()
    } else if (e.key === 'Backspace' && !checklistInput && checklist.length > 0) {
      setChecklist(checklist.slice(0, -1))
    }
  }

  function toggleChecklistItem(id: string) {
    setChecklist(checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  function removeChecklistItem(id: string) {
    setChecklist(checklist.filter((item) => item.id !== id))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const payload = {
      title: title.trim(),
      description: description.trim(),
      assigneeId,
      start: start || null,
      end: end || null,
      category: category.trim(),
      hashtags,
      checklist,
      color,
      today,
      important,
      status,
    }
    if (task) {
      updateTask(task.id, payload as Partial<Task>)
    } else {
      addTask(payload, initialPosition, targetPage, targetBoardId)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#151f76]/35 p-4 animate-fade-in" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="flex max-h-[88vh] w-full max-w-lg flex-col rounded-2xl glass shadow-glow animate-pop-in"
      >
        <div className="flex shrink-0 items-center justify-between px-6 pb-4 pt-6">
          <h2 className="text-lg font-bold text-[#151f76]">{task ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-[#151f76]/55 hover:bg-[#151f76]/6 hover:text-[#151f76]">
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#151f76]/55">Titel</label>
            <input
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Was ist zu tun?"
              className="w-full rounded-lg border border-[#151f76]/10 bg-[#151f76]/4 px-3 py-2 text-[#151f76] placeholder-[#151f76]/35 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#151f76]/55">Beschreibung</label>
              <button
                type="button"
                onClick={() => setHandwritingOpen(true)}
                className="flex items-center gap-1 text-[11px] font-medium text-violet-300 hover:text-violet-200"
              >
                <PenLine size={12} /> Handschrift
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Details, Kontext, Notizen…"
              className="w-full resize-none rounded-lg border border-[#151f76]/10 bg-[#151f76]/4 px-3 py-2 text-[#151f76] placeholder-[#151f76]/35 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setChecklistOpen((v) => !v)}
              className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#151f76]/55 hover:text-[#151f76]/80"
            >
              {checklistOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              <ListChecks size={13} />
              Checkliste
              {checklist.length > 0 && (
                <span className="normal-case text-[#151f76]/40">
                  ({checklist.filter((i) => i.done).length}/{checklist.length})
                </span>
              )}
            </button>
            {checklistOpen && (
              <div className="space-y-1.5 rounded-lg border border-[#151f76]/10 bg-[#151f76]/4 p-2">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleChecklistItem(item.id)}
                      aria-label={item.done ? 'Erledigt' : 'Offen'}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        item.done ? 'border-violet-400 bg-violet-400 text-white' : 'border-[#151f76]/25 text-transparent hover:border-violet-400'
                      }`}
                    >
                      <Check size={12} />
                    </button>
                    <span className={`flex-1 text-sm ${item.done ? 'text-[#151f76]/40 line-through' : 'text-[#151f76]'}`}>
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(item.id)}
                      className="shrink-0 text-[#151f76]/35 hover:text-rose-500"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-0.5">
                  <Plus size={14} className="shrink-0 text-[#151f76]/35" />
                  <input
                    value={checklistInput}
                    onChange={(e) => setChecklistInput(e.target.value)}
                    onKeyDown={handleChecklistKeyDown}
                    onBlur={addChecklistItem}
                    placeholder="Punkt hinzufügen + Enter"
                    className="min-w-0 flex-1 bg-transparent px-0 py-0.5 text-sm text-[#151f76] placeholder-[#151f76]/35 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#151f76]/55">Zuständigkeit</label>
                <button
                  type="button"
                  onClick={onOpenPeople}
                  className="flex items-center gap-1 text-[11px] font-medium text-violet-300 hover:text-violet-200"
                >
                  <Users size={12} /> Verwalten
                </button>
              </div>
              <select
                value={assigneeId ?? ''}
                onChange={(e) => setAssigneeId(e.target.value || null)}
                className="w-full rounded-lg border border-[#151f76]/10 bg-[#151f76]/4 px-3 py-2 text-[#151f76] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
              >
                <option value="" className="bg-white">Nicht zugewiesen</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <div className="mb-1 flex items-center justify-between gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#151f76]/55">Kategorie</label>
                <button
                  type="button"
                  onClick={onOpenCategories}
                  className="flex items-center gap-1 text-[11px] font-medium text-violet-300 hover:text-violet-200"
                >
                  <Tag size={12} /> Verwalten
                </button>
              </div>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="z. B. Projekt"
                className="w-full rounded-lg border border-[#151f76]/10 bg-[#151f76]/4 px-3 py-2 text-[#151f76] placeholder-[#151f76]/35 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.name)}
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white transition-transform hover:scale-105"
                    style={{ backgroundColor: categoryColor(c.name, categories), opacity: category === c.name ? 1 : 0.55 }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="min-w-0">
              <div className="mb-1 flex items-center justify-between gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#151f76]/55">Beginn</label>
                {start && (
                  <button
                    type="button"
                    onClick={() => setStart('')}
                    className="flex items-center gap-0.5 text-[11px] font-medium text-violet-300 hover:text-violet-200"
                  >
                    <X size={11} /> Zurücksetzen
                  </button>
                )}
              </div>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full min-w-0 rounded-lg border border-[#151f76]/10 bg-[#151f76]/4 px-3 py-2 text-[#151f76] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
              />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex items-center justify-between gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#151f76]/55">Ende</label>
                {end && (
                  <button
                    type="button"
                    onClick={() => setEnd('')}
                    className="flex items-center gap-0.5 text-[11px] font-medium text-violet-300 hover:text-violet-200"
                  >
                    <X size={11} /> Zurücksetzen
                  </button>
                )}
              </div>
              <input
                type="date"
                value={end}
                min={start || undefined}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full min-w-0 rounded-lg border border-[#151f76]/10 bg-[#151f76]/4 px-3 py-2 text-[#151f76] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#151f76]/55">Hashtags</label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#151f76]/10 bg-[#151f76]/4 px-2 py-2 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-400/30">
              <Hash size={14} className="ml-1 text-[#151f76]/40" />
              {hashtags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-violet-500/25 px-2 py-0.5 text-xs text-violet-100">
                  #{tag}
                  <button type="button" onClick={() => setHashtags(hashtags.filter((t) => t !== tag))} className="hover:text-[#151f76]">
                    <X size={11} />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={commitTag}
                placeholder="tag + Enter"
                className="min-w-[90px] flex-1 bg-transparent px-1 py-0.5 text-sm text-[#151f76] placeholder-[#151f76]/35 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#151f76]/55">Kennzeichnung</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setToday((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  today
                    ? 'border-violet-400 bg-violet-500/15 text-[#151f76]'
                    : 'border-[#151f76]/10 bg-[#151f76]/4 text-[#151f76]/65 hover:bg-[#151f76]/6'
                }`}
              >
                <CalendarDays size={14} />
                Heute
              </button>
              <button
                type="button"
                onClick={() => setImportant((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  important
                    ? 'border-rose-400 bg-rose-500/15 text-rose-700'
                    : 'border-[#151f76]/10 bg-[#151f76]/4 text-[#151f76]/65 hover:bg-[#151f76]/6'
                }`}
              >
                <Star size={14} className={important ? 'fill-rose-600' : ''} />
                Wichtig
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#151f76]/55">Status</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setStatus('none')}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  status === 'none'
                    ? 'border-[#151f76]/30 bg-[#151f76]/8 text-[#151f76]'
                    : 'border-[#151f76]/10 bg-[#151f76]/4 text-[#151f76]/55 hover:bg-[#151f76]/6'
                }`}
              >
                Kein Status
              </button>
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setStatus(option.id)}
                  className="rounded-full border px-3 py-1.5 text-sm font-semibold transition-transform hover:scale-105"
                  style={
                    status === option.id
                      ? { borderColor: option.color, backgroundColor: `${option.color}22`, color: option.color }
                      : { borderColor: `${option.color}33`, backgroundColor: 'transparent', color: `${option.color}99` }
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#151f76]/55">Kartenfarbe</label>
            <div className="flex gap-2">
              {CARD_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Farbe ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-[#151f76]/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#151f76]/75 hover:bg-[#151f76]/6"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            className="rounded-lg accent-gradient px-5 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
          >
            {task ? 'Speichern' : 'Erstellen'}
          </button>
        </div>
      </form>

      {handwritingOpen && (
        <HandwritingOverlay
          title="Beschreibung handschriftlich"
          hint={
            <>
              Schreibe mit dem Apple&nbsp;Pencil direkt in das Feld – auf dem iPad wandelt <em>Scribble</em> deine
              Handschrift automatisch in Text um.
            </>
          }
          initialValue={description}
          placeholder="Details, Kontext, Notizen…"
          confirmLabel="Übernehmen"
          onSave={(text) => {
            setDescription(text)
            setHandwritingOpen(false)
          }}
          onClose={() => setHandwritingOpen(false)}
        />
      )}
    </div>
  )
}
