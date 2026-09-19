import { useState } from 'react'
import Sheet from './Sheet.jsx'
import { BRANDS } from '../data/brands.js'
import { rupees } from '../lib/shop.js'

export default function ProductSheet({ product, hearted, onHeart, onAdd, onClose }) {
  const [shot, setShot] = useState(0)
  const brand = BRANDS[product.brand]

  return (
    <Sheet
      title={brand.name}
      onClose={onClose}
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
      <div className="detail">
        <div className="gallery">
          <div className="main">
            <img src={product.images[shot]} alt={product.title} />
          </div>
          {product.images.length > 1 && (
            <div className="thumbs">
              {product.images.map((src, i) => (
                <button key={src} data-on={i === shot} onClick={() => setShot(i)} aria-label={`Photo ${i + 1}`}>
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
        </div>
      </div>
    </Sheet>
  )
}
