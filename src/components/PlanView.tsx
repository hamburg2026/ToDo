import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { categoryColor } from '../lib/constants'
import { parseLocalDate } from '../lib/date'

interface Props {
  onEdit: (id: string) => void
}

const DAY_MS = 24 * 60 * 60 * 1000
const DAY_WIDTH = 44

function startOfDay(d: Date) {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

export default function PlanView({ onEdit }: Props) {
  const tasks = useStore((s) => s.tasks).filter((t) => t.page === 'board')
  const people = useStore((s) => s.people)

  const scheduled = tasks.filter((t) => t.start)
  const unscheduled = tasks.filter((t) => !t.start)

  const { days, rangeStart } = useMemo(() => {
    const today = startOfDay(new Date())
    let min = today
    let max = new Date(today.getTime() + 21 * DAY_MS)
    scheduled.forEach((t) => {
      const s = startOfDay(parseLocalDate(t.start as string))
      const e = t.end ? startOfDay(parseLocalDate(t.end as string)) : s
      if (s < min) min = s
      if (e > max) max = e
    })
    min = new Date(min.getTime() - 2 * DAY_MS)
    max = new Date(max.getTime() + 2 * DAY_MS)
    const dayCount = Math.max(14, Math.round((max.getTime() - min.getTime()) / DAY_MS))
    return {
      rangeStart: min,
      days: Array.from({ length: dayCount }, (_, i) => new Date(min.getTime() + i * DAY_MS)),
    }
  }, [scheduled])

  const todayIndex = Math.round((startOfDay(new Date()).getTime() - rangeStart.getTime()) / DAY_MS)

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden pl-20 pr-6 py-6">
      <div className="flex-1 overflow-auto rounded-2xl glass">
        <div style={{ width: 220 + days.length * DAY_WIDTH }}>
          {/* Header */}
          <div className="sticky top-0 z-10 flex border-b border-white/10 bg-surface-800/90 backdrop-blur">
            <div className="w-[220px] shrink-0 border-r border-white/10 px-4 py-3 text-sm font-semibold text-white/70">
              Aufgabe
            </div>
            <div className="flex">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`flex w-11 shrink-0 flex-col items-center border-r border-white/5 py-2 text-[10px] ${
                    i === todayIndex ? 'bg-violet-500/20 text-violet-200' : 'text-white/40'
                  } ${d.getDay() === 0 || d.getDay() === 6 ? 'bg-white/[0.03]' : ''}`}
                >
                  <span className="uppercase">{d.toLocaleDateString('de-DE', { weekday: 'short' })}</span>
                  <span className="font-semibold">{d.getDate()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          {scheduled.map((task) => {
            const s = startOfDay(parseLocalDate(task.start as string))
            const e = task.end ? startOfDay(parseLocalDate(task.end as string)) : s
            const offset = Math.max(0, Math.round((s.getTime() - rangeStart.getTime()) / DAY_MS))
            const span = Math.max(1, Math.round((e.getTime() - s.getTime()) / DAY_MS) + 1)
            const assignee = people.find((p) => p.id === task.assigneeId)
            return (
              <div key={task.id} className="flex border-b border-white/5 hover:bg-white/[0.03]">
                <div className="flex w-[220px] shrink-0 items-center gap-2 border-r border-white/10 px-4 py-3">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: categoryColor(task.category) }}
                  />
                  <span className="truncate text-sm text-white/85">{task.title}</span>
                </div>
                <div className="relative flex" style={{ width: days.length * DAY_WIDTH }}>
                  {days.map((d, i) => (
                    <div
                      key={i}
                      className={`w-11 shrink-0 border-r border-white/5 ${
                        i === todayIndex ? 'bg-violet-500/10' : ''
                      } ${d.getDay() === 0 || d.getDay() === 6 ? 'bg-white/[0.03]' : ''}`}
                    />
                  ))}
                  <button
                    onClick={() => onEdit(task.id)}
                    className="absolute top-1/2 flex -translate-y-1/2 items-center gap-1.5 truncate rounded-full px-3 py-1.5 text-left text-[11px] font-semibold text-white shadow-md transition-transform hover:scale-[1.02]"
                    style={{
                      left: offset * DAY_WIDTH + 4,
                      width: span * DAY_WIDTH - 8,
                      backgroundColor: task.color,
                      color: '#1e1e2f',
                    }}
                    title={task.title}
                  >
                    {assignee && (
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
                        style={{ backgroundColor: assignee.color }}
                      >
                        {assignee.initials}
                      </span>
                    )}
                    <span className="truncate">{task.title}</span>
                  </button>
                </div>
              </div>
            )
          })}

          {scheduled.length === 0 && (
            <div className="flex h-32 items-center justify-center text-sm text-white/30">
              Keine terminierten Aufgaben im Board. Vergib Start-/Enddatum in der Aufgabe.
            </div>
          )}
        </div>
      </div>

      {unscheduled.length > 0 && (
        <div className="rounded-2xl glass p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">Ohne Termin</p>
          <div className="flex flex-wrap gap-2">
            {unscheduled.map((task) => (
              <button
                key={task.id}
                onClick={() => onEdit(task.id)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-transform hover:scale-105"
                style={{ backgroundColor: task.color, color: '#1e1e2f' }}
              >
                {task.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
