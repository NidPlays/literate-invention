import { useCallback, useEffect, useState } from 'react'
import catalog from '../data/catalog.json'
import { BRANDS } from '../data/brands.js'

export const PRODUCTS = catalog.filter((p) => BRANDS[p.brand])

export const VIBES = [...new Set(PRODUCTS.flatMap((p) => p.vibes))].sort()

export const PRICE_MAX = Math.max(...PRODUCTS.map((p) => p.price))

export const rupees = (n) => '₹' + n.toLocaleString('en-IN')

export function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // private mode / blocked storage — the shop still works, it just forgets.
    }
  }, [key, value])
  return [value, setValue]
}

export function useBag() {
  const [lines, setLines] = useStored('mugstreet.bag', [])

  const add = useCallback(
    (id, qty = 1) =>
      setLines((prev) => {
        const found = prev.find((l) => l.id === id)
        if (found) return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l))
        return [...prev, { id, qty }]
      }),
    [setLines],
  )
  const setQty = useCallback(
    (id, qty) =>
      setLines((prev) =>
        qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
      ),
    [setLines],
  )
  const clear = useCallback(() => setLines([]), [setLines])

  const detailed = lines
    .map((l) => ({ ...l, product: PRODUCTS.find((p) => p.id === l.id) }))
    .filter((l) => l.product)
  const count = detailed.reduce((n, l) => n + l.qty, 0)
  const total = detailed.reduce((n, l) => n + l.qty * l.product.price, 0)

  return { lines: detailed, add, setQty, clear, count, total }
}

const SORTS = {
  love: (a, b) => b.love - a.love,
  low: (a, b) => a.price - b.price,
  high: (a, b) => b.price - a.price,
  name: (a, b) => a.title.localeCompare(b.title),
}

// A stable pseudo-random "most loved" order, so the grid isn't just brand-by-brand.
const loved = new Map(PRODUCTS.map((p, i) => [p.id, ((i * 2654435761) % 1000) / 1000]))

export function filterProducts({ query, brands, vibes, maxPrice, sort, onlyHearted, hearted }) {
  const q = query.trim().toLowerCase()
  const rows = PRODUCTS.filter((p) => {
    if (brands.length && !brands.includes(p.brand)) return false
    if (vibes.length && !p.vibes.some((v) => vibes.includes(v))) return false
    if (maxPrice && p.price > maxPrice) return false
    if (onlyHearted && !hearted.includes(p.id)) return false
    if (!q) return true
    const hay = `${p.title} ${BRANDS[p.brand].name} ${p.vibes.join(' ')} ${p.blurb}`.toLowerCase()
    return q.split(/\s+/).every((word) => hay.includes(word))
  }).map((p) => ({ ...p, love: loved.get(p.id) ?? 0 }))

  return rows.sort(SORTS[sort] || SORTS.love)
}
