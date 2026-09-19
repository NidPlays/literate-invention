const LINES = [
  'handmade · small batch · from real Indian studios',
  '5 studios. 131 mugs. one girl with excellent taste.',
  'free delivery (by me, to your hands)',
  'every mug links to the actual shop — nothing here is fake',
  'no returns on the boyfriend',
]

export default function Ticker() {
  const strip = [...LINES, ...LINES]
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {strip.map((line, i) => (
          <span key={i}>
            <b>✦</b> {line}
          </span>
        ))}
      </div>
    </div>
  )
}
