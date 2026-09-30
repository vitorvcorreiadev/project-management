import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import ProjectForm from '../../../components/project/ProjectForm.vue'
import { clearCoverUrlCache, getCover, saveCover } from '../../../db/covers'
import type { Project } from '../../../types/project'

/*
 * `coversFailure` makes `saveCover` reject; `releaseCover` makes it hang. Both
 * reach the component only through the mocked module, so the happy path still
 * exercises the real IndexedDB round trip.
 */
const { coversFailure, releaseCover } = vi.hoisted(() => ({
  coversFailure: { current: null as Error | null },
  releaseCover: { current: null as (() => void) | null },
}))

vi.mock('@/db/covers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../db/covers')>()

  return {
    ...actual,
    saveCover: async (projectId: number, file: File) => {
      if (coversFailure.current) throw coversFailure.current

      if (releaseCover.current) {
        await new Promise<void>((resolve) => {
          releaseCover.current = resolve
        })
      }

      return actual.saveCover(projectId, file)
    },
  }
})

let minted = 0

const createObjectURL = vi.fn<(blob: Blob) => string>(() => `blob:capa-${++minted}`)
const revokeObjectURL = vi.fn<(url: string) => void>()

function mountForm(options: { attachTo?: Element; initial?: Project } = {}) {
  return mount(ProjectForm, {
    props: options.initial ? { initial: options.initial } : {},
    attachTo: options.attachTo,
  })
}

type FormWrapper = ReturnType<typeof mountForm>

const VALID: [string, string][] = [
  ['name', 'Loja Virtual'],
  ['client', 'Clicksign'],
  ['started_at', '2026-09-01'],
  ['end_at', '2026-12-15'],
]

function buildFile(name = 'capa.png', type = 'image/png', contents = 'cover-bytes'): File {
  return new File([contents], name, { type })
}

const SEEDED: Project = {
  id: 7,
  name: 'Loja Virtual',
  client: 'Clicksign',
  started_at: '2026-09-01',
  end_at: '2026-12-15',
  favorited: true,
  hasCover: true,
}

function savedProject(wrapper: FormWrapper): Project | undefined {
  const emitted = wrapper.emitted<[Project]>('save')

  return emitted?.at(-1)?.[0]
}

async function selectCover(wrapper: FormWrapper, file: File) {
  const input = wrapper.find('input[type="file"]')

  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  await input.trigger('change')
}

async function removeCover(wrapper: FormWrapper) {
  await wrapper.find('button[aria-label="Remover imagem"]').trigger('click')
}

async function seedCover(id: number, name = 'capa-salva.png') {
  await saveCover(id, buildFile(name, 'image/png', 'bytes-salvos'))
}

function previewSrc(wrapper: FormWrapper): string | undefined {
  const image = wrapper.find('.image-input img')

  return image.exists() ? image.attributes('src') : undefined
}

async function waitForPreview(wrapper: FormWrapper, src: string) {
  await vi.waitFor(() => {
    expect(previewSrc(wrapper)).toBe(src)
  })
}

async function fillFields(wrapper: FormWrapper, values: [string, string][] = VALID) {
  for (const [name, value] of values) {
    await wrapper.find(`input[name="${name}"]`).setValue(value)
  }
}

async function submit(wrapper: FormWrapper, values: [string, string][] = VALID) {
  await fillFields(wrapper, values)
  await wrapper.find('form').trigger('submit')
}

function errorFor(wrapper: FormWrapper, field: string): string | undefined {
  const label = wrapper.find(`input[name="${field}"]`).element.closest('label')

  return label?.querySelector('[role="alert"]')?.textContent ?? undefined
}

// `ImageInput` puts its own button ("Selecionar", or "Remover imagem" once a
// preview is shown) in the DOM ahead of the submit one, so the first `button`
// inside the form is never the submit button. Only the submit `BaseButton` is a
// direct child of the `<form>`: `BaseInput` renders a label, and `ImageInput`
// nests its button one level deeper.
function submitButton(wrapper: FormWrapper) {
  return wrapper.find('form > button')
}

async function waitForSave(wrapper: FormWrapper): Promise<Project> {
  await vi.waitFor(() => {
    expect(wrapper.emitted('save')).toHaveLength(1)
  })

  return savedProject(wrapper) as Project
}

/*
 * The form holds a transient `File` that must never reach the caller: the store
 * is persisted to localStorage, which would JSON the image into `{}`. So the
 * split under test is that the form writes the bytes to IndexedDB keyed by
 * `form.id` and emits a record whose sole trace of the image is `hasCover`.
 *
 * Editing sees the other side of that split: the form resolves the cover already
 * on disk and shows it in the field, so the user can throw it away or overwrite
 * it. Removal and a new pick are both local until submit, which is why the
 * "abandons the form" case below asserts the stored bytes are still there.
 *
 * Submitting awaits that write before emitting, so assertions go through
 * `vi.waitFor` — a fixed number of promise flushes would race the `openDB`
 * handshake, which fake-indexeddb runs on its own schedule.
 *
 * jsdom implements neither IndexedDB nor `URL.createObjectURL`, hence the two
 * imports/stubs above: `fake-indexeddb/auto` backs the store, and the stub lets
 * `ImageInput` build a preview URL for the file the form then persists. It hands
 * out a numbered url per call so the stored cover and the fresh pick can be told
 * apart.
 */
describe('ProjectForm', () => {
  beforeEach(() => {
    clearCoverUrlCache()
    coversFailure.current = null
    releaseCover.current = null
    minted = 0
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()

    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
  })

  it('previews the selected image before anything is saved', async () => {
    const wrapper = mountForm()
    const file = buildFile()

    await selectCover(wrapper, file)

    expect(createObjectURL).toHaveBeenCalledWith(file)
    expect(wrapper.find('.image-input').classes()).toContain('has-preview')
  })

  it('emits the project on submit', async () => {
    const wrapper = mountForm()

    await submit(wrapper)

    expect((await waitForSave(wrapper)).name).toBe('Loja Virtual')
  })

  it('emits the draft untouched, so the caller never has to invent a flag', async () => {
    const wrapper = mountForm()

    await submit(wrapper)

    const saved = await waitForSave(wrapper)

    expect(saved.favorited).toBe(false)
    expect(Object.keys(saved).sort()).toEqual([
      'client',
      'end_at',
      'favorited',
      'hasCover',
      'id',
      'name',
      'started_at',
    ])
  })

  it('emits an id, the key the cover is written under', async () => {
    const wrapper = mountForm()

    await submit(wrapper)

    expect((await waitForSave(wrapper)).id).toBeTypeOf('number')
  })

  it('stores the chosen dates verbatim, as calendar days with no time or zone', async () => {
    const wrapper = mountForm()

    await submit(wrapper)

    const saved = await waitForSave(wrapper)

    expect(saved.started_at).toBe('2026-09-01')
    expect(saved.end_at).toBe('2026-12-15')
  })

  it('stores the chosen file in IndexedDB under the emitted id', async () => {
    const wrapper = mountForm()

    await selectCover(wrapper, buildFile('capa-escolhida.png'))
    await submit(wrapper)

    const saved = await waitForSave(wrapper)

    expect(saved.hasCover).toBe(true)

    const record = await getCover(saved.id)

    expect(record?.name).toBe('capa-escolhida.png')
  })

  it('never puts the image itself on the emitted record', async () => {
    const wrapper = mountForm()

    await selectCover(wrapper, buildFile())
    await submit(wrapper)

    expect((await waitForSave(wrapper)).hasCover).toBe(true)

    // What `pinia-plugin-persistedstate` writes to localStorage: no room for a
    // payload, only the flag pointing at the record in IndexedDB.
    const roundTripped = JSON.parse(JSON.stringify(savedProject(wrapper))) as Record<
      string,
      unknown
    >

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

  it('emits hasCover false when no file is chosen', async () => {
    const wrapper = mountForm()

    await submit(wrapper)

    expect((await waitForSave(wrapper)).hasCover).toBe(false)
  })

  it('writes nothing to IndexedDB when no cover is selected', async () => {
    const wrapper = mountForm()

    await submit(wrapper)

    const saved = await waitForSave(wrapper)

    await expect(getCover(saved.id)).resolves.toBeUndefined()
  })

  it('refuses a file that is not an image and emits no cover', async () => {
    const wrapper = mountForm()

    await selectCover(wrapper, buildFile('notas.pdf', 'application/pdf'))
    await submit(wrapper)

    const saved = await waitForSave(wrapper)

    expect(saved.hasCover).toBe(false)
    await expect(getCover(saved.id)).resolves.toBeUndefined()
  })

  it('emits nothing when the cover cannot be written', async () => {
    const wrapper = mountForm()

    coversFailure.current = new Error('quota exceeded')

    await selectCover(wrapper, buildFile())
    await submit(wrapper)

    await vi.waitFor(() => {
      expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    })

    expect(wrapper.emitted('save')).toBeUndefined()
    expect(wrapper.find('[role="alert"]').text()).toContain('capa do projeto')
  })

  it('clears the save error once the user picks another image', async () => {
    const wrapper = mountForm()

    coversFailure.current = new Error('quota exceeded')

    await selectCover(wrapper, buildFile())
    await submit(wrapper)

    await vi.waitFor(() => {
      expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    })

    coversFailure.current = null
    await selectCover(wrapper, buildFile('outra-capa.png'))

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('emits only once while the cover is still being written', async () => {
    const wrapper = mountForm()

    await fillFields(wrapper)
    await selectCover(wrapper, buildFile())

    await wrapper.find('form').trigger('submit')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('save')).toBeUndefined()

    releaseCover.current?.()

    await vi.waitFor(() => {
      expect(wrapper.emitted('save')).toHaveLength(1)
    })
  })

  it('seeds the fields from the project it was given, which is how edit reuses it', () => {
    const wrapper = mountForm({ initial: SEEDED })

    expect(wrapper.find<HTMLInputElement>('input[name="name"]').element.value).toBe('Loja Virtual')
    expect(wrapper.find<HTMLInputElement>('input[name="client"]').element.value).toBe('Clicksign')
    expect(wrapper.find<HTMLInputElement>('input[name="started_at"]').element.value).toBe(
      '2026-09-01',
    )
    expect(wrapper.find<HTMLInputElement>('input[name="end_at"]').element.value).toBe('2026-12-15')
  })

  it('keeps the seeded id and favorite flag, so an edit saves over the record it came from', async () => {
    const wrapper = mountForm({ initial: SEEDED })

    await submit(wrapper)

    const saved = await waitForSave(wrapper)

    expect(saved.id).toBe(7)
    expect(saved.favorited).toBe(true)
  })

  it('keeps the seeded cover flag when the edit picks no new image', async () => {
    const wrapper = mountForm({ initial: SEEDED })

    await submit(wrapper)

    const saved = await waitForSave(wrapper)

    expect(saved.hasCover).toBe(true)
    // Nothing new was chosen, so the bytes already on disk must be left alone.
    await expect(getCover(saved.id)).resolves.toBeUndefined()
  })

  it('turns the cover flag on when the edit picks a new image', async () => {
    const wrapper = mountForm({ initial: { ...SEEDED, hasCover: false } })

    await selectCover(wrapper, buildFile())
    await submit(wrapper)

    const saved = await waitForSave(wrapper)

    expect(saved.hasCover).toBe(true)
    await expect(getCover(saved.id)).resolves.toBeDefined()
  })

  it('loads the cover the project already has into the field', async () => {
    await seedCover(SEEDED.id)

    const wrapper = mountForm({ initial: SEEDED })

    await waitForPreview(wrapper, 'blob:capa-1')
    // The stored record carries no name into the field, so the alt stays generic.
    expect(wrapper.find('.image-input img').attributes('alt')).toBe(
      'Pré-visualização da capa do projeto',
    )
  })

  it('shows no cover on a new project, which has nothing stored yet', () => {
    const wrapper = mountForm()

    expect(wrapper.find('.image-input img').exists()).toBe(false)
  })

  it('never reads IndexedDB for a project whose flag says there is no cover', () => {
    const wrapper = mountForm({ initial: { ...SEEDED, hasCover: false } })

    expect(wrapper.find('.image-input img').exists()).toBe(false)
    expect(createObjectURL).not.toHaveBeenCalled()
  })

  it('lets a new pick take over the field from the cover already shown', async () => {
    await seedCover(SEEDED.id)

    const wrapper = mountForm({ initial: SEEDED })

    await waitForPreview(wrapper, 'blob:capa-1')

    await selectCover(wrapper, buildFile('troca.png'))

    expect(previewSrc(wrapper)).toBe('blob:capa-2')
    expect(wrapper.find('.image-input img').attributes('alt')).toBe('Pré-visualização de troca.png')
  })

  it('drops the stored cover when the user removes it and saves', async () => {
    await seedCover(SEEDED.id)

    const wrapper = mountForm({ initial: SEEDED })

    await waitForPreview(wrapper, 'blob:capa-1')
    await removeCover(wrapper)

    expect(previewSrc(wrapper)).toBeUndefined()

    await submit(wrapper)

    const saved = await waitForSave(wrapper)

    expect(saved.hasCover).toBe(false)
    await expect(getCover(saved.id)).resolves.toBeUndefined()
  })

  it('saves the new image when the user removes the old one and picks another', async () => {
    await seedCover(SEEDED.id, 'antiga.png')

    const wrapper = mountForm({ initial: SEEDED })

    await waitForPreview(wrapper, 'blob:capa-1')
    await removeCover(wrapper)
    await selectCover(wrapper, buildFile('nova.png', 'image/png', 'bytes-novos'))
    await submit(wrapper)

    const saved = await waitForSave(wrapper)

    expect(saved.hasCover).toBe(true)

    const record = await getCover(saved.id)

    expect(record?.name).toBe('nova.png')
  })

  it('keeps the stored cover when the user throws away a new pick instead', async () => {
    await seedCover(SEEDED.id, 'antiga.png')

    const wrapper = mountForm({ initial: SEEDED })

    await waitForPreview(wrapper, 'blob:capa-1')
    await selectCover(wrapper, buildFile('descartada.png'))
    await removeCover(wrapper)

    // The pick is gone, so the cover that was already on the project is back.
    await waitForPreview(wrapper, 'blob:capa-1')

    await submit(wrapper)

    const saved = await waitForSave(wrapper)

    expect(saved.hasCover).toBe(true)
    await expect(getCover(SEEDED.id)).resolves.toMatchObject({ name: 'antiga.png' })
  })

  it('keeps the stored cover when a pick taken after a removal is thrown away', async () => {
    await seedCover(SEEDED.id, 'antiga.png')

    const wrapper = mountForm({ initial: SEEDED })

    await waitForPreview(wrapper, 'blob:capa-1')
    await removeCover(wrapper)
    await selectCover(wrapper, buildFile('nova.png', 'image/png', 'bytes-novos'))
    await removeCover(wrapper)

    // Discarding the pick supersedes the earlier removal, so the cover that is
    // still on the project comes back rather than leaving the field empty.
    await waitForPreview(wrapper, 'blob:capa-1')

    await submit(wrapper)

    const saved = await waitForSave(wrapper)

    expect(saved.hasCover).toBe(true)
    await expect(getCover(SEEDED.id)).resolves.toMatchObject({ name: 'antiga.png' })
  })

  it('forgets nothing when the cover is removed but the form is abandoned', async () => {
    await seedCover(SEEDED.id, 'antiga.png')

    const wrapper = mountForm({ initial: SEEDED })

    await waitForPreview(wrapper, 'blob:capa-1')
    await removeCover(wrapper)
    wrapper.unmount()

    expect(wrapper.emitted('save')).toBeUndefined()
    await expect(getCover(SEEDED.id)).resolves.toMatchObject({ name: 'antiga.png' })
  })

  it('offers no remove button when the flag points at a cover that is gone', async () => {
    const wrapper = mountForm({ initial: SEEDED })

    await vi.waitFor(() => {
      expect(wrapper.find('.image-input').exists()).toBe(true)
    })

    expect(wrapper.find('button[aria-label="Remover imagem"]').exists()).toBe(false)

    await submit(wrapper)

    // Nothing was ever resolved, so nothing may be deleted on the way out.
    expect((await waitForSave(wrapper)).hasCover).toBe(true)
  })
})

describe('ProjectForm - validation', () => {
  it('marks the form novalidate so the browser does not pre-empt the shared rules', () => {
    const wrapper = mountForm()

    expect(wrapper.find('form').attributes('novalidate')).toBeDefined()
  })

  it('keeps required on the fields, which drives the label marker and date placeholder', () => {
    const wrapper = mountForm()

    for (const field of ['name', 'client', 'started_at', 'end_at']) {
      expect(wrapper.find(`input[name="${field}"]`).attributes('required')).toBeDefined()
    }
  })

  it('says nothing about a form the user has not touched yet', () => {
    const wrapper = mountForm()

    expect(wrapper.findAll('[role="alert"]')).toHaveLength(0)
  })

  it('refuses an empty form and names every field', async () => {
    const wrapper = mountForm()

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('save')).toBeUndefined()
    expect(errorFor(wrapper, 'name')).toBe('Por favor, digite ao menos duas palavras')
    expect(errorFor(wrapper, 'client')).toBe('Por favor, digite ao menos uma palavra')
    expect(errorFor(wrapper, 'started_at')).toBe('Selecione uma data válida')
    expect(errorFor(wrapper, 'end_at')).toBe('Selecione uma data válida')
  })

  it('refuses a single-word name', async () => {
    const wrapper = mountForm()

    await submit(wrapper, [
      ['name', 'Loja'],
      ['client', 'Clicksign'],
      ['started_at', '2026-09-01'],
      ['end_at', '2026-12-15'],
    ])

    expect(errorFor(wrapper, 'name')).toBe('Por favor, digite ao menos duas palavras')
    expect(wrapper.emitted('save')).toBeUndefined()
  })

  it('refuses a whitespace-only client, which the native required allows', async () => {
    const wrapper = mountForm()

    await submit(wrapper, [
      ['name', 'Projeto novo'],
      ['client', '   '],
      ['started_at', '2026-09-01'],
      ['end_at', '2026-12-15'],
    ])

    expect(errorFor(wrapper, 'client')).toBe('Por favor, digite ao menos uma palavra')
  })

  it('refuses an end date before the start date', async () => {
    const wrapper = mountForm()

    await submit(wrapper, [
      ['name', 'Projeto novo'],
      ['client', 'Clicksign'],
      ['started_at', '2026-09-01'],
      ['end_at', '2026-08-31'],
    ])

    expect(errorFor(wrapper, 'end_at')).toBe(
      'A data final deve ser igual ou posterior à data de início.',
    )
    expect(wrapper.emitted('save')).toBeUndefined()
  })

  it('accepts an end date equal to the start date', async () => {
    const wrapper = mountForm()

    await submit(wrapper, [
      ['name', 'Projeto novo'],
      ['client', 'Clicksign'],
      ['started_at', '2026-09-01'],
      ['end_at', '2026-09-01'],
    ])

    expect((await waitForSave(wrapper)).end_at).toBe('2026-09-01')
  })

  it('reports a field once it has been left, even if nothing was typed', async () => {
    const wrapper = mountForm()

    await wrapper.find('input[name="name"]').trigger('blur')

    expect(errorFor(wrapper, 'name')).toBe('Por favor, digite ao menos duas palavras')
  })

  it('clears the message as soon as the field is corrected', async () => {
    const wrapper = mountForm()
    const name = wrapper.find('input[name="name"]')

    await name.trigger('blur')
    expect(errorFor(wrapper, 'name')).toBeDefined()

    await name.setValue('Loja Virtual')
    expect(errorFor(wrapper, 'name')).toBeUndefined()
  })

  it('keeps a message for an untouched field out of the way until submit', async () => {
    const wrapper = mountForm()

    await wrapper.find('input[name="name"]').trigger('blur')

    expect(errorFor(wrapper, 'name')).toBeDefined()
    expect(errorFor(wrapper, 'client')).toBeUndefined()
  })

  it('emits once every field satisfies the rules', async () => {
    const wrapper = mountForm()

    await submit(wrapper)

    expect((await waitForSave(wrapper)).name).toBe('Loja Virtual')
  })

  it('moves focus to the first invalid field after a refused submit', async () => {
    const wrapper = mountForm({ attachTo: document.body })

    await wrapper.find('form').trigger('submit')

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(wrapper.find('input[name="name"]').element)
    })

    wrapper.unmount()
  })

  it('describes each message to its own input', async () => {
    const wrapper = mountForm()

    await wrapper.find('form').trigger('submit')

    const name = wrapper.find('input[name="name"]')
    const describedBy = name.attributes('aria-describedby')
    const label = name.element.closest('label')
    const alert = label?.querySelector('[role="alert"]')

    expect(name.attributes('aria-invalid')).toBe('true')
    expect(describedBy).toBeDefined()
    expect(alert?.getAttribute('id')).toBe(describedBy)
    expect(alert?.getAttribute('role')).toBe('alert')
  })

  it('disables the submit button on an empty form', () => {
    const wrapper = mountForm()

    expect(submitButton(wrapper).attributes('disabled')).toBeDefined()
  })

  it('enables the submit button once every field is valid', async () => {
    const wrapper = mountForm()

    await fillFields(wrapper)

    expect(submitButton(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('disables the submit button again when a field becomes invalid', async () => {
    const wrapper = mountForm()

    await fillFields(wrapper)
    expect(submitButton(wrapper).attributes('disabled')).toBeUndefined()

    await wrapper.find('input[name="name"]').setValue('')

    await vi.waitFor(() => {
      expect(submitButton(wrapper).attributes('disabled')).toBeDefined()
    })
  })

  it('keeps the submit button disabled while saving', async () => {
    const wrapper = mountForm()

    await fillFields(wrapper)
    await selectCover(wrapper, buildFile())

    await wrapper.find('form').trigger('submit')

    await vi.waitFor(() => {
      expect(submitButton(wrapper).attributes('disabled')).toBeDefined()
    })

    releaseCover.current?.()

    await vi.waitFor(() => {
      expect(wrapper.emitted('save')).toHaveLength(1)
    })
  })
})
