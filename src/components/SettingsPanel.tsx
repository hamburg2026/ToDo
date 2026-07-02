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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#151f76]/35 p-4 animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl glass p-6 shadow-glow animate-pop-in"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#151f76]">Einstellungen</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-[#151f76]/55 hover:bg-[#151f76]/6 hover:text-[#151f76]">
            <X size={18} />
          </button>
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#151f76]/55">Farbdesign</p>
        <p className="mb-3 text-sm text-[#151f76]/65">Bestimmt die Akzentfarbe von Buttons, Hintergrund und Leuchteffekten.</p>

        <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {THEMES.map((t) => {
            const active = theme === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.label}
                className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-colors ${
                  active ? 'border-[#151f76]/30 bg-[#151f76]/6' : 'border-[#151f76]/10 bg-[#151f76]/4 hover:bg-[#151f76]/6'
                }`}
              >
                <span
                  className="relative flex h-8 w-8 items-center justify-center rounded-full shadow-sm"
                  style={{ backgroundImage: `linear-gradient(135deg, ${t.accentFrom}, ${t.accentTo})` }}
                >
                  {active && <Check size={14} className="text-white drop-shadow" />}
                </span>
                <span className="text-[11px] text-[#151f76]/65">{t.label}</span>
              </button>
            )
          })}
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#151f76]/55">Kartenschrift</p>
        <p className="mb-3 text-sm text-[#151f76]/65">
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
                  active ? 'border-violet-400 bg-violet-500/15' : 'border-[#151f76]/10 bg-[#151f76]/4 hover:bg-[#151f76]/6'
                }`}
              >
                <div>
                  <p className={`${CARD_FONT_CLASSES[option.id]} text-xl font-semibold text-[#151f76]`}>Aufgabe erledigen</p>
                  <p className="mt-0.5 text-xs text-[#151f76]/55">
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

        <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-[#151f76]/55">Schriftgröße</p>
        <p className="mb-3 text-sm text-[#151f76]/65">Bestimmt, wie groß Titel und Text auf den Kacheln erscheinen.</p>

        <div className="grid grid-cols-3 gap-2">
          {CARD_FONT_SIZE_OPTIONS.map((option) => {
            const active = cardFontSize === option.id
            return (
              <button
                key={option.id}
                onClick={() => setCardFontSize(option.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-colors ${
                  active ? 'border-violet-400 bg-violet-500/15' : 'border-[#151f76]/10 bg-[#151f76]/4 hover:bg-[#151f76]/6'
                }`}
              >
                <span className={`${CARD_FONT_CLASSES[cardFont]} ${CARD_FONT_SIZE_CLASSES[option.id].title} font-semibold text-[#151f76]`}>
                  Aa
                </span>
                <span className="text-xs text-[#151f76]/65">{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
