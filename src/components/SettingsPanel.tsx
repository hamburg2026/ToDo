import { Check, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CARD_FONT_CLASSES, CARD_FONT_OPTIONS, CARD_FONT_SIZE_CLASSES, CARD_FONT_SIZE_OPTIONS, THEMES } from '../lib/constants'

interface Props {
  onClose: () => void
}

export default function SettingsPanel({ onClose }: Props) {
  const cardFont = useStore((s) => s.cardFont)
  const setCardFont = useStore((s) => s.setCardFont)
  const cardFontSize = useStore((s) => s.cardFontSize)
  const setCardFontSize = useStore((s) => s.setCardFontSize)
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl glass p-6 shadow-glow animate-pop-in"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Einstellungen</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Farbdesign</p>
        <p className="mb-3 text-sm text-white/60">Bestimmt die Akzentfarbe von Buttons, Hintergrund und Leuchteffekten.</p>

        <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {THEMES.map((t) => {
            const active = theme === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.label}
                className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-colors ${
                  active ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span
                  className="relative flex h-8 w-8 items-center justify-center rounded-full shadow-sm"
                  style={{ backgroundImage: `linear-gradient(135deg, ${t.accentFrom}, ${t.accentTo})` }}
                >
                  {active && <Check size={14} className="text-white drop-shadow" />}
                </span>
                <span className="text-[11px] text-white/60">{t.label}</span>
              </button>
            )
          })}
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Kartenschrift</p>
        <p className="mb-3 text-sm text-white/60">
          Bestimmt die Schriftart für die Aufgabentitel auf den Kacheln.
        </p>

        <div className="space-y-2">
          {CARD_FONT_OPTIONS.map((option) => {
            const active = cardFont === option.id
            return (
              <button
                key={option.id}
                onClick={() => setCardFont(option.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                  active ? 'border-violet-400 bg-violet-500/15' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div>
                  <p className={`${CARD_FONT_CLASSES[option.id]} text-xl font-bold text-white`}>Aufgabe erledigen</p>
                  <p className="mt-0.5 text-xs text-white/50">
                    {option.label} · {option.hint}
                  </p>
                </div>
                {active && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white">
                    <Check size={14} />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-white/50">Schriftgröße</p>
        <p className="mb-3 text-sm text-white/60">Bestimmt, wie groß Titel und Text auf den Kacheln erscheinen.</p>

        <div className="grid grid-cols-3 gap-2">
          {CARD_FONT_SIZE_OPTIONS.map((option) => {
            const active = cardFontSize === option.id
            return (
              <button
                key={option.id}
                onClick={() => setCardFontSize(option.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-colors ${
                  active ? 'border-violet-400 bg-violet-500/15' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className={`${CARD_FONT_CLASSES[cardFont]} ${CARD_FONT_SIZE_CLASSES[option.id].title} font-bold text-white`}>
                  Aa
                </span>
                <span className="text-xs text-white/60">{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
