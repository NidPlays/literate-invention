import Sheet from './Sheet.jsx'
import { BRANDS } from '../data/brands.js'
import { rupees } from '../lib/shop.js'

export default function BagDrawer({ bag, onClose, onCheckout }) {
  return (
    <Sheet
      side="right"
      title={`the bag (${bag.count})`}
      onClose={onClose}
      footer={
        <>
          <div className="totals">
            <span>total</span>
            <b>{rupees(bag.total)}</b>
          </div>
          <button className="btn hot block" disabled={!bag.count} onClick={onCheckout}>
            these are my picks →
          </button>
        </>
      }
    >
      {!bag.count && <p style={{ color: 'var(--ink-2)' }}>Nothing here yet. Go be greedy.</p>}
      {bag.lines.map(({ product, qty }) => (
        <div className="row" key={product.id}>
          <img src={product.images[0]} alt="" />
          <div className="info">
            <span className="brand-line">{BRANDS[product.brand].name}</span>
            <span className="t">{product.title}</span>
            <b>{rupees(product.price * qty)}</b>
            <div className="qty">
              <button onClick={() => bag.setQty(product.id, qty - 1)} aria-label="One less">
                −
              </button>
              <span>{qty}</span>
              <button onClick={() => bag.setQty(product.id, qty + 1)} aria-label="One more">
                +
              </button>
              <button className="link-rm" onClick={() => bag.setQty(product.id, 0)}>
                remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </Sheet>
  )
}
