import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
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
})
