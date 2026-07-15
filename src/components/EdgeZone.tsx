import { useDroppable } from '@dnd-kit/core'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Page } from '../types'

interface Props {
  side: 'left' | 'right'
  label: string
  active: boolean
  target: Page
  id?: string
  slot?: 'full' | 'top' | 'bottom'
}

export default function EdgeZone({ side, label, active, target, id, slot = 'full' }: Props) {
  // The droppable id stays stable across renders (based on side only, unless
  // an explicit `id` is given for a permanently fixed-target zone — e.g. the
  // two stacked zones shown on the Board page) so dnd-kit keeps a
  // continuously-measured rect for it; the actual destination page — which
  // can change while the same zone stays mounted, e.g. Pinnwand <-> "Heute
  // zu tun" — travels via `data` instead, read at drop time in App.tsx.
  // Re-keying the id itself caused the zone to silently stop registering
  // hits right after the target changed.
  const { setNodeRef, isOver } = useDroppable({
    id: id ?? `edge-nav-${side}`,
    data: { side, target },
    disabled: !active,
  })

  if (!active) return null

  const slotClasses = slot === 'top' ? 'top-0 h-1/2' : slot === 'bottom' ? 'top-1/2 h-1/2' : 'top-0 h-full'

  return (
    <div
      ref={setNodeRef}
      className={`fixed z-40 flex w-16 flex-col items-center justify-center gap-3 transition-all duration-200 ${slotClasses} ${
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
