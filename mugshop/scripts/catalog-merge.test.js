import { describe, expect, it } from 'vitest'
import {
  addNewProducts,
  checkAdditions,
  checkGuards,
  countChanges,
  isHealthyFeed,
  mergeCatalog,
  summarise,
} from './catalog-merge.js'

const mug = (over = {}) => ({
  id: 'craftribal-1',
  brand: 'craftribal',
  title: 'Kadak Chai Mug',
  url: 'https://craftribal.com/products/kadak-chai-mug',
  price: 365,
  compareAt: null,
  soldOut: false,
  images: ['https://cdn.shopify.com/a.jpg'],
  blurb: '',
  vibes: ['chai & coffee'],
  ...over,
})

const live = (entries) => new Map(entries)

describe('summarise', () => {
  it('takes the cheapest variant price and the highest compare-at', () => {
    expect(
      summarise({
        variants: [
          { price: '499.00', compare_at_price: '999.00', available: false },
          { price: '365.00', compare_at_price: '600.00', available: true },
        ],
      }),
    ).toEqual({ available: true, price: 365, compareAt: 999 })
  })

  it('returns null for a product with no usable price', () => {
    expect(summarise({ variants: [{ price: '0', available: true }] })).toBeNull()
    expect(summarise({ variants: [] })).toBeNull()
  })
})

describe('isHealthyFeed', () => {
  it('rejects a feed that came back suspiciously short', () => {
    expect(isHealthyFeed(Array(19).fill({}))).toBe(false)
    expect(isHealthyFeed(Array(20).fill({}))).toBe(true)
    expect(isHealthyFeed(null)).toBe(false)
  })
})

describe('mergeCatalog', () => {
  const healthy = new Set(['craftribal'])

  it('flips a mug to sold out', () => {
    const { next, report } = mergeCatalog(
      [mug()],
      live([['craftribal-1', { available: false, price: 365, compareAt: null }]]),
      healthy,
    )
    expect(next[0].soldOut).toBe(true)
    expect(report.soldOut).toHaveLength(1)
    expect(report.backInStock).toHaveLength(0)
  })

  it('brings a mug back in stock', () => {
    const { next, report } = mergeCatalog(
      [mug({ soldOut: true })],
      live([['craftribal-1', { available: true, price: 365, compareAt: null }]]),
      healthy,
    )
    expect(next[0].soldOut).toBe(false)
    expect(report.backInStock).toHaveLength(1)
  })

  it('updates price and only keeps a compare-at above it', () => {
    const { next, report } = mergeCatalog(
      [mug({ compareAt: 600 })],
      live([['craftribal-1', { available: true, price: 420, compareAt: 300 }]]),
      healthy,
    )
    expect(next[0].price).toBe(420)
    expect(next[0].compareAt).toBeNull()
    expect(report.priceChanged[0]).toMatchObject({ from: 365, to: 420 })
  })

  it('drops a product that has gone from the feed', () => {
    const { next, report } = mergeCatalog([mug()], live([]), healthy)
    expect(next).toHaveLength(0)
    expect(report.delisted).toHaveLength(1)
  })

  it('leaves a studio alone entirely when its feed failed', () => {
    const before = mug({ soldOut: true, price: 365 })
    const { next, report } = mergeCatalog([before], live([]), new Set())
    expect(next[0]).toEqual(before)
    expect(report.delisted).toHaveLength(0)
    expect(report.skipped).toEqual(['craftribal-1'])
  })

  it('reports nothing when the feed matches the catalogue', () => {
    const { report } = mergeCatalog(
      [mug()],
      live([['craftribal-1', { available: true, price: 365, compareAt: null }]]),
      healthy,
    )
    expect(countChanges(report)).toBe(0)
    expect(report.unchanged).toBe(1)
  })
})

describe('checkGuards', () => {
  const many = (n) => Array.from({ length: n }, (_, i) => mug({ id: `craftribal-${i}` }))
  const empty = { soldOut: [], backInStock: [], priceChanged: [], delisted: [], skipped: [], unchanged: 0 }

  it('passes ordinary movement', () => {
    const catalog = many(40)
    const report = { ...empty, soldOut: [{ brand: 'craftribal', title: 'x' }], delisted: [{ brand: 'craftribal', title: 'y' }] }
    expect(checkGuards(catalog, catalog, report).ok).toBe(true)
  })

  it('refuses a mass delisting across the catalogue', () => {
    const catalog = many(40)
    const report = { ...empty, delisted: catalog.slice(0, 10).map((p) => ({ brand: p.brand, title: p.title })) }
    const { ok, problems } = checkGuards(catalog, catalog, report)
    expect(ok).toBe(false)
    expect(problems.join(' ')).toMatch(/vanished/)
  })

  it('refuses a whole studio going sold out at once', () => {
    const catalog = many(40)
    const report = { ...empty, soldOut: catalog.slice(0, 30).map((p) => ({ brand: p.brand, title: p.title })) }
    expect(checkGuards(catalog, catalog, report).ok).toBe(false)
  })

  it('refuses a price that moved by an implausible factor', () => {
    const catalog = many(40)
    const report = { ...empty, priceChanged: [{ brand: 'craftribal', title: 'Kadak Chai Mug', from: 365, to: 36500 }] }
    const { ok, problems } = checkGuards(catalog, catalog, report)
    expect(ok).toBe(false)
    expect(problems.join(' ')).toMatch(/parse error/)
  })

  it('refuses output that lost a price, an image or a link', () => {
    const catalog = many(40)
    expect(checkGuards(catalog, [mug({ price: 0 })], empty).ok).toBe(false)
    expect(checkGuards(catalog, [mug({ images: [] })], empty).ok).toBe(false)
    expect(checkGuards(catalog, [mug({ url: '' })], empty).ok).toBe(false)
  })
})

describe('addNewProducts', () => {
  const healthy = new Set(['craftribal', 'klaylist'])

  it('appends mugs the catalogue has never seen', () => {
    const fresh = mug({ id: 'craftribal-2', title: 'New Mug' })
    const { next, added } = addNewProducts([mug()], [mug(), fresh], healthy)
    expect(next).toHaveLength(2)
    expect(added).toEqual([fresh])
  })

  it('ignores candidates from a studio whose feed failed', () => {
    const fresh = mug({ id: 'saabi-house-9', brand: 'saabi-house' })
    const { next, added } = addNewProducts([mug()], [fresh], healthy)
    expect(added).toHaveLength(0)
    expect(next).toHaveLength(1)
  })

  it('does not add the same product twice in one run', () => {
    const fresh = mug({ id: 'craftribal-2' })
    const { added } = addNewProducts([], [fresh, fresh], healthy)
    expect(added).toHaveLength(1)
  })
})

describe('checkAdditions', () => {
  it('allows a normal drop', () => {
    expect(checkAdditions(Array(700).fill(mug()), Array(30).fill(mug())).ok).toBe(true)
  })

  it('refuses a flood that suggests the rules broke', () => {
    const { ok, problems } = checkAdditions(Array(700).fill(mug()), Array(200).fill(mug()))
    expect(ok).toBe(false)
    expect(problems.join(' ')).toMatch(/over the limit/)
  })

  it('keeps a floor so a small catalogue can still grow', () => {
    expect(checkAdditions([mug()], Array(30).fill(mug())).ok).toBe(true)
  })
})
