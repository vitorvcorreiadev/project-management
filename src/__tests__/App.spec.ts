import { describe, it, expect, vi } from 'vitest'

import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'

import App from '../App.vue'
import AppTopbar from '../components/AppTopbar.vue'
import appRouter from '../router'

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRoute: () => ({ name: 'projects', meta: {} }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  RouterView: { template: '<div />' },
  RouterLink: { template: '<a><slot /></a>' },
}))

function mountApp() {
  return mount(App, { global: { plugins: [createPinia()] } })
}

describe('App', () => {
  it('renders the AppTopbar', () => {
    expect(mountApp().findComponent(AppTopbar).exists()).toBe(true)
  })

  it('renders the RouterView', () => {
    expect(mountApp().find('div').exists()).toBe(true)
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
