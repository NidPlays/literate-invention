import { useState } from 'react'
import { BRANDS } from '../data/brands.js'
import { rupees, PRODUCTS } from '../lib/shop.js'
import { CLOSING_NOTE, HER_NAME } from '../config.js'

function asText(lines, hearted) {
  const out = lines.map(
    ({ product, qty }) =>
      `${qty}× ${product.title} — ${BRANDS[product.brand].name} — ${rupees(product.price * qty)}\n   ${product.url}`,
  )
  if (hearted.length) {
    out.push('', 'also hearted:')
    hearted.forEach((p) => out.push(`   ${p.title} — ${rupees(p.price)} — ${p.url}`))
  }
  return `${HER_NAME}'s mug picks\n\n${out.join('\n')}`
}

export default function PicksScreen({ bag, hearted, onBack }) {
  const [copied, setCopied] = useState(false)
  const heartedOnly = PRODUCTS.filter(
    (p) => hearted.includes(p.id) && !bag.lines.some((l) => l.product.id === p.id),
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(asText(bag.lines, heartedOnly))
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="picks">
      <div className="picks-inner">
        <h1>{HER_NAME}’s picks 🤍</h1>
        <p className="sub">
          {bag.count} {bag.count === 1 ? 'thing' : 'things'}, {rupees(bag.total)} total. Every line links
          straight to the studio that made it — so this list is orderable, not imaginary.
        </p>

        {bag.lines.map(({ product, qty }) => {
          const brand = BRANDS[product.brand]
          return (
            <div className="pick-card" key={product.id}>
              <img src={product.images[0]} alt="" />
              <div className="info">
                <span className="brand-line" style={{ color: brand.accent }}>
                  {brand.name}
                </span>
                <div style={{ fontSize: 15, margin: '3px 0 5px' }}>
                  {qty > 1 && <b>{qty}× </b>}
                  {product.title}
                </div>
                <b>{rupees(product.price * qty)}</b>
                <div style={{ marginTop: 6 }}>
                  <a className="src-link" href={product.url} target="_blank" rel="noreferrer noopener">
                    open on {brand.site.replace('https://', '')} ↗
                  </a>
                </div>
              </div>
            </div>
          )
        })}

        {heartedOnly.length > 0 && (
          <>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, marginTop: 28 }}>
              and these got a heart but not a yes
            </h2>
            {heartedOnly.map((p) => (
              <div className="pick-card" key={p.id}>
                <img src={p.images[0]} alt="" />
                <div className="info">
                  <span className="brand-line">{BRANDS[p.brand].name}</span>
                  <div style={{ fontSize: 15, margin: '3px 0 5px' }}>{p.title}</div>
                  <b>{rupees(p.price)}</b>
                  <div style={{ marginTop: 6 }}>
                    <a className="src-link" href={p.url} target="_blank" rel="noreferrer noopener">
                      open ↗
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        <div className="note-card">{CLOSING_NOTE}</div>

        <div className="picks-actions">
          <button className="btn ghost" onClick={onBack}>
            ← keep shopping
          </button>
          <button className="btn" onClick={copy}>
            {copied ? 'copied 🤍' : 'copy the list'}
          </button>
          <button className="btn hot" onClick={() => window.print()}>
            save as PDF
          </button>
        </div>
      </div>
    </div>
  )
}
