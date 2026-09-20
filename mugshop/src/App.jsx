import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Ticker from './components/Ticker.jsx'
import ProductCard from './components/ProductCard.jsx'
import ProductSheet from './components/ProductSheet.jsx'
import BagDrawer from './components/BagDrawer.jsx'
import PicksScreen from './components/PicksScreen.jsx'
import { BRANDS, BRAND_ORDER, OTHER_STUDIOS } from './data/brands.js'
import { filterProducts, PRICE_MAX, PRODUCTS, SOLD_OUT_COUNT, rupees, useBag, useStored, VIBES } from './lib/shop.js'
import { HER_NAME, LOVE_NOTES, SECRET_NOTE } from './config.js'

const PAGE = 24

export default function App() {
  const [query, setQuery] = useState('')
  const [brands, setBrands] = useState([])
  const [vibes, setVibes] = useState([])
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX)
  const [sort, setSort] = useState('love')
  const [onlyHearted, setOnlyHearted] = useState(false)
  const [hideSoldOut, setHideSoldOut] = useState(false)
  const soldOutCount = SOLD_OUT_COUNT
  // How many cards are visible. Keyed on the filters, so changing a filter
  // rewinds the page count without an effect.
  const [paging, setPaging] = useState({ key: '', n: PAGE })

  const [hearted, setHearted] = useStored('mugstreet.hearts', [])
  const bag = useBag()

  const [open, setOpen] = useState(null) // product being viewed
  const [bagOpen, setBagOpen] = useState(false)
  const [checkout, setCheckout] = useState(false)
  const [toast, setToast] = useState(null)
  const [flies, setFlies] = useState([])
  const taps = useRef(0)
  const sentinel = useRef(null)
  const lastLoad = useRef(0)

  const results = useMemo(
    () => filterProducts({ query, brands, vibes, maxPrice, sort, onlyHearted, hearted, inStockOnly: hideSoldOut }),
    [query, brands, vibes, maxPrice, sort, onlyHearted, hearted, hideSoldOut],
  )

  const filterKey = JSON.stringify([query, brands, vibes, maxPrice, sort, onlyHearted, hideSoldOut])
  const shown = paging.key === filterKey ? paging.n : PAGE

  const toastTimer = useRef(0)
  const more = useCallback(() => setPaging({ key: filterKey, n: shown + PAGE }), [filterKey, shown])

  // Load the next page as she reaches the bottom; the button below stays as a
  // manual fallback and as a count of what's left.
  useEffect(() => {
    const node = sentinel.current
    if (!node || shown >= results.length || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        // One batch at a time, however eagerly the observer fires.
        if (!entries[0]?.isIntersecting || Date.now() - lastLoad.current < 400) return
        lastLoad.current = Date.now()
        more()
      },
      { rootMargin: '400px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [more, shown, results.length])

  const say = useCallback((message) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  const toggle = (list, setList) => (value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  const heart = useCallback(
    (product, event) => {
      const on = hearted.includes(product.id)
      setHearted(on ? hearted.filter((id) => id !== product.id) : [...hearted, product.id])
      if (on) return
      say(LOVE_NOTES[Math.floor(Math.random() * LOVE_NOTES.length)])
      const rect = event?.currentTarget?.getBoundingClientRect?.()
      if (!rect) return
      const id = Date.now() + Math.random()
      setFlies((f) => [...f, { id, x: rect.left, y: rect.top, dx: (Math.random() - 0.5) * 60 }])
      window.setTimeout(() => setFlies((f) => f.filter((h) => h.id !== id)), 1200)
    },
    [hearted, setHearted, say],
  )

  // Where the open mug sits in what she's looking at right now, so the sheet
  // can page through the same list the grid shows — hearted-only included.
  const openIndex = open ? results.findIndex((p) => p.id === open.id) : -1
  const hasPrev = openIndex > 0
  const hasNext = openIndex >= 0 && openIndex < results.length - 1

  const step = useCallback(
    (delta) => {
      const next = results[openIndex + delta]
      if (openIndex < 0 || !next) return
      setOpen(next)
      // Keep the grid behind the sheet in step, so closing lands on a card.
      if (openIndex + delta >= shown) more()
    },
    [results, openIndex, shown, more],
  )

  const add = useCallback(
    (product) => {
      bag.add(product.id)
      say(`${product.title} → the bag`)
    },
    [bag, say],
  )

  if (checkout) {
    return <PicksScreen bag={bag} hearted={hearted} onBack={() => setCheckout(false)} />
  }

  return (
    <>
      <Ticker />

      <header className="header">
        <div className="header-row">
          <button
            className="logo"
            onClick={() => {
              taps.current += 1
              if (taps.current >= 5) {
                taps.current = 0
                say(SECRET_NOTE)
              }
            }}
            aria-label="MUG STREET"
          >
            MUG <em>STREET</em>
          </button>
          <div className="search">
            <span aria-hidden="true">🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="chai, cats, lids, matcha…"
              aria-label="Search mugs"
            />
            {query && (
              <button className="link-rm" onClick={() => setQuery('')}>
                clear
              </button>
            )}
          </div>
          <button
            className="icon-btn"
            data-on={onlyHearted}
            onClick={() => setOnlyHearted((v) => !v)}
            aria-pressed={onlyHearted}
            aria-label="Show only hearted"
          >
            {onlyHearted ? '❤️' : '🤍'}
            {hearted.length > 0 && <span className="count">{hearted.length}</span>}
          </button>
          <button className="icon-btn" onClick={() => setBagOpen(true)} aria-label="Your bag">
            🧺
            {bag.count > 0 && <span className="count">{bag.count}</span>}
          </button>
        </div>

        <div className="chips">
          {BRAND_ORDER.map((slug) => (
            <button
              key={slug}
              className="chip"
              data-on={brands.includes(slug)}
              onClick={() => toggle(brands, setBrands)(slug)}
            >
              {BRANDS[slug].name}
            </button>
          ))}
        </div>
        <div className="chips" style={{ paddingTop: 0 }}>
          <button
            className="chip stock"
            data-on={hideSoldOut}
            aria-pressed={hideSoldOut}
            onClick={() => setHideSoldOut((v) => !v)}
          >
            hide sold out{soldOutCount > 0 && ` (${soldOutCount})`}
          </button>
          {VIBES.map((v) => (
            <button
              key={v}
              className="chip vibe"
              data-on={vibes.includes(v)}
              onClick={() => toggle(vibes, setVibes)(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <h1>
            hi {HER_NAME} <span className="kiss">— pick your mugs</span>
          </h1>
          <p>
            {PRODUCTS.length} handmade mugs from {BRAND_ORDER.length} Indian ceramic studios, all in one
            place. Heart what you like, bag what you love. At the end you get a list — with real links — and
            I do the rest.
          </p>
        </section>

        <div className="toolbar">
          <span>
            {results.length} {results.length === 1 ? 'mug' : 'mugs'}
            {maxPrice < PRICE_MAX && <> under {rupees(maxPrice)}</>}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="brand-line">budget</span>
              <input
                type="range"
                min="149"
                max={PRICE_MAX}
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                aria-label="Maximum price"
              />
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
              <option value="love">most loved</option>
              <option value="low">price ↑</option>
              <option value="high">price ↓</option>
              <option value="name">a–z</option>
            </select>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="empty">
            <p>nothing matches that. the mugs are shy.</p>
            <button
              className="btn ghost"
              onClick={() => {
                setQuery('')
                setBrands([])
                setVibes([])
                setMaxPrice(PRICE_MAX)
                setOnlyHearted(false)
                setHideSoldOut(false)
              }}
            >
              reset everything
            </button>
          </div>
        ) : (
          <>
            <div className="grid">
              {results.slice(0, shown).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  hearted={hearted.includes(p.id)}
                  onHeart={heart}
                  onOpen={setOpen}
                />
              ))}
            </div>
            <div ref={sentinel} aria-hidden="true" />
            {shown < results.length && (
              <div style={{ textAlign: 'center', marginTop: 22 }}>
                <button className="btn ghost" onClick={more}>
                  show me more ({results.length - shown} left)
                </button>
              </div>
            )}
          </>
        )}
        <footer className="studios">
          <h2>the studios this comes from</h2>
          {BRAND_ORDER.map((slug) => (
            <div className="studio" key={slug}>
              <a href={BRANDS[slug].site} target="_blank" rel="noreferrer noopener" style={{ color: BRANDS[slug].accent }}>
                {BRANDS[slug].name} ↗
              </a>
              <div>{BRANDS[slug].blurb}</div>
            </div>
          ))}
          {OTHER_STUDIOS.map((studio) => (
            <div className="studio" key={studio.name}>
              <a href={studio.site} target="_blank" rel="noreferrer noopener">
                {studio.name} ↗
              </a>
              <div>{studio.blurb}</div>
            </div>
          ))}
          <p className="studio" style={{ gridColumn: '1 / -1' }}>
            Photos and prices come straight from each studio’s own shop. Nothing is sold here — every mug
            links back to the people who made it.
          </p>
        </footer>
      </main>

      {bag.count > 0 && (
        <div className="dock">
          <div className="sum">
            <b>{rupees(bag.total)}</b> · {bag.count} in the bag
          </div>
          <button className="btn ghost" onClick={() => setBagOpen(true)}>
            see bag
          </button>
          <button className="btn hot" onClick={() => setCheckout(true)}>
            done picking
          </button>
        </div>
      )}

      {open && (
        <ProductSheet
          product={open}
          hearted={hearted.includes(open.id)}
          onHeart={heart}
          onAdd={add}
          onClose={() => setOpen(null)}
          onNext={() => step(1)}
          onPrev={() => step(-1)}
          hasNext={hasNext}
          hasPrev={hasPrev}
          position={openIndex >= 0 ? { i: openIndex + 1, total: results.length } : null}
        />
      )}

      {bagOpen && (
        <BagDrawer
          bag={bag}
          onClose={() => setBagOpen(false)}
          onCheckout={() => {
            setBagOpen(false)
            setCheckout(true)
          }}
        />
      )}

      {toast && <div className="toast">{toast}</div>}

      {flies.map((h) => (
        <span
          key={h.id}
          className="hearts-fly"
          style={{ left: h.x, top: h.y, '--dx': `${h.dx}px` }}
          aria-hidden="true"
        >
          ❤️
        </span>
      ))}
    </>
  )
}
