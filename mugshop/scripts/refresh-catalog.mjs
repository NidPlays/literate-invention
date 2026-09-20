#!/usr/bin/env node
// Re-reads every studio's product feed and updates src/data/catalog.json in place:
// stock, price, sale price, mugs that have been delisted, and mugs newly listed
// since the last run.
//
//   node scripts/refresh-catalog.mjs            # write changes
//   node scripts/refresh-catalog.mjs --dry-run  # report only, touch nothing
//
// Exit codes: 0 nothing to do or written, 1 a guard tripped or a studio is
// unreachable, so the caller can fail the job loudly instead of committing.

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import {
  addNewProducts,
  checkAdditions,
  checkGuards,
  countChanges,
  formatReport,
  mergeCatalog,
  summarise,
} from './catalog-merge.js'
import { dedupe, toEntry } from './catalog-rules.js'
import { fetchAll, loadBrands } from './feeds.mjs'

const CATALOG = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/catalog.json')
const dryRun = process.argv.includes('--dry-run')

async function main() {
  const brands = await loadBrands()
  const catalog = JSON.parse(await readFile(CATALOG, 'utf8'))
  const { byBrand, failures } = await fetchAll(brands)
  const healthy = new Set(byBrand.keys())

  // Stock and price come from every product a studio lists, so a mug that no longer
  // matches the drinkware rules is refreshed rather than treated as delisted.
  const live = new Map()
  const candidates = []
  for (const brand of brands) {
    const raw = byBrand.get(brand.slug) || []
    for (const product of raw) {
      const summary = summarise(product)
      if (summary) live.set(`${brand.slug}-${product.id}`, summary)
    }
    candidates.push(
      ...dedupe(raw.map((p) => toEntry(p, brand.slug, brand.site)).filter(Boolean)),
    )
  }

  const merged = mergeCatalog(catalog, live, healthy)
  const { next, added } = addNewProducts(merged.next, candidates, healthy)
  const report = { ...merged.report, added }
  const changes = countChanges(report)
  const summary = formatReport(report)

  console.log(`\n${changes} change${changes === 1 ? '' : 's'} across ${catalog.length} products`)
  if (summary) console.log(summary)

  const guards = checkGuards(catalog, next, report)
  const additions = checkAdditions(catalog, added)
  const problems = [...guards.problems, ...additions.problems]

  if (problems.length) {
    console.error('\nRefusing to write — this looks like a broken feed, not real movement:')
    for (const p of problems) console.error(`  • ${p}`)
    await writeSummary({ changes, summary, problems, failures, wrote: false })
    process.exitCode = 1
    return
  }

  if (changes > 0 && !dryRun) {
    await writeFile(CATALOG, `${JSON.stringify(next, null, 1)}\n`, 'utf8')
    console.log(`\nWrote ${CATALOG} — ${next.length} products`)
  } else if (dryRun) {
    console.log('\nDry run — nothing written')
  } else {
    console.log('\nCatalogue already current — nothing written')
  }

  await writeSummary({ changes, summary, problems: [], failures, wrote: changes > 0 && !dryRun })

  // A studio we could not reach means the data is only partly refreshed. Whatever we
  // could verify is already written; the non-zero exit is what makes the gap visible.
  if (failures.length) process.exitCode = 1
}

async function writeSummary({ changes, summary, problems, failures, wrote }) {
  const path = process.env.GITHUB_STEP_SUMMARY
  const lines = ['## Catalogue refresh', '', `**${changes}** change${changes === 1 ? '' : 's'} found.`]
  if (summary) lines.push('', '```', summary, '```')
  if (failures.length) lines.push('', '### Studios that could not be reached', ...failures.map((f) => `- ${f}`))
  if (problems.length) lines.push('', '### Guards tripped — nothing written', ...problems.map((p) => `- ${p}`))
  lines.push('', wrote ? 'catalog.json was updated.' : 'catalog.json was left unchanged.')
  const text = lines.join('\n')
  if (path) await writeFile(path, `${text}\n`, { flag: 'a' })
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
