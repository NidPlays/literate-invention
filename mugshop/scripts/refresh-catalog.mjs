#!/usr/bin/env node
// Re-reads every studio's public product feed and updates src/data/catalog.json
// in place: stock, price, sale price, and products that have been delisted.
//
//   node scripts/refresh-catalog.mjs            # write changes
//   node scripts/refresh-catalog.mjs --dry-run  # report only, touch nothing
//
// Exit codes: 0 nothing to do or written, 1 a guard tripped or a studio is
// unreachable, so the caller can fail the job loudly instead of committing.

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { checkGuards, countChanges, formatReport, isHealthyFeed, mergeCatalog, summarise } from './catalog-merge.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const CATALOG = resolve(HERE, '../src/data/catalog.json')
const BRANDS_FILE = resolve(HERE, '../src/data/brands.js')

const PAGE_LIMIT = 250
const MAX_PAGES = 8
const ATTEMPTS = 3
const TIMEOUT_MS = 30_000

const dryRun = process.argv.includes('--dry-run')

/** Read the studio list from the app itself, so the two can't drift apart. */
async function loadBrands() {
  const { BRANDS } = await import(BRANDS_FILE)
  return Object.entries(BRANDS).map(([slug, b]) => ({ slug, site: b.site, name: b.name }))
}

async function getJson(url) {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { accept: 'application/json', 'user-agent': 'mugstreet-catalogue-refresh (+github actions)' },
      })
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      if (attempt === ATTEMPTS) throw err
      await new Promise((r) => setTimeout(r, 2000 * attempt))
    }
  }
}

async function fetchBrand({ slug, site }) {
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
  const live = new Map()
  for (const product of products) {
    const summary = summarise(product)
    if (summary) live.set(`${slug}-${product.id}`, summary)
  }
  return live
}

async function main() {
  const brands = await loadBrands()
  const catalog = JSON.parse(await readFile(CATALOG, 'utf8'))

  const live = new Map()
  const healthy = new Set()
  const failures = []

  const results = await Promise.allSettled(brands.map((b) => fetchBrand(b).then((m) => [b, m])))
  for (const [i, result] of results.entries()) {
    const brand = brands[i]
    if (result.status === 'fulfilled') {
      const [, map] = result.value
      for (const [id, summary] of map) live.set(id, summary)
      healthy.add(brand.slug)
      console.log(`✓ ${brand.name}: ${map.size} live products`)
    } else {
      failures.push(`${brand.name}: ${result.reason?.message || result.reason}`)
      console.log(`✗ ${brand.name}: ${result.reason?.message || result.reason}`)
    }
  }

  const { next, report } = mergeCatalog(catalog, live, healthy)
  const changes = countChanges(report)
  const summary = formatReport(report)

  console.log(`\n${changes} change${changes === 1 ? '' : 's'} across ${catalog.length} products`)
  if (summary) console.log(summary)

  const { ok, problems } = checkGuards(catalog, next, report)
  if (!ok) {
    console.error('\nRefusing to write — this looks like a broken feed, not real movement:')
    for (const p of problems) console.error(`  • ${p}`)
    await writeSummary({ changes, summary, problems, failures, wrote: false })
    process.exitCode = 1
    return
  }

  if (changes > 0 && !dryRun) {
    await writeFile(CATALOG, `${JSON.stringify(next, null, 1)}\n`, 'utf8')
    console.log(`\nWrote ${CATALOG}`)
  } else if (dryRun) {
    console.log('\nDry run — nothing written')
  } else {
    console.log('\nCatalogue already current — nothing written')
  }

  await writeSummary({ changes, summary, problems: [], failures, wrote: changes > 0 && !dryRun })

  // A studio we could not reach means the data is only partly refreshed. Whatever we
  // could verify is already written; the non-zero exit is what makes the job visible.
  if (failures.length) process.exitCode = 1
}

async function writeSummary({ changes, summary, problems, failures, wrote }) {
  const path = process.env.GITHUB_STEP_SUMMARY
  const lines = [`## Catalogue refresh`, '', `**${changes}** change${changes === 1 ? '' : 's'} found.`]
  if (summary) lines.push('', '```', summary, '```')
  if (failures.length) lines.push('', '### Studios that could not be reached', ...failures.map((f) => `- ${f}`))
  if (problems.length) lines.push('', '### Guards tripped — nothing written', ...problems.map((p) => `- ${p}`))
  lines.push('', wrote ? 'catalog.json was updated.' : 'catalog.json was left unchanged.')
  const text = lines.join('\n')
  if (path) await writeFile(path, `${text}\n`, { flag: 'a' })
  // Plain-text version for the commit body, written outside the repo.
  if (process.env.REFRESH_REPORT_FILE) {
    await writeFile(process.env.REFRESH_REPORT_FILE, summary ? `${summary}\n` : '', 'utf8')
  }
  if (process.env.GITHUB_OUTPUT) {
    await writeFile(process.env.GITHUB_OUTPUT, `changes=${changes}\n`, { flag: 'a' })
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
