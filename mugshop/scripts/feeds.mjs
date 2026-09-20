// Fetching the studios' public product feeds, with the retries and sanity checks
// that anything running unattended against someone else's server needs.

import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { isHealthyFeed } from './catalog-merge.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const PAGE_LIMIT = 250
const MAX_PAGES = 8
const ATTEMPTS = 3
const TIMEOUT_MS = 30_000

/** Read the studio list from the app itself, so script and shop can't drift apart. */
export async function loadBrands() {
  const { BRANDS } = await import(resolve(HERE, '../src/data/brands.js'))
  return Object.entries(BRANDS).map(([slug, b]) => ({ slug, site: b.site, name: b.name }))
}

async function getJson(url) {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { accept: 'application/json', 'user-agent': 'mugstreet-catalogue (+github actions)' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      if (attempt === ATTEMPTS) throw err
      await new Promise((r) => setTimeout(r, 2000 * attempt))
    }
  }
}

/** Every product a studio lists. Throws if the feed looks truncated. */
export async function fetchBrand({ site }) {
  const products = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await getJson(`${site}/products.json?limit=${PAGE_LIMIT}&page=${page}`)
    const batch = data?.products
    if (!Array.isArray(batch) || batch.length === 0) break
    products.push(...batch)
    if (batch.length < PAGE_LIMIT) break
  }
  if (!isHealthyFeed(products)) {
    throw new Error(`feed returned only ${products.length} products, which is too few to trust`)
  }
  return products
}

/** Fetch every studio, keeping going when one fails. */
export async function fetchAll(brands, log = console.log) {
  const byBrand = new Map()
  const failures = []
  const results = await Promise.allSettled(brands.map((b) => fetchBrand(b)))
  results.forEach((result, i) => {
    const brand = brands[i]
    if (result.status === 'fulfilled') {
      byBrand.set(brand.slug, result.value)
      log(`✓ ${brand.name}: ${result.value.length} products`)
    } else {
      failures.push(`${brand.name}: ${result.reason?.message || result.reason}`)
      log(`✗ ${brand.name}: ${result.reason?.message || result.reason}`)
    }
  })
  return { byBrand, failures }
}
