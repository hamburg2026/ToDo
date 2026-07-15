import { CalendarDays, CalendarRange, Check, ChevronDown, ChevronUp, Star, Trash2 } from 'lucide-react'
import type { Task } from '../types'
import { useStore } from '../store/useStore'
import { categoryColor, statusOption, CARD_FONT_CLASSES, CARD_FONT_SIZE_CLASSES } from '../lib/constants'
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
  const categories = useStore((s) => s.categories)
  const deleteTask = useStore((s) => s.deleteTask)
  const updateTask = useStore((s) => s.updateTask)
  const toggleChecklistItem = useStore((s) => s.toggleChecklistItem)
  const cardFont = useStore((s) => s.cardFont)
  const cardFontSize = useStore((s) => s.cardFontSize)
  const sectionState = useStore((s) => s.cardSectionState[task.id])
  const setCardSectionOpen = useStore((s) => s.setCardSectionOpen)
  const assignee = people.find((p) => p.id === task.assigneeId)
  const sizeClasses = CARD_FONT_SIZE_CLASSES[cardFontSize]
  const descOpen = sectionState?.details ?? true
  const checklistOpen = sectionState?.checklist ?? true
  const status = task.status && task.status !== 'none' ? statusOption(task.status) : null
  const checklist = task.checklist ?? []
  const checklistDone = checklist.filter((i) => i.done).length
  const isPonturo = task.category?.trim().toLowerCase() === 'ponturo'

  return (
    <div
      {...dragHandleProps}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onEdit?.()
      }}
      className={`group relative w-64 select-none rounded-xl p-3.5 text-slate-900 shadow-card transition-shadow ${
        dragging ? 'shadow-glow ring-2 ring-white/60 scale-[1.03]' : 'hover:shadow-glow'
      } ${compact ? 'w-full' : ''}`}
      style={{
        background: `linear-gradient(155deg, ${task.color} 0%, ${task.color}cc 100%)`,
      }}
    >
      <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-white/70 shadow-sm ring-1 ring-black/10" />

      {isPonturo && (
        <div className="pointer-events-none absolute -left-2.5 -top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/10">
          <img src={`${import.meta.env.BASE_URL}brand/ponturo-icon.svg`} alt="" className="h-5 w-5" />
        </div>
      )}

      {status && (
        <div
          className="pointer-events-none absolute -top-2.5 -right-2.5 z-10 rotate-6 select-none rounded-md border-2 bg-white/85 px-1.5 py-0.5 text-[9px] font-extrabold uppercase leading-none tracking-wider shadow-sm"
          style={{ borderColor: status.color, color: status.color }}
        >
          {status.label}
        </div>
      )}

      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-1.5">
          {(task.important || task.today) && (
            <span className="mt-0.5 flex shrink-0 items-center gap-1">
              {task.important && <Star size={13} className="fill-rose-600 text-rose-600" />}
              {task.today && <CalendarDays size={13} className="text-slate-700" />}
            </span>
          )}
          <h3 className={`${CARD_FONT_CLASSES[cardFont]} ${sizeClasses.title} font-medium leading-snug text-slate-900`}>{task.title}</h3>
        </div>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {task.page === 'board' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                updateTask(task.id, { today: !task.today })
              }}
              onDoubleClick={(e) => e.stopPropagation()}
              className={`rounded-md p-1 ${task.today ? 'bg-white/70 text-slate-900' : 'bg-white/50 hover:bg-white/70'}`}
              aria-label={task.today ? 'Nicht mehr für heute markieren' : 'Für heute markieren'}
              title={task.today ? 'Nicht mehr für heute markieren' : 'Für heute markieren'}
            >
              <CalendarDays size={13} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteTask(task.id)
            }}
            onDoubleClick={(e) => e.stopPropagation()}
            className="rounded-md bg-white/50 p-1 hover:bg-red-200"
            aria-label="Löschen"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {task.description && (
        <div className="mb-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setCardSectionOpen(task.id, 'details', !descOpen)
            }}
            onDoubleClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-slate-700/70 hover:text-slate-900"
          >
            {descOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            <span className="text-[10px] font-semibold uppercase tracking-wide">Details</span>
          </button>
          {descOpen && (
            <p className={`mt-1 ${sizeClasses.description} leading-snug text-slate-800/80`}>{task.description}</p>
          )}
        </div>
      )}

      {checklist.length > 0 && (
        <div className="mb-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setCardSectionOpen(task.id, 'checklist', !checklistOpen)
            }}
            onDoubleClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-slate-700/70 hover:text-slate-900"
          >
            {checklistOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              Checkliste ({checklistDone}/{checklist.length})
            </span>
          </button>
          {checklistOpen && (
            <div className="mt-1 space-y-1">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleChecklistItem(task.id, item.id)
                  }}
                  onDoubleClick={(e) => e.stopPropagation()}
                  className="flex w-full items-center gap-1.5 text-left"
                >
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${
                      item.done ? 'border-slate-800/70 bg-slate-800/70 text-white' : 'border-slate-700/40 text-transparent'
                    }`}
                  >
                    <Check size={9} />
                  </span>
                  <span className={`${sizeClasses.description} ${item.done ? 'text-slate-700/50 line-through' : 'text-slate-800/85'}`}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
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
          style={{ backgroundColor: categoryColor(task.category, categories) }}
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
