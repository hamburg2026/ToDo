import { CalendarRange, Pencil, Trash2 } from 'lucide-react'
import type { Task } from '../types'
import { useStore } from '../store/useStore'
import { categoryColor, CARD_FONT_CLASSES, CARD_FONT_SIZE_CLASSES } from '../lib/constants'
import { formatDate } from '../lib/date'

interface Props {
  task: Task
  dragging?: boolean
  compact?: boolean
  onEdit?: () => void
  dragHandleProps?: Record<string, unknown>
}

export default function TaskCard({ task, dragging, compact, onEdit, dragHandleProps }: Props) {
  const people = useStore((s) => s.people)
  const deleteTask = useStore((s) => s.deleteTask)
  const cardFont = useStore((s) => s.cardFont)
  const cardFontSize = useStore((s) => s.cardFontSize)
  const assignee = people.find((p) => p.id === task.assigneeId)
  const sizeClasses = CARD_FONT_SIZE_CLASSES[cardFontSize]

  return (
    <div
      {...dragHandleProps}
      className={`group relative w-64 select-none rounded-xl p-3.5 text-slate-900 shadow-card transition-shadow ${
        dragging ? 'shadow-glow ring-2 ring-white/60 scale-[1.03]' : 'hover:shadow-glow'
      } ${compact ? 'w-full' : ''}`}
      style={{
        background: `linear-gradient(155deg, ${task.color} 0%, ${task.color}cc 100%)`,
      }}
    >
      <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-white/70 shadow-sm ring-1 ring-black/10" />

      <div className="mb-1.5 flex items-start justify-between gap-2">
        <h3 className={`${CARD_FONT_CLASSES[cardFont]} ${sizeClasses.title} font-semibold leading-snug text-slate-900`}>{task.title}</h3>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.()
            }}
            className="rounded-md bg-white/50 p-1 hover:bg-white/80"
            aria-label="Bearbeiten"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteTask(task.id)
            }}
            className="rounded-md bg-white/50 p-1 hover:bg-red-200"
            aria-label="Löschen"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className={`mb-2 line-clamp-3 ${sizeClasses.description} leading-snug text-slate-800/80`}>{task.description}</p>
      )}

      {task.hashtags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {task.hashtags.map((tag) => (
            <span key={tag} className="rounded-full bg-white/45 px-2 py-0.5 text-[10px] font-medium text-slate-800">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm"
          style={{ backgroundColor: categoryColor(task.category) }}
        >
          {task.category || 'Ohne Kategorie'}
        </span>

        {assignee ? (
          <div
            title={assignee.name}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ring-2 ring-white/70"
            style={{ backgroundColor: assignee.color }}
          >
            {assignee.initials}
          </div>
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/40 text-[10px] text-slate-600 ring-2 ring-white/50">
            ?
          </div>
        )}
      </div>

      {(task.start || task.end) && (
        <div className="mt-2 flex items-center gap-1 text-[10.5px] font-medium text-slate-700/80">
          <CalendarRange size={12} />
          <span>
            {formatDate(task.start)}
            {task.end ? ` – ${formatDate(task.end)}` : ''}
          </span>
        </div>
      )}
    </div>
  )
}
