#!/usr/bin/env node
// Rebuilds src/data/catalog.json from scratch: every drinkware product the six
// studios list, curated by the shared rules. Run by hand, not on a schedule —
// the weekly refresh keeps the result up to date.
//
//   node scripts/rebuild-catalog.mjs [--dry-run]

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { fetchAll, loadBrands } from './feeds.mjs'
import { dedupe, toEntry } from './catalog-rules.js'

const CATALOG = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/catalog.json')
const dryRun = process.argv.includes('--dry-run')

const brands = await loadBrands()
const { byBrand, failures } = await fetchAll(brands)
if (failures.length) {
  console.error('\nRefusing to rebuild while a studio is unreachable — its mugs would all be dropped:')
  for (const f of failures) console.error(`  • ${f}`)
  process.exit(1)
}

const existing = new Map(JSON.parse(await readFile(CATALOG, 'utf8')).map((p) => [p.id, p]))
const entries = []
for (const brand of brands) {
  const kept = dedupe(
    (byBrand.get(brand.slug) || [])
      .map((p) => toEntry(p, brand.slug, brand.site, existing.get(`${brand.slug}-${p.id}`)))
      .filter(Boolean),
  )
  kept.sort((a, b) => a.price - b.price)
  entries.push(...kept)
  console.log(`  ${brand.name}: ${kept.length} mugs`)
}

console.log(`\n${entries.length} products (was ${existing.size})`)
if (dryRun) {
  console.log('Dry run — nothing written')
} else {
  await writeFile(CATALOG, `${JSON.stringify(entries, null, 1)}\n`, 'utf8')
  console.log(`Wrote ${CATALOG}`)
}
