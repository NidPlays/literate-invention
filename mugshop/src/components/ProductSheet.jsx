import { useEffect, useRef, useState } from 'react'
import Sheet from './Sheet.jsx'
import { BRANDS } from '../data/brands.js'
import { rupees } from '../lib/shop.js'
import { REEL_THRESHOLD, useMediaQuery, useReel } from '../lib/reel.js'

export default function ProductSheet({
  product,
  hearted,
  onHeart,
  onAdd,
  onClose,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
  position,
}) {
  // Keyed on the mug, so moving to the next one rewinds to its first photo
  // without an effect.
  const [photo, setPhoto] = useState({ id: null, i: 0 })
  const shot = photo.id === product.id ? photo.i : 0
  // Which way the mug on screen arrived from, so it can slide in from there.
  const [enter, setEnter] = useState(null)
  const body = useRef(null)
  const brand = BRANDS[product.brand]
  // Bottom-sheet layout only: on desktop this is a centred modal and the
  // arrow keys below are the way through the list.
  const phone = useMediaQuery('(max-width: 759px)')

  const go = (dir) => {
    if (dir === 'next' ? !hasNext : !hasPrev) return
    setEnter(dir === 'next' ? 'up' : 'down')
    ;(dir === 'next' ? onNext : onPrev)?.()
  }

  const pull = useReel({
    bodyRef: body,
    enabled: phone,
    onNext: () => go('next'),
    onPrev: () => go('prev'),
    hasNext,
    hasPrev,
  })

  // A new mug starts at the top of the sheet, the way a new page would.
  useEffect(() => {
    if (body.current) body.current.scrollTop = 0
  }, [product.id])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go('next')
      else if (e.key === 'ArrowLeft') go('prev')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const ready = Math.abs(pull) >= REEL_THRESHOLD

  return (
    <Sheet
      title={brand.name}
      onClose={onClose}
      bodyRef={body}
      meta={position && <span className="sheet-count">{position.i} / {position.total}</span>}
      overlay={
        phone && (
          <>
            <div className="reel-hint prev" data-on={pull < 0} data-ready={ready} aria-hidden="true">
              {ready ? 'let go ↓' : 'the one before'}
            </div>
            <div className="reel-hint next" data-on={pull > 0} data-ready={ready} aria-hidden="true">
              {ready ? 'let go ↑' : 'the next mug'}
            </div>
          </>
        )
      }
      footer={
        <div className="actions" style={{ margin: 0 }}>
          <button className="btn ghost" onClick={(e) => onHeart(product, e)}>
            {hearted ? '❤️ hearted' : '🤍 heart it'}
          </button>
          <button
            className="btn hot"
            disabled={product.soldOut}
            onClick={() => {
              onAdd(product)
              onClose()
            }}
          >
            {product.soldOut ? 'sold out' : `add · ${rupees(product.price)}`}
          </button>
        </div>
      }
    >
      <div
        className="detail reel"
        key={product.id}
        data-enter={enter || undefined}
        style={{
          transform: pull ? `translateY(${-pull}px)` : undefined,
          // While she's dragging the sheet tracks the finger exactly; on
          // release it springs back.
          transition: pull ? 'none' : undefined,
        }}
      >
        <div className="gallery">
          <div className="main">
            <img src={product.images[shot]} alt={product.title} />
          </div>
          {product.images.length > 1 && (
            <div className="thumbs">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  data-on={i === shot}
                  onClick={() => setPhoto({ id: product.id, i })}
                  aria-label={`Photo ${i + 1}`}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3>{product.title}</h3>
          <div className="price">
            <b>{rupees(product.price)}</b>
            {product.compareAt && <s>{rupees(product.compareAt)}</s>}
          </div>
          <div className="meta-row">
            {product.vibes.map((v) => (
              <span className="tag" key={v}>
                {v}
              </span>
            ))}
            <span className="tag">{brand.city}</span>
          </div>
          <p className="blurb">{product.blurb || brand.blurb}</p>
          <p style={{ marginTop: 18 }}>
            <a className="src-link" href={product.url} target="_blank" rel="noreferrer noopener">
              see it on {brand.name.toLowerCase()} ↗
            </a>
          </p>
          {phone && (hasNext || hasPrev) && (
            <p className="reel-note">
              {hasNext ? 'keep scrolling for the next mug' : 'scroll up for the one before'}
            </p>
          )}
        </div>
      </div>
    </Sheet>
  )
}
