import { useEffect } from 'react'

// iOS Safari sometimes keeps the layout viewport it had *before* the app was
// backgrounded, even if the device is still (or again) in landscape when the
// app comes back to the foreground — until something forces a real
// orientation/viewport recalculation (which is why rotating the iPad and
// rotating it back "heals" it). Nudging the viewport meta tag's `content`
// attribute forces WebKit to reprocess the viewport without needing an
// actual rotation.
export function useFixStaleViewportOnResume() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]')
    if (!meta) return

    function nudgeViewport() {
      const original = meta!.getAttribute('content')
      if (!original) return
      meta!.setAttribute('content', `${original}, shrink-to-fit=no`)
      requestAnimationFrame(() => meta!.setAttribute('content', original))
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') nudgeViewport()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pageshow', nudgeViewport)
    window.addEventListener('focus', nudgeViewport)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pageshow', nudgeViewport)
      window.removeEventListener('focus', nudgeViewport)
    }
  }, [])
}
