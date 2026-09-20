import { useEffect, useRef, useState } from 'react'

// How far past the edge she has to drag before letting go moves her on.
export const REEL_THRESHOLD = 64
// The sheet follows the finger at less than 1:1 — the drag feels elastic
// rather than like the content has come loose.
const DAMP = 0.42
const MAX_PULL = 110
// scrollTop is fractional on some devices; treat "within 2px" as the edge.
const EDGE = 2

/** Live matchMedia, so the gesture is only wired up on phone-sized screens. */
export function useMediaQuery(query) {
  const read = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false
  const [matches, setMatches] = useState(read)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    on()
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [query])

  return matches
}

/**
 * Reels-style paging for a scrolling panel: drag up once you're at the bottom
 * to reach the next item, drag down at the top for the previous one.
 *
 * Returns the current overscroll in pixels — positive while she's pulling
 * toward the next item, negative toward the previous — for the caller to
 * render as movement.
 */
export function useReel({ bodyRef, enabled, onNext, onPrev, hasNext, hasPrev }) {
  const [pull, setPull] = useState(0)
  // The handlers are bound once per panel; read the moving parts off a ref so
  // a re-render (a new mug, a changed list) never has to rebind mid-drag.
  const live = useRef({ onNext, onPrev, hasNext, hasPrev })
  useEffect(() => {
    live.current = { onNext, onPrev, hasNext, hasPrev }
  })

  useEffect(() => {
    const node = bodyRef.current
    if (!node || !enabled) return

    // Where the finger started, and whether it started at an edge — a drag
    // that began mid-content just scrolls, however far it travels.
    let from = null
    let pulled = 0

    const atTop = () => node.scrollTop <= EDGE
    const atBottom = () => node.scrollTop + node.clientHeight >= node.scrollHeight - EDGE

    const start = (e) => {
      if (e.touches.length !== 1) {
        from = null
        return
      }
      from = { y: e.touches[0].clientY, top: atTop(), bottom: atBottom() }
      pulled = 0
    }

    const move = (e) => {
      if (!from || e.touches.length !== 1) return
      const dy = e.touches[0].clientY - from.y
      let next = 0
      if (dy < 0 && from.bottom && atBottom() && live.current.hasNext) {
        next = Math.min(-dy * DAMP, MAX_PULL)
      } else if (dy > 0 && from.top && atTop() && live.current.hasPrev) {
        next = -Math.min(dy * DAMP, MAX_PULL)
      }
      // Only swallow the touch once we're actually pulling, so ordinary
      // scrolling inside the panel is untouched.
      if (next !== 0 && e.cancelable) e.preventDefault()
      pulled = next
      setPull(next)
    }

    const end = () => {
      if (pulled >= REEL_THRESHOLD) live.current.onNext?.()
      else if (pulled <= -REEL_THRESHOLD) live.current.onPrev?.()
      from = null
      pulled = 0
      setPull(0)
    }

    node.addEventListener('touchstart', start, { passive: true })
    node.addEventListener('touchmove', move, { passive: false })
    node.addEventListener('touchend', end)
    node.addEventListener('touchcancel', end)
    return () => {
      node.removeEventListener('touchstart', start)
      node.removeEventListener('touchmove', move)
      node.removeEventListener('touchend', end)
      node.removeEventListener('touchcancel', end)
      setPull(0)
    }
  }, [bodyRef, enabled])

  return pull
}
