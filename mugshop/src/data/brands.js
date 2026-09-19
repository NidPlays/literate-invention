// Real studios, real storefronts. Every product links back to its own page.
export const BRANDS = {
  'house-of-ceramics': {
    name: 'House of Ceramics',
    site: 'https://www.houseofceramics.in',
    city: 'Gurgaon',
    blurb: 'Hand-painted everyday ceramics — mugs with lids, bows, mushrooms and a lot of colour.',
    accent: '#e0523f',
  },
  klaylist: {
    name: 'Klaylist',
    site: 'https://klaylist.com',
    city: 'India',
    blurb: 'Quiet contemporary stoneware. Speckles, unibody handles, mug-and-saucer sets.',
    accent: '#6b7f5e',
  },
  'the-strange-co': {
    name: 'The Strange Co',
    site: 'https://thestrangeco.com',
    city: 'Delhi',
    blurb: 'Handmade, a little odd, on purpose. Local clay, natural dyes, characters with names.',
    accent: '#3f5c8c',
  },
  craftribal: {
    name: 'Craftribal',
    site: 'https://craftribal.com',
    city: 'India',
    blurb: 'Desi-coded mugs — kadak chai, evil eyes, lids, sippers, snack-plate combos.',
    accent: '#c2763a',
  },
  myaha: {
    name: 'Myaha',
    site: 'https://www.myahaliving.com',
    city: 'India',
    blurb: 'Grown-up tableware — the Moss coffee range, espresso cups and glassware sets.',
    accent: '#4f7a66',
  },
  'saabi-house': {
    name: 'Saabi House',
    site: 'https://saabihouse.in',
    city: 'India',
    blurb: 'Glossy artisan mugs and tumblers, made in small batches by Indian potters.',
    accent: '#a84a72',
  },
}

export const BRAND_ORDER = Object.keys(BRANDS)

// On the list, but they don't make drinkware — credited, not shoppable.
export const OTHER_STUDIOS = [
  {
    name: 'Sāh',
    site: 'https://sah-studio.com',
    blurb: 'Wabi, Nok and Florene vases, planters and urns. Beautiful — but no mugs or cups in their shop.',
  },
  {
    name: 'Dophari',
    site: 'https://dophari.com',
    blurb: 'Sculptural lamps, pendants and vases. Also no drinkware, so nothing of theirs is in the grid.',
  },
]
