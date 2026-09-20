import { describe, expect, it } from 'vitest'
import { cleanBlurb, dedupe, isDrinkware, toEntry, vibesFor } from './catalog-rules.js'

const product = (over = {}) => ({
  id: 77,
  title: 'Kadak Chai Mug',
  handle: 'kadak-chai-mug',
  product_type: '',
  tags: [],
  body_html: '<p>A sturdy mug for very strong tea, thrown by hand in small batches.</p>',
  images: [{ src: 'https://cdn.shopify.com/a.jpg' }, { src: 'https://cdn.shopify.com/b.jpg' }],
  variants: [{ price: '365.00', compare_at_price: '499.00', available: true }],
  ...over,
})

describe('isDrinkware', () => {
  it('keeps anything she could drink out of', () => {
    for (const title of ['Kadak Chai Mug', 'Espresso Cup Set', 'Diet Coke Tumbler', 'Yellow Kulhad']) {
      expect(isDrinkware(product({ title }))).toBe(true)
    }
  })

  it('keeps a mug found only by its type or tags', () => {
    expect(isDrinkware(product({ title: 'Mr. Hendrix and Chirp', product_type: 'Ceramic Mug' }))).toBe(true)
    expect(isDrinkware(product({ title: 'Joy and Judgy', tags: ['coffee-mug'] }))).toBe(true)
  })

  it('drops things that only mention drinkware', () => {
    expect(isDrinkware(product({ title: 'The Matcha Club Framed Wall Art – Iced Matcha Cup Print' }))).toBe(false)
    expect(isDrinkware(product({ title: 'Coffee Lovers Gift Card', tags: ['mug'] }))).toBe(false)
  })

  it('drops products with no drinkware signal at all', () => {
    expect(isDrinkware(product({ title: 'Spiral-Heart Plate' }))).toBe(false)
  })

  it('keeps a mug sold with something undrinkable', () => {
    expect(isDrinkware(product({ title: 'Kadak Mug & Snack Plate Set' }))).toBe(true)
  })
})

describe('vibesFor', () => {
  it('tags by what the title says', () => {
    expect(vibesFor('Dreamy Cat Mug')).toContain('cats & critters')
    expect(vibesFor('Blue Tulip Ceramic Mug')).toEqual(expect.arrayContaining(['florals', 'bold & blue']))
    expect(vibesFor('Mushroom Mug with lid')).toEqual(expect.arrayContaining(['with a lid', 'quirky']))
  })

  it('falls back rather than leaving a mug untagged', () => {
    expect(vibesFor('Knob Handle Cup and Saucer')).toEqual(['everyday'])
  })

  it('never tags more than three vibes', () => {
    expect(vibesFor('Pink Heart Floral Mint Mug with Lid Set of 2').length).toBeLessThanOrEqual(3)
  })
})

describe('cleanBlurb', () => {
  it('turns a studio description into plain prose', () => {
    expect(cleanBlurb('<p>Hand-painted &amp; food safe, thrown in small batches by our potters.</p>')).toBe(
      'Hand-painted & food safe, thrown in small batches by our potters',
    )
  })

  it('throws away descriptions that are really stylesheets', () => {
    expect(cleanBlurb('<p>.section { margin: 0; padding: 0; } .accordion { margin: 0 !important; }</p>')).toBe('')
    expect(cleanBlurb('<style>.a{color:red}</style>')).toBe('')
  })

  it('returns empty rather than a useless fragment', () => {
    expect(cleanBlurb('<p>Ceramic</p>')).toBe('')
    expect(cleanBlurb(null)).toBe('')
  })
})

describe('toEntry', () => {
  it('maps a product onto a shop entry', () => {
    expect(toEntry(product(), 'craftribal', 'https://craftribal.com')).toMatchObject({
      id: 'craftribal-77',
      brand: 'craftribal',
      url: 'https://craftribal.com/products/kadak-chai-mug',
      price: 365,
      compareAt: 499,
      soldOut: false,
      vibes: ['chai & coffee'],
    })
  })

  it('marks a product with no available variant as sold out', () => {
    const entry = toEntry(product({ variants: [{ price: '365', available: false }] }), 'craftribal', 'https://x.com')
    expect(entry.soldOut).toBe(true)
    expect(entry.compareAt).toBeNull()
  })

  it('refuses a product with no price or no images', () => {
    expect(toEntry(product({ variants: [] }), 'craftribal', 'https://x.com')).toBeNull()
    expect(toEntry(product({ images: [] }), 'craftribal', 'https://x.com')).toBeNull()
  })

  it('keeps an existing entry’s images and blurb rather than overwriting them', () => {
    const existing = { images: ['https://cdn.shopify.com/kept.jpg'], blurb: 'kept blurb' }
    const entry = toEntry(product(), 'craftribal', 'https://x.com', existing)
    expect(entry.images).toEqual(existing.images)
    expect(entry.blurb).toBe('kept blurb')
  })

  it('drops a product that is not drinkware', () => {
    expect(toEntry(product({ title: 'Spiral-Heart Plate' }), 'craftribal', 'https://x.com')).toBeNull()
  })
})

describe('dedupe', () => {
  it('keeps one listing per title per studio', () => {
    const rows = [
      { id: 'a-1', brand: 'a', title: 'Chai Mug' },
      { id: 'a-2', brand: 'a', title: 'chai  mug' },
      { id: 'b-1', brand: 'b', title: 'Chai Mug' },
    ]
    expect(dedupe(rows).map((r) => r.id)).toEqual(['a-1', 'b-1'])
  })
})
