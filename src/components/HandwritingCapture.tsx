import { useStore } from '../store/useStore'
import { CARD_COLORS, randomPick } from '../lib/constants'
import type { Page } from '../types'
import HandwritingOverlay from './HandwritingOverlay'

interface Props {
  onClose: () => void
  page?: Page
  boardId?: string | null
  defaultToday?: boolean
}

function splitIntoTitleAndDescription(raw: string): { title: string; description: string } {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length === 0) return { title: '', description: '' }
  return { title: lines[0].slice(0, 120), description: lines.slice(1).join('\n') }
}

export default function HandwritingCapture({ onClose, page, boardId, defaultToday }: Props) {
  const addTask = useStore((s) => s.addTask)

  function handleSave(raw: string) {
    const { title, description } = splitIntoTitleAndDescription(raw)
    if (!title) return
    addTask(
      {
        title,
        description,
        assigneeId: null,
        start: null,
        end: null,
        category: '',
        hashtags: [],
        checklist: [],
        today: defaultToday ?? false,
        important: false,
        status: 'none',
        color: randomPick(CARD_COLORS),
      },
      undefined,
      page,
      boardId,
    )
    onClose()
  }

  return (
    <HandwritingOverlay
      title="Handschriftlich erfassen"
      hint={
        <>
          Schreibe mit dem Apple&nbsp;Pencil direkt in das Feld – auf dem iPad wandelt <em>Scribble</em> deine
          Handschrift automatisch in Text um. Die erste Zeile wird zum Titel, alles danach zur Beschreibung.
        </>
      }
      placeholder={'Titel der Aufgabe …\nweitere Details in der zweiten Zeile'}
      confirmLabel="Kachel erstellen"
      onSave={handleSave}
      onClose={onClose}
    />
  )
}
