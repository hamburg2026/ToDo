import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { hexToRgbTriplet, themeById } from '../lib/constants'

export function useApplyTheme() {
  const themeId = useStore((s) => s.theme)

  useEffect(() => {
    const theme = themeById(themeId)
    const root = document.documentElement.style
    root.setProperty('--accent-from', theme.accentFrom)
    root.setProperty('--accent-to', theme.accentTo)
    root.setProperty('--accent-rgb', hexToRgbTriplet(theme.accentFrom))
    root.setProperty('--aurora-from', theme.auroraFrom)
    root.setProperty('--aurora-to', theme.auroraTo)
  }, [themeId])
}
