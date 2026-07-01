import { useEffect, useState } from 'react'
import { X, Users, Hash } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CARD_COLORS, CATEGORIES } from '../lib/constants'
import type { Task } from '../types'

interface Props {
  taskId: string | null
  initialPosition?: { x: number; y: number }
  onClose: () => void
  onOpenPeople: () => void
}

export default function TaskModal({ taskId, initialPosition, onClose, onOpenPeople }: Props) {
  const task = useStore((s) => s.tasks.find((t) => t.id === taskId))
  const people = useStore((s) => s.people)
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
  const [color, setColor] = useState(CARD_COLORS[0])

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setAssigneeId(task.assigneeId)
      setStart(task.start ?? '')
      setEnd(task.end ?? '')
      setCategory(task.category)
      setHashtags(task.hashtags)
      setColor(task.color)
    } else {
      setTitle('')
      setDescription('')
      setAssigneeId(null)
      setStart('')
      setEnd('')
      setCategory('')
      setHashtags([])
      setColor(CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)])
    }
    setTagInput('')
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
      color,
    }
    if (task) {
      updateTask(task.id, payload as Partial<Task>)
    } else {
      addTask(payload, initialPosition)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl glass p-6 shadow-glow animate-pop-in"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{task ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">Titel</label>
            <input
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Was ist zu tun?"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Details, Kontext, Notizen…"
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide text-white/50">Zuständigkeit</label>
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
              >
                <option value="" className="bg-surface-800">Nicht zugewiesen</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id} className="bg-surface-800">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">Kategorie</label>
              <input
                list="category-options"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="z. B. Projekt"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
              />
              <datalist id="category-options">
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">Beginn</label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">Ende</label>
              <input
                type="date"
                value={end}
                min={start || undefined}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">Hashtags</label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-2 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-400/30">
              <Hash size={14} className="ml-1 text-white/30" />
              {hashtags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-violet-500/25 px-2 py-0.5 text-xs text-violet-100">
                  #{tag}
                  <button type="button" onClick={() => setHashtags(hashtags.filter((t) => t !== tag))} className="hover:text-white">
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
                className="min-w-[90px] flex-1 bg-transparent px-1 py-0.5 text-sm text-white placeholder-white/30 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">Kartenfarbe</label>
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

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
          >
            {task ? 'Speichern' : 'Erstellen'}
          </button>
        </div>
      </form>
    </div>
  )
}
