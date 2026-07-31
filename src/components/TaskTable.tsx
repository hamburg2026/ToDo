import { useMemo, useState } from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown, Star, CalendarDays, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { COLUMNS, categoryColor, statusOption } from '../lib/constants'
import { formatDate, daysUntil } from '../lib/date'
import type { Task } from '../types'

type SortKey = 'title' | 'category' | 'assignee' | 'board' | 'status' | 'end'

interface Props {
  tasks: Task[]
  onEdit: (id: string) => void
  emptyMessage: string
  showBoard?: boolean
  showColumnSelector?: boolean
  showMoveTo?: boolean
  defaultSortKey?: SortKey
}

export default function TaskTable({ tasks, onEdit, emptyMessage, showBoard, showColumnSelector, showMoveTo, defaultSortKey = 'title' }: Props) {
  const people = useStore((s) => s.people)
  const boards = useStore((s) => s.boards)
  const categories = useStore((s) => s.categories)
  const deleteTask = useStore((s) => s.deleteTask)
  const moveTaskToColumn = useStore((s) => s.moveTaskToColumn)
  const moveTaskToBoard = useStore((s) => s.moveTaskToBoard)
  const sendTaskToPage = useStore((s) => s.sendTaskToPage)

  const [sortKey, setSortKey] = useState<SortKey>(defaultSortKey)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const rows = useMemo(() => {
    function sortValue(t: Task): string | number {
      switch (sortKey) {
        case 'title':
          return t.title.toLowerCase()
        case 'category':
          return (t.category || 'Ohne Kategorie').toLowerCase()
        case 'assignee':
          return (people.find((p) => p.id === t.assigneeId)?.name ?? '').toLowerCase()
        case 'board':
          return (boards.find((b) => b.id === t.boardId)?.name ?? '').toLowerCase()
        case 'status':
          return statusOption(t.status)?.label.toLowerCase() ?? ''
        case 'end':
          return t.end ?? '9999-99-99'
        default:
          return ''
      }
    }
    return tasks.slice().sort((a, b) => {
      const av = sortValue(a)
      const bv = sortValue(b)
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [tasks, sortKey, sortDir, people, boards])

  function SortHeader({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k
    return (
      <button
        type="button"
        onClick={() => toggleSort(k)}
        className={`flex items-center gap-1 text-left text-[11px] font-semibold uppercase tracking-wide ${
          active ? 'text-[#151f76]' : 'text-[#151f76]/50 hover:text-[#151f76]/75'
        }`}
      >
        {label}
        {active ? sortDir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} /> : <ArrowUpDown size={11} className="opacity-40" />}
      </button>
    )
  }

  if (tasks.length === 0) {
    return <p className="py-16 text-center text-sm text-[#151f76]/45">{emptyMessage}</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#151f76]/10 bg-white/70">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[#151f76]/10 bg-[#151f76]/4">
            <th className="px-4 py-2.5"><SortHeader label="Titel" k="title" /></th>
            <th className="px-4 py-2.5"><SortHeader label="Kategorie" k="category" /></th>
            <th className="px-4 py-2.5"><SortHeader label="Zuständigkeit" k="assignee" /></th>
            {showBoard && <th className="px-4 py-2.5"><SortHeader label="Board" k="board" /></th>}
            {showColumnSelector && <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#151f76]/50">Spalte</th>}
            <th className="px-4 py-2.5"><SortHeader label="Status" k="status" /></th>
            <th className="px-4 py-2.5"><SortHeader label="Fällig" k="end" /></th>
            {showMoveTo && <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#151f76]/50">Verschieben</th>}
            <th className="w-10 px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {rows.map((task) => {
            const assignee = people.find((p) => p.id === task.assigneeId)
            const board = boards.find((b) => b.id === task.boardId)
            const status = statusOption(task.status)
            const overdue = task.end && task.status !== 'erledigt' && daysUntil(task.end) < 0
            return (
              <tr
                key={task.id}
                onClick={() => onEdit(task.id)}
                className="cursor-pointer border-b border-[#151f76]/6 last:border-0 hover:bg-[#151f76]/4"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    {task.important && <Star size={13} className="shrink-0 fill-rose-500 text-rose-500" />}
                    {task.today && <CalendarDays size={13} className="shrink-0 text-[#151f76]/50" />}
                    <span className="font-medium text-[#151f76]">{task.title}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                    style={{ backgroundColor: categoryColor(task.category, categories) }}
                  >
                    {task.category || 'Ohne Kategorie'}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[#151f76]/75">
                  {assignee ? (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                        style={{ backgroundColor: assignee.color }}
                      >
                        {assignee.initials}
                      </span>
                      {assignee.name}
                    </span>
                  ) : (
                    <span className="text-[#151f76]/35">—</span>
                  )}
                </td>
                {showBoard && (
                  <td className="px-4 py-2.5 text-[#151f76]/75">
                    {board ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: board.color }} />
                        {board.name}
                      </span>
                    ) : (
                      <span className="text-[#151f76]/35">—</span>
                    )}
                  </td>
                )}
                {showColumnSelector && (
                  <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={task.columnId}
                      onChange={(e) => moveTaskToColumn(task.id, task.boardId as string, e.target.value as Task['columnId'])}
                      className="rounded-md border border-[#151f76]/10 bg-white px-2 py-1 text-xs text-[#151f76] outline-none focus:border-violet-400"
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
                <td className="px-4 py-2.5">
                  {status ? (
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{ backgroundColor: `${status.color}18`, color: status.color }}
                    >
                      {status.label}
                    </span>
                  ) : (
                    <span className="text-[#151f76]/35">—</span>
                  )}
                </td>
                <td className={`px-4 py-2.5 ${overdue ? 'font-semibold text-rose-600' : 'text-[#151f76]/75'}`}>
                  {task.end ? formatDate(task.end) : <span className="text-[#151f76]/35">—</span>}
                </td>
                {showMoveTo && (
                  <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <select
                      value=""
                      onChange={(e) => {
                        const target = e.target.value
                        if (!target) return
                        if (target === 'pinboard') {
                          sendTaskToPage(task.id, 'pinboard', { x: 80 + Math.random() * 600, y: 80 + Math.random() * 400 })
                        } else {
                          moveTaskToBoard(task.id, target)
                        }
                        e.target.value = ''
                      }}
                      className="rounded-md border border-[#151f76]/10 bg-white px-2 py-1 text-xs text-[#151f76] outline-none focus:border-violet-400"
                    >
                      <option value="">Verschieben…</option>
                      {task.page !== 'pinboard' && <option value="pinboard">Zur Pinnwand</option>}
                      {boards.filter((b) => b.id !== task.boardId).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
                <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="rounded-md p-1 text-[#151f76]/35 hover:bg-red-500/10 hover:text-red-600"
                    aria-label="Löschen"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
