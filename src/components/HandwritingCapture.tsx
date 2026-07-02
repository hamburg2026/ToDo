import { useStore } from '../store/useStore'
import { CARD_COLORS, randomPick } from '../lib/constants'
import HandwritingOverlay from './HandwritingOverlay'

interface Props {
  onClose: () => void
}

function splitIntoTitleAndDescription(raw: string): { title: string; description: string } {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length === 0) return { title: '', description: '' }
  return { title: lines[0].slice(0, 120), description: lines.slice(1).join('\n') }
}

export default function HandwritingCapture({ onClose }: Props) {
  const addTask = useStore((s) => s.addTask)

  function handleSave(raw: string) {
    const { title, description } = splitIntoTitleAndDescription(raw)
    if (!title) return
    addTask({
      title,
      description,
      assigneeId: null,
      start: null,
      end: null,
      category: '',
      hashtags: [],
      today: false,
      important: false,
      color: randomPick(CARD_COLORS),
    })
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
