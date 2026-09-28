import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'

import NewProject from '../views/NewProject.vue'
import { getCover } from '../db/covers'
import { useProjectsStore } from '../stores/projects'
import type { Project } from '../types/project'

const { push } = vi.hoisted(() => ({ push: vi.fn<(to: string) => unknown>() }))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push, back: vi.fn<() => void>() }),
}))

// Delegates to the real implementation so the happy-path tests exercise the
// actual IndexedDB round trip; the failure test arms this to reject.
const { coversFailure } = vi.hoisted(() => ({ coversFailure: { current: null as Error | null } }))

vi.mock('../db/covers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../db/covers')>()

  return {
    ...actual,
    saveCover: async (projectId: number, file: File) => {
      if (coversFailure.current) throw coversFailure.current

      return actual.saveCover(projectId, file)
    },
  }
})

const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:capa')
const revokeObjectURL = vi.fn<(url: string) => void>()

/*
 * The page holds a transient `File` that must never reach the Pinia store:
 * `pinia-plugin-persistedstate` would JSON it into `{}`. So the split under test
 * is that `handleSubmit` writes the bytes to IndexedDB keyed by `form.id` and only
 * then commits a store entry whose sole trace of the image is `hasCover`.
 *
 * `handleSubmit` awaits the write before committing, so assertions go through
 * `vi.waitFor` — a fixed number of promise flushes would race the `openDB`
 * handshake, which fake-indexeddb runs on its own schedule.
 *
 * jsdom implements neither IndexedDB nor `URL.createObjectURL`, hence the two
 * imports/stubs above: `fake-indexeddb/auto` backs the store, and the stub lets
 * `ImageInput` build a preview URL for the file the page then persists.
 */
describe('NewProject', () => {
  function mountPage() {
    const pinia = createPinia()
    setActivePinia(pinia)

    return mount(NewProject, { global: { plugins: [pinia] } })
  }

  function buildFile(name = 'capa.png', type = 'image/png', contents = 'cover-bytes'): File {
    return new File([contents], name, { type })
  }

  // `Array.prototype.at` is unavailable here: tsconfig.vitest.json pins `lib: []`.
  function lastProject(): Project | undefined {
    const { projects } = useProjectsStore()

    return projects[projects.length - 1]
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
    coversFailure.current = null
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()

    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
  })

  it('previews the selected image before anything is saved', async () => {
    const wrapper = mountPage()
    const file = buildFile()

    await selectCover(wrapper, file)

    expect(createObjectURL).toHaveBeenCalledWith(file)
    expect(wrapper.find('.image-input').classes()).toContain('has-preview')
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

  it('stores the chosen dates verbatim, as calendar days with no time or zone', async () => {
    const wrapper = mountPage()

    await submit(wrapper)

    await vi.waitFor(() => {
      expect(lastProject()?.started_at).toBe('2026-09-01')
    })

    const created = lastProject()

    expect(created?.started_at).toBe('2026-09-01')
    expect(created?.end_at).toBe('2026-12-15')
  })

  it('stores the chosen file in IndexedDB under the new project id', async () => {
    const wrapper = mountPage()

    await selectCover(wrapper, buildFile('capa-escolhida.png'))
    await submit(wrapper)

    await vi.waitFor(() => {
      expect(lastProject()?.hasCover).toBe(true)
    })

    const created = lastProject()
    const record = await getCover(created?.id ?? -1)

    expect(record?.name).toBe('capa-escolhida.png')
  })

  it('never puts the image itself on the project record', async () => {
    const wrapper = mountPage()

    await selectCover(wrapper, buildFile())
    await submit(wrapper)

    await vi.waitFor(() => {
      expect(lastProject()?.hasCover).toBe(true)
    })

    // What `pinia-plugin-persistedstate` writes to localStorage: no room for a
    // payload, only the flag pointing at the record in IndexedDB.
    const roundTripped = JSON.parse(JSON.stringify(lastProject())) as Record<string, unknown>

    expect(Object.keys(roundTripped).sort()).toEqual([
      'client',
      'end_at',
      'favorited',
      'hasCover',
      'id',
      'name',
      'started_at',
    ])
  })

  it('marks the project as having no cover when no file is chosen', async () => {
    const wrapper = mountPage()

    await submit(wrapper)

    await vi.waitFor(() => {
      expect(lastProject()?.hasCover).toBe(false)
    })
  })

  it('writes nothing to IndexedDB when no cover is selected', async () => {
    const wrapper = mountPage()

    await submit(wrapper)

    await vi.waitFor(() => {
      expect(push).toHaveBeenCalledWith('/')
    })

    await expect(getCover(lastProject()?.id ?? -1)).resolves.toBeUndefined()
  })

  it('refuses a file that is not an image and saves no cover', async () => {
    const wrapper = mountPage()

    await selectCover(wrapper, buildFile('notas.pdf', 'application/pdf'))
    await submit(wrapper)

    await vi.waitFor(() => {
      expect(lastProject()?.hasCover).toBe(false)
    })

    await expect(getCover(lastProject()?.id ?? -1)).resolves.toBeUndefined()
  })

  it('keeps the project out of the store when the cover cannot be written', async () => {
    const wrapper = mountPage()
    const store = useProjectsStore()
    const before = store.projects.length

    coversFailure.current = new Error('quota exceeded')

    await selectCover(wrapper, buildFile())
    await submit(wrapper)

    await vi.waitFor(() => {
      expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    })

    expect(store.projects).toHaveLength(before)
    expect(push).not.toHaveBeenCalled()
    expect(wrapper.find('[role="alert"]').text()).toContain('capa do projeto')
  })
})
