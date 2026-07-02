import { useDroppable } from '@dnd-kit/core'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  side: 'left' | 'right'
  label: string
  active: boolean
}

export default function EdgeZone({ side, label, active }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `edge-nav-${side}`,
    data: { side },
    disabled: !active,
  })

  if (!active) return null

  return (
    <div
      ref={setNodeRef}
      className={`fixed top-0 z-40 flex h-full w-16 flex-col items-center justify-center gap-3 transition-all duration-200 ${
        side === 'right' ? 'right-0' : 'left-0'
      } ${isOver ? 'w-28 bg-gradient-to-l from-violet-600/40 to-transparent' : 'bg-transparent'}`}
      style={side === 'left' ? { backgroundImage: isOver ? 'linear-gradient(to right, rgba(0,115,210,0.4), transparent)' : undefined } : undefined}
    >
      <div
        className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 transition-all ${
          isOver
            ? 'scale-110 border-violet-300/70 bg-violet-500/30 shadow-glow animate-pulse-edge'
            : 'border-[#151f76]/10 bg-[#151f76]/4'
        }`}
      >
        {side === 'right' ? (
          <ChevronRight size={20} className="text-[#151f76]/75" />
        ) : (
          <ChevronLeft size={20} className="text-[#151f76]/75" />
        )}
        <span
          className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-[#151f76]/75"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          {label}
        </span>
        {side === 'right' ? (
          <ChevronRight size={20} className="text-[#151f76]/75" />
        ) : (
          <ChevronLeft size={20} className="text-[#151f76]/75" />
        )}
      </div>
    </div>
  )
}
