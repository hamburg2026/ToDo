import { Minus, Plus } from 'lucide-react'

interface Props {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export default function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset }: Props) {
  return (
    <div className="fixed bottom-8 right-8 z-30 flex items-center gap-0.5 rounded-full glass p-1 shadow-card">
      <button
        onClick={onZoomOut}
        aria-label="Verkleinern"
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#151f76]/70 transition-colors hover:bg-[#151f76]/8 hover:text-[#151f76]"
      >
        <Minus size={15} />
      </button>
      <button
        onClick={onReset}
        title="Zoom zurücksetzen"
        className="min-w-[3.25rem] rounded-full px-2 py-1.5 text-center text-xs font-semibold text-[#151f76]/70 transition-colors hover:bg-[#151f76]/8 hover:text-[#151f76]"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={onZoomIn}
        aria-label="Vergrößern"
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#151f76]/70 transition-colors hover:bg-[#151f76]/8 hover:text-[#151f76]"
      >
        <Plus size={15} />
      </button>
    </div>
  )
}
