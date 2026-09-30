import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'

import AppTopbar from '../AppTopbar.vue'
import { useProjectsStore } from '@/stores/projects'
import type { Project } from '@/types/project'

const { route } = vi.hoisted(() => ({
  route: { name: 'projects', meta: {} as { hideSearch?: boolean } },
}))

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRoute: () => route,
  useRouter: () => ({ push: vi.fn<() => void>(), back: vi.fn<() => void>() }),
  RouterView: { render: () => null },
  RouterLink: { template: '<a><slot /></a>' },
}))

vi.mock('@/components/search/SearchBox.vue', () => ({
  default: { template: '<div class="search-box" />' },
}))

function buildProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    name: 'Projeto 1',
    client: 'Clicksign',
    started_at: '2026-09-01',
    end_at: '2026-12-15',
    favorited: false,
    hasCover: false,
    ...overrides,
  }
}

function createTopbar() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return { pinia }
}

describe('AppTopbar', () => {
  beforeEach(() => {
    route.meta = {}
  })

  it('shows the search when hideSearch is falsy and projects exist', () => {
    const { pinia } = createTopbar()
    const store = useProjectsStore(pinia)
    store.createProject(buildProject())

    const wrapper = mount(AppTopbar, { global: { plugins: [pinia] } })

    expect(wrapper.find('.search-box').exists()).toBe(true)
  })

  it('hides the search when hideSearch is true and projects exist', () => {
    const { pinia } = createTopbar()
    const store = useProjectsStore(pinia)
    store.createProject(buildProject())

    route.meta = { hideSearch: true }

    const wrapper = mount(AppTopbar, { global: { plugins: [pinia] } })

    expect(wrapper.find('.search-box').exists()).toBe(false)
  })

  it('hides the search when hideSearch is falsy and projects is empty', () => {
    const { pinia } = createTopbar()

    const wrapper = mount(AppTopbar, { global: { plugins: [pinia] } })

    expect(wrapper.find('.search-box').exists()).toBe(false)
  })

  it('renders the logo link to the projects route', () => {
    const { pinia } = createTopbar()

    const wrapper = mount(AppTopbar, { global: { plugins: [pinia] } })

    expect(wrapper.find('a').exists()).toBe(true)
  })

  it('renders the heading text', () => {
    const { pinia } = createTopbar()

    const wrapper = mount(AppTopbar, { global: { plugins: [pinia] } })

    expect(wrapper.get('h1').text()).toBe('Gerenciador de Projetos')
  })
})
