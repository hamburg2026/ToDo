import { AlertTriangle } from 'lucide-react'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ title, message, confirmLabel = 'Bestätigen', danger, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-fade-in" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl glass p-6 shadow-glow animate-pop-in"
      >
        <div className="mb-3 flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${danger ? 'bg-rose-500/20 text-rose-300' : 'bg-violet-500/20 text-violet-300'}`}>
            <AlertTriangle size={17} />
          </div>
          <h2 className="text-base font-bold text-white">{title}</h2>
        </div>
        <p className="mb-5 text-sm leading-relaxed text-white/70">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105 ${
              danger ? 'bg-gradient-to-r from-rose-600 to-red-500' : 'accent-gradient'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
