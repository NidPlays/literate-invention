# MUG STREET

A small, fake-but-honest shopping site for handmade mugs, built for screen-sharing:
she browses, hearts and bags what she likes, and at the end you get a list of real
products with real prices and direct links to the studios that made them.

Nothing is sold here. Every photo, price and link comes from the brand's own shop.

## The studios

| Studio | Shop |
| --- | --- |
| House of Ceramics | https://www.houseofceramics.in |
| Klaylist | https://klaylist.com |
| The Strange Co | https://thestrangeco.com |
| Craftribal | https://craftribal.com |
| Saabi House | https://saabihouse.in |
| Myaha | https://www.myahaliving.com |

Two more from the original list make no drinkware, so they are credited in the
footer rather than stocked: [Sāh](https://sah-studio.com) (vases, planters, urns)
and [Dophari](https://dophari.com) (lighting and vases).

## Personalising it

Everything you'd want to change lives in [`src/config.js`](src/config.js):
her name, the love notes that pop when she hearts something, the closing note on
the picks screen, and the easter egg (tap the logo five times).

## Running it

```sh
npm install
npm run dev     # local dev server
npm test        # vitest
npm run lint
npm run build   # → dist/, served at /literate-invention/mugshop/
```

## Keeping the catalogue current

`.github/workflows/refresh-catalog.yml` re-reads every studio's feed each Monday
(04:00 UTC) and commits `src/data/catalog.json` if anything moved. Run it by hand
from the Actions tab — with **Report what changed without committing it** ticked
for a dry run — or locally:

```sh
node scripts/refresh-catalog.mjs --dry-run   # report only
node scripts/refresh-catalog.mjs             # write changes
```

It refreshes stock, price and sale price, drops products that have gone from a
studio's feed, and adds mugs listed since the last run. Which products qualify
lives in `scripts/catalog-rules.js`, shared with the full rebuild so the two can't
disagree.

To rebuild the catalogue from scratch — after adding a studio, or changing what
counts as a mug:

```sh
node scripts/rebuild-catalog.mjs --dry-run
node scripts/rebuild-catalog.mjs
```

Three things it deliberately won't do:

- **Punish a studio for being down.** If a feed fails or comes back suspiciously
  short, that studio's mugs are left exactly as they are and the job fails loudly,
  rather than marking them all sold out.
- **Ship data that breaks the app.** Lint, tests and the build run against the new
  catalogue before anything is committed.
- **Accept a change that looks like a bug.** It refuses to write if too much of the
  catalogue vanishes at once, if a studio's stock empties in one go, if a price
  moves by more than 3×, or if a single run would add more products than a real
  drop plausibly contains. `scripts/catalog-merge.js` holds those rules and
  `scripts/catalog-merge.test.js` covers them.

Because a push made with `GITHUB_TOKEN` doesn't trigger other workflows, the
refresh calls the deploy workflow directly once it commits.

## Where the catalogue comes from

`src/data/catalog.json` is a snapshot of each studio's public product feed
(`/products.json`), filtered down to drinkware and de-duplicated — every mug they
list, not a sample. Prices and stock were correct at the time of the snapshot; the
product links always show the live truth.
