// What counts as a mug, and how a studio's raw product becomes a shop entry.
// Shared by the full rebuild and the weekly refresh, so the two can't disagree
// about which products belong in the shop.

const DRINKWARE = /\b(mug|cup|tumbler|sipper|stein|kulhad|teacup|matcha bowl|drinkware|can sipper)/i

// Things a studio files near its drinkware that nobody can drink out of.
const NOT_DRINKWARE =
  /\b(wall art|framed|frame|print|poster|painting|gift card|candle|planter|vase|bookend|ashtray|soap|incense|apron|keychain|magnet|coaster set|trivet|napkin|tray|jar|bottle|kettle|teapot|dinner set|plate set)\b/i

const VIBE_RULES = [
  ['cats & critters', /\b(cat|kitty|meow|dog|pup|paw|bear|bunny|duck|frog|panda|cow|animal|pet|penguin|owl|butterfly|bee)\b/i],
  ['florals', /\b(floral|flower|tulip|daisy|rose|bloom|blossom|petal|sunflower|lily|garden|leaf|ginkgo|botanic)\b/i],
  ['chai & coffee', /\b(chai|kadak|coffee|espresso|cappuccino|latte|kaapi|kaffi|masala|cutting)\b/i],
  ['matcha green', /\b(matcha|green|mint|olive|sage|pista|moss)\b/i],
  ['with a lid', /\b(lid|lidded)\b/i],
  ['sets & combos', /\b(set|combo|pair|duo|duet|of 2|of 4|of 6)\b/i],
  ['hearts & love', /\b(heart|love|sweetheart|romance|valentine|hug|kiss|forever|bae|cupid)\b/i],
  ['quirky', /\b(quirky|funny|mushroom|evil eye|witch|halloween|alien|ghost|strange|weird|meme|judgy|monster|doodle|pinteresty)\b/i],
  ['minimal', /\b(minimal|classic|plain|white|unibody|mono|speckl|rustic|matte|stone|nordic|beige|ivory)\b/i],
  ['pastel', /\b(pastel|blush|pink|lilac|lavender|peach|baby blue|sky|powder)\b/i],
  ['bold & blue', /\b(blue|indigo|cobalt|azure|navy|ocean)\b/i],
  ['desi', /\b(desi|hum tum|bhai|didi|jaan|pyaar|dil|namaste|ghar|sukoon|bindi|mirchi|jugaad|chai ho|rakhi)\b/i],
]

/** Is this product something she could drink out of? */
export function isDrinkware(product) {
  const haystack = [product.title, product.product_type, ...(product.tags || [])].join(' ')
  if (!DRINKWARE.test(haystack)) return false
  // A title that names something undrinkable wins, unless it also names drinkware
  // ("Kadak Mug & Snack Plate Set" stays, "Matcha Cup Wall Art" goes).
  if (NOT_DRINKWARE.test(product.title) && !DRINKWARE.test(product.title)) return false
  if (/\b(wall art|framed|poster|gift card)\b/i.test(product.title)) return false
  return true
}

export function vibesFor(title) {
  const hits = VIBE_RULES.filter(([, re]) => re.test(title)).map(([name]) => name)
  return hits.length ? hits.slice(0, 3) : ['everyday']
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ', rsquo: '’', ldquo: '“', rdquo: '”' }

/** Studio descriptions are HTML, and some of them carry stray CSS. Keep the prose. */
export function cleanBlurb(html) {
  if (!html) return ''
  let text = String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&([a-z#0-9]+);/gi, (m, code) => ENTITIES[code.toLowerCase()] ?? ' ')
  const css = text.match(/(\.[A-Za-z_][\w-]*\s*\{|\{[^}]{0,80}:[^}]{0,80}\})/)
  if (css) text = text.slice(0, css.index)
  text = text.replace(/\s+/g, ' ').trim().replace(/^[.;:-]+|[.;:-]+$/g, '')
  if (/(!important|@media|<style)/i.test(text) || text.length < 25) return ''
  return text.slice(0, 220)
}

/**
 * Turn a studio's raw product into a shop entry, or null if it doesn't belong.
 * `existing` keeps a hand-edited blurb or trimmed image list from being overwritten.
 */
export function toEntry(product, brand, site, existing) {
  if (!isDrinkware(product)) return null
  const variants = product.variants || []
  const prices = variants.map((v) => Number(v.price)).filter((n) => Number.isFinite(n) && n > 0)
  if (!prices.length) return null
  const compare = variants.map((v) => Number(v.compare_at_price)).filter((n) => Number.isFinite(n) && n > 0)
  const images = (product.images || []).map((i) => i.src).filter(Boolean).slice(0, 3)
  if (!images.length) return null

  const price = Math.round(Math.min(...prices))
  const compareAt = compare.length ? Math.round(Math.max(...compare)) : null
  const title = product.title.trim()

  return {
    id: `${brand}-${product.id}`,
    brand,
    title,
    url: `${site}/products/${product.handle}`,
    price,
    compareAt: compareAt && compareAt > price ? compareAt : null,
    soldOut: !variants.some((v) => v.available),
    images: existing?.images?.length ? existing.images : images,
    blurb: existing ? existing.blurb : cleanBlurb(product.body_html),
    vibes: vibesFor(title),
  }
}

/** Two listings of the same mug (same normalised title) shouldn't both be in the grid. */
export function dedupe(entries) {
  const seen = new Set()
  return entries.filter((entry) => {
    const key = `${entry.brand}:${entry.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
