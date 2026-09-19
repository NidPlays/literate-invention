import { BRANDS } from '../data/brands.js'
import { rupees } from '../lib/shop.js'

export default function ProductCard({ product, hearted, onHeart, onOpen }) {
  const brand = BRANDS[product.brand]
  const off =
    product.compareAt && product.compareAt > product.price
      ? Math.round((1 - product.price / product.compareAt) * 100)
      : null

  return (
    <div className="card">
      <button
        className="shot"
        onClick={() => onOpen(product)}
        aria-label={`Open ${product.title}`}
        style={{ border: 0, padding: 0, background: 'none', display: 'block', width: '100%' }}
      >
        <img src={product.images[0]} alt={product.title} loading="lazy" />
        {product.images[1] && (
          <img className="alt" src={product.images[1]} alt="" aria-hidden="true" loading="lazy" />
        )}
        {product.soldOut ? (
          <span className="badge sold">sold out</span>
        ) : off ? (
          <span className="badge">-{off}%</span>
        ) : product.price < 400 ? (
          <span className="badge soft">under ₹400</span>
        ) : null}
      </button>
      <button
        className="heart"
        data-on={hearted}
        aria-pressed={hearted}
        aria-label={hearted ? `Un-heart ${product.title}` : `Heart ${product.title}`}
        onClick={(e) => onHeart(product, e)}
      >
        {hearted ? '❤️' : '🤍'}
      </button>
      <div className="card-body">
        <span className="brand-line" style={{ color: brand.accent }}>
          {brand.name}
        </span>
        <span className="title">{product.title}</span>
        <span className="price">
          <b>{rupees(product.price)}</b>
          {product.compareAt && <s>{rupees(product.compareAt)}</s>}
          {off && <span className="off">{off}% off</span>}
        </span>
      </div>
    </div>
  )
}
