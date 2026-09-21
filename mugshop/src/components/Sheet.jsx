import { useEffect } from 'react'

export default function Sheet({ side = 'bottom', title, meta, onClose, children, footer, bodyRef, overlay }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className={`sheet ${side}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-head">
          <h2>{title}</h2>
          <div className="sheet-head-end">
            {meta}
            <button className="close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        </div>
        <div className="sheet-body" ref={bodyRef}>
          {children}
        </div>
        {overlay}
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </>
  )
}
