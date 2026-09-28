import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'

import EditProject from '../views/EditProject.vue'
import { useProjectsStore } from '../stores/projects'
import { getCover } from '../db/covers'
import type { Project } from '../types/project'

const { push, route } = vi.hoisted(() => ({
  push: vi.fn<(to: string) => unknown>(),
  route: { params: {} as { id?: string } },
}))

type ProjectsStore = ReturnType<typeof useProjectsStore>

vi.mock('vue-router', () => ({
  useRouter: () => ({ push, back: vi.fn<() => void>() }),
  useRoute: () => route,
}))

describe('EditProject', () => {
  function mountPage(id = '1', seed?: (store: ProjectsStore) => void) {
    route.params.id = id

    const pinia = createPinia()
    setActivePinia(pinia)

    const store = useProjectsStore()

    seed?.(store)

    return mount(EditProject, { global: { plugins: [pinia] } })
  }

  function storedProject(id: number): Project | undefined {
    return useProjectsStore().projects.find((project) => project.id === id)
  }

  function requireProject(id: number): Project {
    const project = storedProject(id)

    if (!project) throw new Error(`seeded project ${id} is missing`)

    return project
  }

  function inputValue(wrapper: ReturnType<typeof mountPage>, name: string): string {
    const input = wrapper.find(`input[name="${name}"]`).element as HTMLInputElement

    return input.value
  }

  async function selectCover(wrapper: ReturnType<typeof mountPage>, file: File) {
    const input = wrapper.find('input[type="file"]')

    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
  }

  async function renameProject(wrapper: ReturnType<typeof mountPage>, name: string) {
    await wrapper.find('input[name="name"]').setValue(name)
    await wrapper.find('form').trigger('submit')
  }

  beforeEach(() => {
    push.mockReset()

    URL.createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:capa')
    URL.revokeObjectURL = vi.fn<(url: string) => void>()
  })

  it('names the page in the breadcrumb', () => {
    const wrapper = mountPage()

    expect(wrapper.find('h2').text()).toBe('Editar projeto')
  })

  it('fills the form with the project the route points at', () => {
    const wrapper = mountPage('2')

    expect(inputValue(wrapper, 'name')).toBe('Projeto 2')
    expect(inputValue(wrapper, 'client')).toBe('Clicksign')
    expect(inputValue(wrapper, 'started_at')).toBe('2025-01-27')
    expect(inputValue(wrapper, 'end_at')).toBe('2025-06-30')
  })

  it('updates the stored project instead of appending a new one', async () => {
    const wrapper = mountPage()
    const store = useProjectsStore()
    const before = store.projects.length

    await renameProject(wrapper, 'Projeto 1 renomeado')

    await vi.waitFor(() => {
      expect(storedProject(1)?.name).toBe('Projeto 1 renomeado')
    })
    expect(store.projects).toHaveLength(before)
  })

  it('keeps the id of the edited project', async () => {
    const wrapper = mountPage()

    await renameProject(wrapper, 'Projeto 1 renomeado')

    await vi.waitFor(() => {
      expect(storedProject(1)?.name).toBe('Projeto 1 renomeado')
    })
    expect(storedProject(1)?.id).toBe(1)
  })

  it('commits the edited fields, dates included', async () => {
    const wrapper = mountPage()

    await wrapper.find('input[name="client"]').setValue('Novo cliente')
    await wrapper.find('input[name="started_at"]').setValue('2026-02-01')
    await wrapper.find('form').trigger('submit')

    await vi.waitFor(() => {
      expect(storedProject(1)?.client).toBe('Novo cliente')
    })

    expect(storedProject(1)?.started_at).toBe('2026-02-01')
    expect(storedProject(1)?.end_at).toBe('2026-06-30')
  })

  it('leaves the other projects untouched', async () => {
    const wrapper = mountPage()

    await renameProject(wrapper, 'Projeto 1 renomeado')

    await vi.waitFor(() => {
      expect(storedProject(1)?.name).toBe('Projeto 1 renomeado')
    })
    expect(storedProject(2)?.name).toBe('Projeto 2')
  })

  it('does not reset a project that was favorited', async () => {
    const wrapper = mountPage('1', (store) => {
      store.toggleFavorite(1)
    })

    await renameProject(wrapper, 'Projeto 1 renomeado')

    await vi.waitFor(() => {
      expect(storedProject(1)?.name).toBe('Projeto 1 renomeado')
    })
    expect(storedProject(1)?.favorited).toBe(true)
  })

  it('keeps the existing cover when no new image is chosen', async () => {
    const wrapper = mountPage('1', () => {
      requireProject(1).hasCover = true
    })

    await renameProject(wrapper, 'Projeto 1 renomeado')

    await vi.waitFor(() => {
      expect(storedProject(1)?.name).toBe('Projeto 1 renomeado')
    })
    expect(storedProject(1)?.hasCover).toBe(true)
  })

  it('marks the project as having a cover once an image is chosen', async () => {
    const wrapper = mountPage()
    const file = new File(['cover-bytes'], 'capa.png', { type: 'image/png' })

    await selectCover(wrapper, file)
    await renameProject(wrapper, 'Projeto 1 renomeado')

    await vi.waitFor(() => {
      expect(storedProject(1)?.hasCover).toBe(true)
    })
    await expect(getCover(1)).resolves.toBeDefined()
  })

  it('returns to the listing once the project is saved', async () => {
    const wrapper = mountPage()

    await renameProject(wrapper, 'Projeto 1 renomeado')

    await vi.waitFor(() => {
      expect(push).toHaveBeenCalledWith('/')
    })
  })

  it('leaves the project out of the store when the form refuses it', async () => {
    const wrapper = mountPage()
    const store = useProjectsStore()
    const before = store.projects.length

    // A single word fails the two-word rule on the seeded name.
    await wrapper.find('input[name="name"]').setValue('X')
    await wrapper.find('form').trigger('submit')

    expect(store.projects).toHaveLength(before)
    expect(storedProject(1)?.name).toBe('Projeto 1')
    expect(push).not.toHaveBeenCalled()
  })
})
