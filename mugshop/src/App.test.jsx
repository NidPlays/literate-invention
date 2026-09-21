import { beforeEach, describe, expect, it } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'
import catalog from './data/catalog.json'
import { BRANDS } from './data/brands.js'

beforeEach(() => localStorage.clear())

describe('catalog data', () => {
  it('only contains products from known brands, with a price, images and a real link', () => {
    expect(catalog.length).toBeGreaterThan(50)
    for (const p of catalog) {
      expect(BRANDS[p.brand]).toBeTruthy()
      expect(p.price).toBeGreaterThan(0)
      expect(p.images.length).toBeGreaterThan(0)
      expect(p.url.startsWith(BRANDS[p.brand].site)).toBe(true)
    }
  })

  it('has no duplicate product ids', () => {
    expect(new Set(catalog.map((p) => p.id)).size).toBe(catalog.length)
  })
})

describe('the shop', () => {
  const resultCount = () => Number(document.querySelector('.toolbar span').textContent.split(' ')[0])

  it('shows mugs and filters them by search', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getAllByRole('button', { name: /^Open / }).length).toBeGreaterThan(0)
    const before = resultCount()

    await user.type(screen.getByLabelText('Search mugs'), 'chai')
    expect(resultCount()).toBeLessThan(before)
    expect(resultCount()).toBeGreaterThan(0)
  })

  it('shows sold-out mugs by default and hides them on one tap', async () => {
    const user = userEvent.setup()
    render(<App />)
    const soldOut = catalog.filter((p) => p.soldOut).length
    expect(soldOut).toBeGreaterThan(0)
    const all = resultCount()
    expect(all).toBe(catalog.length)

    await user.click(screen.getByRole('button', { name: /hide sold out/ }))
    expect(resultCount()).toBe(all - soldOut)
  })

  it('matches search terms at word starts, not inside other words', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Search mugs'), 'cat')
    const titles = screen.getAllByRole('button', { name: /^Open / }).map((b) => b.getAttribute('aria-label'))
    expect(titles.length).toBeGreaterThan(0)
    expect(titles.join(' ').toLowerCase()).not.toMatch(/delicate|category/)
  })

  it('loads more mugs as she reaches the bottom', async () => {
    render(<App />)
    const first = screen.getAllByRole('button', { name: /^Open / }).length
    expect(first).toBeLessThan(catalog.length)

    await act(async () => {
      globalThis.TestIntersectionObserver.scrollIntoView()
    })
    expect(screen.getAllByRole('button', { name: /^Open / }).length).toBeGreaterThan(first)
  })

  it('filters by brand chip', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Klaylist' }))
    expect(screen.getAllByText('Klaylist').length).toBeGreaterThan(1)
    expect(screen.queryByText('Craftribal', { selector: '.brand-line' })).toBeNull()
  })

  it('hearts a mug, shows a love note, and can filter to hearted only', async () => {
    const user = userEvent.setup()
    render(<App />)
    const heart = screen.getAllByRole('button', { name: /^Heart / })[0]
    await user.click(heart)
    expect(document.querySelector('.toast')).not.toBeNull()

    await user.click(screen.getByLabelText('Show only hearted'))
    expect(screen.getAllByRole('button', { name: /^Open / })).toHaveLength(1)
  })

  it('adds to the bag and reaches the picks screen with a working source link', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getAllByRole('button', { name: /^Open / })[0])
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /^add · ₹/ }))

    await user.click(screen.getByRole('button', { name: 'done picking' }))
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/picks/)
    const link = screen.getAllByRole('link')[0]
    expect(link.getAttribute('href')).toMatch(/^https:\/\//)
    expect(link).toHaveAttribute('target', '_blank')
  })

  // The sheet's reels gesture: a touch drag past an edge of the scrolling body.
  const drag = (dy) => {
    const body = document.querySelector('.sheet-body')
    const touch = (type, y) => {
      const event = new Event(type, { bubbles: true, cancelable: true })
      event.touches = type === 'touchstart' || type === 'touchmove' ? [{ clientY: y }] : []
      fireEvent(body, event)
    }
    touch('touchstart', 400)
    touch('touchmove', 400 + dy)
    touch('touchend', 400 + dy)
  }
  const sheetTitle = () => within(screen.getByRole('dialog')).getByRole('heading', { level: 3 }).textContent
  const sheetCount = () => document.querySelector('.sheet-count').textContent

  it('scrolls on to the next mug and back on phone-sized screens', async () => {
    const user = userEvent.setup()
    globalThis.setViewportWidth(390)
    render(<App />)
    await user.click(screen.getAllByRole('button', { name: /^Open / })[0])
    const first = sheetTitle()
    expect(sheetCount()).toMatch(/^1 \//)

    // A short tug is just an elastic pull — she stays on this mug.
    await act(async () => drag(-40))
    expect(sheetTitle()).toBe(first)

    // A real drag up at the bottom moves her on, with the slide-up animation.
    await act(async () => drag(-260))
    const second = sheetTitle()
    expect(second).not.toBe(first)
    expect(sheetCount()).toMatch(/^2 \//)
    expect(document.querySelector('.reel').getAttribute('data-enter')).toBe('up')

    // Dragging down at the top takes her back.
    await act(async () => drag(260))
    expect(sheetTitle()).toBe(first)
    expect(document.querySelector('.reel').getAttribute('data-enter')).toBe('down')
  })

  it('does not run past the ends of the list', async () => {
    const user = userEvent.setup()
    globalThis.setViewportWidth(390)
    render(<App />)
    await user.click(screen.getAllByRole('button', { name: /^Open / })[0])
    const first = sheetTitle()

    // Already on the first mug: there is nothing before it.
    await act(async () => drag(260))
    expect(sheetTitle()).toBe(first)
    expect(sheetCount()).toMatch(/^1 \//)
  })

  it('pages through the hearted mugs only, when that filter is on', async () => {
    const user = userEvent.setup()
    globalThis.setViewportWidth(390)
    render(<App />)
    const hearts = screen.getAllByRole('button', { name: /^Heart / })
    await user.click(hearts[0])
    await user.click(hearts[3])
    await user.click(screen.getByLabelText('Show only hearted'))

    const cards = screen.getAllByRole('button', { name: /^Open / })
    expect(cards).toHaveLength(2)
    await user.click(cards[0])
    expect(sheetCount()).toBe('1 / 2')

    await act(async () => drag(-260))
    expect(sheetCount()).toBe('2 / 2')

    // The list ends here, because the shop behind it does too.
    await act(async () => drag(-260))
    expect(sheetCount()).toBe('2 / 2')
  })

  it('leaves the gesture off on desktop, where arrow keys page instead', async () => {
    const user = userEvent.setup()
    globalThis.setViewportWidth(1200)
    render(<App />)
    await user.click(screen.getAllByRole('button', { name: /^Open / })[0])
    const first = sheetTitle()

    await act(async () => drag(-260))
    expect(sheetTitle()).toBe(first)

    await user.keyboard('{ArrowRight}')
    expect(sheetTitle()).not.toBe(first)
    await user.keyboard('{ArrowLeft}')
    expect(sheetTitle()).toBe(first)
  })

  it('keeps the logo bar on the picks screen and goes back from it', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getAllByRole('button', { name: /^Open / })[0])
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /^add · ₹/ }))

    await user.click(screen.getByRole('button', { name: 'done picking' }))
    const logo = screen.getByRole('button', { name: 'Back to MUG STREET' })

    await user.click(logo)
    expect(screen.getByLabelText('Search mugs')).not.toBeNull()
  })
})
