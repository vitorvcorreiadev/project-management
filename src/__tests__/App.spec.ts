import { describe, it, expect, vi } from 'vitest'

import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'

import App from '../App.vue'
import appRouter from '../router'

const { route, push, back } = vi.hoisted(() => ({
  route: { name: 'projects', meta: {} as { hideSearch?: boolean } },
  push: vi.fn<(to: string) => unknown>(),
  back: vi.fn<() => void>(),
}))

// Keeps the real `createRouter` so the route table below is the shipped one, but
// hands `App` a fixed route so each page can be mounted on its own.
vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRoute: () => route,
  useRouter: () => ({ push, back }),
  RouterView: { render: () => null },
}))

function mountApp(name: string, hideSearch = false) {
  route.name = name
  route.meta = hideSearch ? { hideSearch: true } : {}

  return mount(App, { global: { plugins: [createPinia()] } })
}

describe('App', () => {
  it('shows the search on the projects listing', () => {
    expect(mountApp('projects').find('.search-box').exists()).toBe(true)
  })

  it('shows the search on the search result', () => {
    expect(mountApp('projects-search-result').find('.search-box').exists()).toBe(true)
  })

  it('hides the search on the new project page', () => {
    expect(mountApp('new-project', true).find('.search-box').exists()).toBe(false)
  })

  it('hides the search on the edit project page', () => {
    expect(mountApp('edit-project', true).find('.search-box').exists()).toBe(false)
  })
})

describe('router meta', () => {
  const RECORDS = [
    { path: '/', hideSearch: undefined },
    { path: '/search', hideSearch: undefined },
    { path: '/projects/new', hideSearch: true },
    { path: '/projects/1/edit', hideSearch: true },
  ] as const

  it.each(RECORDS)('resolves $path with hideSearch $hideSearch', ({ path, hideSearch }) => {
    expect(appRouter.resolve(path).meta.hideSearch).toBe(hideSearch)
  })
})
