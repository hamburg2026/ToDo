import { AlertTriangle, Hash, LayoutDashboard, PinIcon, Users, X } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store/useStore'
import { COLUMNS, categoryColor } from '../lib/constants'
import { formatDate, daysUntil } from '../lib/date'
import type { Task } from '../types'

interface Props {
  onEdit: (id: string) => void
}

function isOverdue(task: Task): boolean {
  if (!task.end) return false
  return task.status !== 'erledigt' && daysUntil(task.end) < 0
}

interface BarRowProps {
  icon?: React.ReactNode
  label: string
  count: number
  max: number
  color: string
  onClick?: () => void
}

function BarRow({ icon, label, count, max, color, onClick }: BarRowProps) {
  const pct = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 0
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick || count === 0}
      className="flex w-full items-center gap-3 rounded-lg py-0.5 text-left transition-colors enabled:hover:bg-[#151f76]/5 disabled:cursor-default"
    >
      {icon}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="truncate text-sm text-[#151f76]/85">{label}</span>
          <span className="text-sm font-semibold text-[#151f76]">{count}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#151f76]/6">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </div>
    </button>
  )
}

interface TaskDetail {
  title: string
  tasks: Task[]
}

function TaskDetailModal({
  detail,
  onEdit,
  onClose,
}: {
  detail: TaskDetail
  onEdit: (id: string) => void
  onClose: () => void
}) {
  const people = useStore((s) => s.people)
  const boards = useStore((s) => s.boards)
  const categories = useStore((s) => s.categories)

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-dvh items-center justify-center bg-[#151f76]/35 p-4 animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl glass p-6 shadow-glow animate-pop-in"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-[#151f76]">{detail.title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-[#151f76]/55 hover:bg-[#151f76]/6 hover:text-[#151f76]">
            <X size={18} />
          </button>
        </div>

        {detail.tasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#151f76]/45">Keine Aufgaben gefunden.</p>
        ) : (
          <div className="space-y-2">
            {detail.tasks.map((task) => {
              const assignee = people.find((p) => p.id === task.assigneeId)
              const board = boards.find((b) => b.id === task.boardId)
              return (
                <button
                  key={task.id}
                  onClick={() => {
                    onEdit(task.id)
                    onClose()
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-[#151f76]/10 bg-[#151f76]/4 px-4 py-3 text-left transition-colors hover:bg-[#151f76]/8"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: categoryColor(task.category, categories) }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#151f76]">{task.title}</span>
                  {board && <span className="shrink-0 text-xs text-[#151f76]/50">{board.name}</span>}
                  {task.end && <span className="shrink-0 text-xs text-[#151f76]/50">{formatDate(task.end)}</span>}
                  {assignee && (
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ backgroundColor: assignee.color }}
                    >
                      {assignee.initials}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatTile({ label, value, tone }: { label: string; value: number; tone?: 'danger' | 'default' }) {
  return (
    <div className="rounded-2xl glass p-4">
      <p className={`text-3xl font-extrabold ${tone === 'danger' && value > 0 ? 'text-rose-500' : 'text-[#151f76]'}`}>{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#151f76]/55">{label}</p>
    </div>
  )
}

export default function AnalyticsView({ onEdit }: Props) {
  const allTasks = useStore((s) => s.tasks)
  const tasks = allTasks.filter((t) => !t.archived)
  const archivedCount = allTasks.filter((t) => t.archived).length
  const people = useStore((s) => s.people)
  const boards = useStore((s) => s.boards)
  const categories = useStore((s) => s.categories)
  const [detail, setDetail] = useState<TaskDetail | null>(null)

  const doneCount = tasks.filter((t) => t.status === 'erledigt').length
  const todayTasks = tasks.filter((t) => t.page === 'board' && t.today)
  const overdue = tasks.filter(isOverdue).sort((a, b) => daysUntil(a.end as string) - daysUntil(b.end as string))

  const personCounts = [
    ...people.map((p) => ({ key: p.id, label: p.name, color: p.color, matching: tasks.filter((t) => t.assigneeId === p.id) })),
    { key: 'none', label: 'Nicht zugewiesen', color: '#64748b', matching: tasks.filter((t) => !t.assigneeId) },
  ].sort((a, b) => b.matching.length - a.matching.length)
  const maxPersonCount = Math.max(1, ...personCounts.map((p) => p.matching.length))

  // "Heute zu tun" is a cross-cutting flag on board tasks, not a distinct
  // location, so it's surfaced as its own stat tile below rather than as a
  // bucket here — a bucket here would double-count tasks against their board.
  const boardCounts = [
    { key: 'pinboard', label: 'Pinnwand', color: '#94a3b8', matching: tasks.filter((t) => t.page === 'pinboard') },
    ...boards.map((b) => ({ key: b.id, label: b.name, color: b.color, matching: tasks.filter((t) => t.page === 'board' && t.boardId === b.id) })),
  ].sort((a, b) => b.matching.length - a.matching.length)
  const maxBoardCount = Math.max(1, ...boardCounts.map((b) => b.matching.length))

  const columnCounts = COLUMNS.map((c) => ({
    key: c.id,
    label: c.title,
    color: c.accent,
    matching: tasks.filter((t) => t.page === 'board' && t.columnId === c.id),
  }))
  const maxColumnCount = Math.max(1, ...columnCounts.map((c) => c.matching.length))

  const categoryCounts = (() => {
    const map = new Map<string, Task[]>()
    tasks.forEach((t) => {
      const key = t.category?.trim() || 'Ohne Kategorie'
      map.set(key, [...(map.get(key) ?? []), t])
    })
    return Array.from(map.entries())
      .map(([label, matching]) => ({ key: label, label, matching, color: categoryColor(label, categories) }))
      .sort((a, b) => b.matching.length - a.matching.length)
  })()
  const maxCategoryCount = Math.max(1, ...categoryCounts.map((c) => c.matching.length))

  const hashtagCounts = (() => {
    const map = new Map<string, Task[]>()
    tasks.forEach((t) => {
      t.hashtags.forEach((tag) => {
        map.set(tag, [...(map.get(tag) ?? []), t])
      })
    })
    return Array.from(map.entries())
      .map(([label, matching]) => ({ key: label, label: `#${label}`, matching, color: '#0073d2' }))
      .sort((a, b) => b.matching.length - a.matching.length)
  })()
  const maxHashtagCount = Math.max(1, ...hashtagCounts.map((h) => h.matching.length))

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pl-6 pr-24 py-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <StatTile label="Gesamt Aufgaben" value={tasks.length} />
        <StatTile label="Heute" value={todayTasks.length} />
        <StatTile label="Überfällig" value={overdue.length} tone="danger" />
        <StatTile label="Erledigt" value={doneCount} />
        <StatTile label="Archiviert" value={archivedCount} />
        <StatTile label="Personen" value={people.length} />
        <StatTile label="Boards" value={boards.length} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl glass p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#151f76]">
            <Users size={15} /> Aufgaben pro Person
          </h2>
          <div className="space-y-3">
            {personCounts.map((p) => (
              <BarRow
                key={p.key}
                icon={
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.label === 'Nicht zugewiesen' ? '?' : p.label.slice(0, 1).toUpperCase()}
                  </span>
                }
                label={p.label}
                count={p.matching.length}
                max={maxPersonCount}
                color={p.color}
                onClick={() => setDetail({ title: `Aufgaben von ${p.label}`, tasks: p.matching })}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl glass p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#151f76]">
            <LayoutDashboard size={15} /> Aufgaben pro Board
          </h2>
          <div className="space-y-3">
            {boardCounts.map((b) => (
              <BarRow
                key={b.key}
                icon={
                  b.key === 'pinboard' ? (
                    <PinIcon size={14} className="shrink-0 text-[#151f76]/50" />
                  ) : (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: b.color }} />
                  )
                }
                label={b.label}
                count={b.matching.length}
                max={maxBoardCount}
                color={b.color}
                onClick={() => setDetail({ title: `Aufgaben: ${b.label}`, tasks: b.matching })}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl glass p-5">
          <h2 className="mb-4 text-sm font-bold text-[#151f76]">Status-Verteilung</h2>
          <div className="space-y-3">
            {columnCounts.map((c) => (
              <BarRow
                key={c.key}
                label={c.label}
                count={c.matching.length}
                max={maxColumnCount}
                color={c.color}
                onClick={() => setDetail({ title: `Status: ${c.label}`, tasks: c.matching })}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl glass p-5">
          <h2 className="mb-4 text-sm font-bold text-[#151f76]">Kategorien</h2>
          <div className="space-y-3">
            {categoryCounts.length === 0 && <p className="text-sm text-[#151f76]/50">Noch keine Aufgaben.</p>}
            {categoryCounts.map((c) => (
              <BarRow
                key={c.key}
                label={c.label}
                count={c.matching.length}
                max={maxCategoryCount}
                color={c.color}
                onClick={() => setDetail({ title: `Kategorie: ${c.label}`, tasks: c.matching })}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl glass p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#151f76]">
          <Hash size={15} /> Aufgaben pro Hashtag
        </h2>
        <div className="space-y-3">
          {hashtagCounts.length === 0 && <p className="text-sm text-[#151f76]/50">Noch keine Hashtags vergeben.</p>}
          {hashtagCounts.map((h) => (
            <BarRow
              key={h.key}
              label={h.label}
              count={h.matching.length}
              max={maxHashtagCount}
              color={h.color}
              onClick={() => setDetail({ title: h.label, tasks: h.matching })}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl glass p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#151f76]">
          <AlertTriangle size={15} className="text-rose-500" /> Überfällige Aufgaben
        </h2>
        {overdue.length === 0 ? (
          <p className="text-sm text-[#151f76]/50">Keine überfälligen Aufgaben. 🎉</p>
        ) : (
          <div className="space-y-2">
            {overdue.map((task) => {
              const assignee = people.find((p) => p.id === task.assigneeId)
              const board = boards.find((b) => b.id === task.boardId)
              const daysLate = Math.abs(daysUntil(task.end as string))
              return (
                <button
                  key={task.id}
                  onClick={() => onEdit(task.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-left transition-colors hover:bg-rose-500/10"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: categoryColor(task.category, categories) }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#151f76]">{task.title}</span>
                  {board && <span className="shrink-0 text-xs text-[#151f76]/50">{board.name}</span>}
                  {assignee && (
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ backgroundColor: assignee.color }}
                    >
                      {assignee.initials}
                    </span>
                  )}
                  <span className="shrink-0 rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                    {formatDate(task.end)} · {daysLate} {daysLate === 1 ? 'Tag' : 'Tage'} überfällig
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {detail && <TaskDetailModal detail={detail} onEdit={onEdit} onClose={() => setDetail(null)} />}
    </div>
  )
}
