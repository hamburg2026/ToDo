import { useState } from 'react'
import { PenLine, X } from 'lucide-react'

interface Props {
  title: string
  hint: React.ReactNode
  initialValue?: string
  placeholder?: string
  confirmLabel: string
  onSave: (text: string) => void
  onClose: () => void
}

export default function HandwritingOverlay({
  title,
  hint,
  initialValue = '',
  placeholder,
  confirmLabel,
  onSave,
  onClose,
}: Props) {
  const [text, setText] = useState(initialValue)

  function handleSave() {
    if (!text.trim()) return
    onSave(text)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#151f76]/35 p-4 animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl glass p-6 shadow-glow animate-pop-in"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#151f76]">
            <PenLine size={18} className="text-violet-300" /> {title}
          </h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-[#151f76]/55 hover:bg-[#151f76]/6 hover:text-[#151f76]">
            <X size={18} />
          </button>
        </div>

        <p className="mb-3 text-sm leading-relaxed text-[#151f76]/65">{hint}</p>

        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              handleSave()
            }
          }}
          rows={7}
          placeholder={placeholder}
          className="w-full resize-none rounded-xl border border-[#151f76]/10 bg-white/95 px-4 py-3 text-lg leading-relaxed text-slate-900 placeholder-slate-400 shadow-inner outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#151f76]/75 hover:bg-[#151f76]/6"
          >
            Abbrechen
          </button>
          <button
            type="button"
            disabled={!text.trim()}
            onClick={handleSave}
            className="rounded-lg accent-gradient px-5 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
