import { useState } from 'react'
import { PenLine, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CARD_COLORS, randomPick } from '../lib/constants'

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
  const [text, setText] = useState('')

  function handleCreate() {
    const { title, description } = splitIntoTitleAndDescription(text)
    if (!title) return
    addTask({
      title,
      description,
      assigneeId: null,
      start: null,
      end: null,
      category: '',
      hashtags: [],
      color: randomPick(CARD_COLORS),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl glass p-6 shadow-glow animate-pop-in"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <PenLine size={18} className="text-violet-300" /> Handschriftlich erfassen
          </h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <p className="mb-3 text-sm leading-relaxed text-white/60">
          Schreibe mit dem Apple&nbsp;Pencil direkt in das Feld – auf dem iPad wandelt <em>Scribble</em> deine
          Handschrift automatisch in Text um. Die erste Zeile wird zum Titel, alles danach zur Beschreibung.
        </p>

        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              handleCreate()
            }
          }}
          rows={7}
          placeholder="Titel der Aufgabe …&#10;weitere Details in der zweiten Zeile"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/95 px-4 py-3 text-lg leading-relaxed text-slate-900 placeholder-slate-400 shadow-inner outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10"
          >
            Abbrechen
          </button>
          <button
            type="button"
            disabled={!text.trim()}
            onClick={handleCreate}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            Kachel erstellen
          </button>
        </div>
      </div>
    </div>
  )
}
