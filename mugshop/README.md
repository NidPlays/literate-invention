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

## Where the catalogue comes from

`src/data/catalog.json` is a snapshot of each studio's public product feed
(`/products.json`), filtered down to drinkware, de-duplicated and capped at 30
pieces per studio. Prices and stock were correct at the time of the snapshot —
the product links always show the live truth.
