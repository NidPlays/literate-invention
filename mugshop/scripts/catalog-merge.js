// Pure merge + validation logic for the weekly catalogue refresh.
// Kept free of I/O so it can be tested without touching the network.

export const MIN_HEALTHY_PRODUCTS = 20

/** A studio's feed is only trusted if it looks like a whole catalogue, not a truncated one. */
export function isHealthyFeed(products) {
  return Array.isArray(products) && products.length >= MIN_HEALTHY_PRODUCTS
}

/** Reduce a Shopify product to the fields the shop cares about. */
export function summarise(product) {
  const variants = product.variants || []
  const prices = variants.map((v) => Number(v.price)).filter((n) => Number.isFinite(n) && n > 0)
  const compare = variants.map((v) => Number(v.compare_at_price)).filter((n) => Number.isFinite(n) && n > 0)
  if (!prices.length) return null
  return {
    available: variants.some((v) => v.available),
    price: Math.round(Math.min(...prices)),
    compareAt: compare.length ? Math.round(Math.max(...compare)) : null,
  }
}

/**
 * Apply live feed data to the stored catalogue.
 *
 * Products belonging to a studio whose feed failed are left exactly as they are —
 * a studio being unreachable must never look like its mugs went out of stock.
 */
export function mergeCatalog(catalog, live, healthyBrands) {
  const report = { soldOut: [], backInStock: [], priceChanged: [], delisted: [], skipped: [], unchanged: 0 }
  const next = []

  for (const product of catalog) {
    if (!healthyBrands.has(product.brand)) {
      report.skipped.push(product.id)
      next.push(product)
      continue
    }

    const fresh = live.get(product.id)
    if (!fresh) {
      report.delisted.push({ id: product.id, brand: product.brand, title: product.title })
      continue
    }

    const updated = { ...product }
    let touched = false

    if (product.soldOut === fresh.available) {
      updated.soldOut = !fresh.available
      touched = true
      ;(fresh.available ? report.backInStock : report.soldOut).push({
        id: product.id,
        brand: product.brand,
        title: product.title,
      })
    }

    if (fresh.price !== product.price) {
      report.priceChanged.push({
        id: product.id,
        brand: product.brand,
        title: product.title,
        from: product.price,
        to: fresh.price,
      })
      updated.price = fresh.price
      touched = true
    }

    const compareAt = fresh.compareAt && fresh.compareAt > fresh.price ? fresh.compareAt : null
    if (compareAt !== product.compareAt) {
      updated.compareAt = compareAt
      touched = true
    }

    if (!touched) report.unchanged += 1
    next.push(updated)
  }

  return { next, report }
}

/**
 * Refuse to write changes that look like a broken feed rather than real movement.
 * Every threshold here exists to stop one bad response from gutting the shop.
 */
export function checkGuards(catalog, next, report, limits = {}) {
  const {
    maxDelistedShare = 0.15,
    maxBrandDelistedShare = 0.3,
    maxNewlySoldOutShare = 0.5,
    maxPriceFactor = 3,
  } = limits
  const problems = []

  const perBrand = (rows) =>
    rows.reduce((acc, r) => acc.set(r.brand, (acc.get(r.brand) || 0) + 1), new Map())

  const brandSizes = perBrand(catalog.map((p) => ({ brand: p.brand })))

  if (report.delisted.length > catalog.length * maxDelistedShare) {
    problems.push(
      `${report.delisted.length} of ${catalog.length} products vanished from their feeds (limit ${Math.floor(
        catalog.length * maxDelistedShare,
      )})`,
    )
  }

  for (const [brand, gone] of perBrand(report.delisted)) {
    const size = brandSizes.get(brand) || 0
    if (gone > size * maxBrandDelistedShare) {
      problems.push(`${brand}: ${gone} of ${size} products vanished from the feed`)
    }
  }

  for (const [brand, flipped] of perBrand(report.soldOut)) {
    const inStock = catalog.filter((p) => p.brand === brand && !p.soldOut).length
    if (flipped > 5 && flipped > inStock * maxNewlySoldOutShare) {
      problems.push(`${brand}: ${flipped} of ${inStock} in-stock products went sold out at once`)
    }
  }

  for (const change of report.priceChanged) {
    const factor = change.to / change.from
    if (factor > maxPriceFactor || factor < 1 / maxPriceFactor) {
      problems.push(`${change.title}: price moved ₹${change.from} → ₹${change.to}, which looks like a parse error`)
    }
  }

  for (const product of next) {
    if (!(product.price > 0)) problems.push(`${product.id} ended up with a non-positive price`)
    if (!product.images?.length) problems.push(`${product.id} ended up with no images`)
    if (!product.url?.startsWith('https://')) problems.push(`${product.id} ended up without a product link`)
  }

  return { ok: problems.length === 0, problems }
}

/**
 * Append mugs a studio has listed since the last run. Only studios whose feed
 * we trust contribute, and only products the shared rules already accepted.
 */
export function addNewProducts(catalog, candidates, healthyBrands) {
  const known = new Set(catalog.map((p) => p.id))
  const added = []
  for (const entry of candidates) {
    if (!healthyBrands.has(entry.brand) || known.has(entry.id)) continue
    known.add(entry.id)
    added.push(entry)
  }
  return { next: [...catalog, ...added], added }
}

/** A sudden flood of new products means the rules broke, not that a studio had a big week. */
export function checkAdditions(catalog, added, { maxShare = 0.2, floor = 40 } = {}) {
  const limit = Math.max(floor, Math.floor(catalog.length * maxShare))
  return added.length > limit
    ? { ok: false, problems: [`${added.length} new products in one run, over the limit of ${limit}`] }
    : { ok: true, problems: [] }
}

/** One-line-per-fact summary used for the commit body and the job summary. */
export function formatReport(report) {
  const lines = []
  const list = (rows, label, render) => {
    if (!rows.length) return
    lines.push(`${label} (${rows.length}):`)
    for (const row of rows) lines.push(`  ${render(row)}`)
  }
  list(report.soldOut, 'Now sold out', (r) => `${r.title} — ${r.brand}`)
  list(report.backInStock, 'Back in stock', (r) => `${r.title} — ${r.brand}`)
  list(report.priceChanged, 'Price changed', (r) => `${r.title} — ₹${r.from} → ₹${r.to}`)
  list(report.delisted, 'Removed (gone from the feed)', (r) => `${r.title} — ${r.brand}`)
  list(report.added || [], 'Newly listed', (r) => `${r.title} — ${r.brand} — ₹${r.price}`)
  if (report.skipped.length) lines.push(`Left untouched (studio unreachable): ${report.skipped.length}`)
  return lines.join('\n')
}

export function countChanges(report) {
  return (
    report.soldOut.length +
    report.backInStock.length +
    report.priceChanged.length +
    report.delisted.length +
    (report.added?.length || 0)
  )
}
