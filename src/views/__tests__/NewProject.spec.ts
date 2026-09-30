import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'

import NewProject from '../NewProject.vue'
import { useProjectsStore } from '../../stores/projects'
import type { Project } from '../../types/project'

const { push } = vi.hoisted(() => ({ push: vi.fn<(to: string) => unknown>() }))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push, back: vi.fn<() => void>() }),
}))


describe('NewProject', () => {
  function mountPage() {
    const pinia = createPinia()
    setActivePinia(pinia)

    return mount(NewProject, { global: { plugins: [pinia] } })
  }

  function lastProject(): Project | undefined {
    const { projects } = useProjectsStore()

    return projects.at(-1)
  }

  function buildFile(name = 'capa.png'): File {
    return new File(['cover-bytes'], name, { type: 'image/png' })
  }

  async function selectCover(wrapper: ReturnType<typeof mountPage>, file: File) {
    const input = wrapper.find('input[type="file"]')

    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
  }

  async function submit(wrapper: ReturnType<typeof mountPage>) {
    await wrapper.find('input[name="name"]').setValue('Projeto novo')
    await wrapper.find('input[name="client"]').setValue('Clicksign')
    await wrapper.find('input[name="started_at"]').setValue('2026-09-01')
    await wrapper.find('input[name="end_at"]').setValue('2026-12-15')
    await wrapper.find('form').trigger('submit')
  }

  beforeEach(() => {
    push.mockReset()

    URL.createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:capa')
    URL.revokeObjectURL = vi.fn<(url: string) => void>()
  })

  it('names the page in the breadcrumb', () => {
    const wrapper = mountPage()

    expect(wrapper.find('h2').text()).toBe('Novo projeto')
  })

  it('adds the project to the store on submit', async () => {
    const wrapper = mountPage()
    const store = useProjectsStore()
    const before = store.projects.length

    await submit(wrapper)

    await vi.waitFor(() => {
      expect(store.projects).toHaveLength(before + 1)
    })
    expect(lastProject()?.name).toBe('Projeto novo')
  })

  it('commits the whole record the form emitted, dates included', async () => {
    const wrapper = mountPage()

    await submit(wrapper)

    await vi.waitFor(() => {
      expect(lastProject()?.name).toBe('Projeto novo')
    })

    const created = lastProject()

    expect(created?.client).toBe('Clicksign')
    expect(created?.started_at).toBe('2026-09-01')
    expect(created?.end_at).toBe('2026-12-15')
    expect(created?.favorited).toBe(false)
  })

  it('marks the project as having a cover once an image was chosen', async () => {
    const wrapper = mountPage()

    await selectCover(wrapper, buildFile())
    await submit(wrapper)

    await vi.waitFor(() => {
      expect(lastProject()?.hasCover).toBe(true)
    })
  })

  it('returns to the listing once the project is saved', async () => {
    const wrapper = mountPage()

    await submit(wrapper)

    await vi.waitFor(() => {
      expect(push).toHaveBeenCalledWith({ name: 'projects' })
    })
  })

  it('keeps the project out of the store when the form refuses it', async () => {
    const wrapper = mountPage()
    const store = useProjectsStore()
    const before = store.projects.length

    await wrapper.find('form').trigger('submit')

    expect(store.projects).toHaveLength(before)
    expect(push).not.toHaveBeenCalled()
  })
})
