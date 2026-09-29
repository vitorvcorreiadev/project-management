import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import ImageInput from '../components/image-input/ImageInput.vue'

/*
 * The component can show two different things in the same slot: the cover a
 * project already has, handed over as a resolved url, and the file the user just
 * picked. Which one wins — and which side of the field owns the object url — is
 * the whole contract, so these tests drive the real input and the real button
 * rather than poking at internals.
 *
 * jsdom implements no `URL.createObjectURL`, hence the counter stub: a unique url
 * per call is what lets the assertions tell the picked image apart from the
 * existing one.
 */
const createObjectURL = vi.fn<(blob: Blob) => string>()
const revokeObjectURL = vi.fn<(url: string) => void>()

let minted = 0

describe('ImageInput', () => {
  function buildFile(name = 'capa.png', type = 'image/png'): File {
    return new File(['cover-bytes'], name, { type })
  }

  function mountInput(props: { existing?: string | null; modelValue?: File | null } = {}) {
    return mount(ImageInput, { props: { modelValue: null, ...props } })
  }

  function preview(wrapper: ReturnType<typeof mountInput>) {
    return wrapper.find('.image-input img')
  }

  async function selectFile(wrapper: ReturnType<typeof mountInput>, file: File) {
    const input = wrapper.find('input[type="file"]')

    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
  }

  function clickRemove(wrapper: ReturnType<typeof mountInput>) {
    return wrapper.find('button[aria-label="Remover imagem"]').trigger('click')
  }

  beforeEach(() => {
    minted = 0
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()

    createObjectURL.mockImplementation(() => `blob:picked-${++minted}`)
    revokeObjectURL.mockImplementation(() => {})

    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
  })

  it('offers the picker when there is neither a pick nor an existing cover', () => {
    const wrapper = mountInput()

    expect(preview(wrapper).exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Remover imagem"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Escolha uma imagem .jpg ou .png')
  })

  it('previews a picked file and names it in the alt text', async () => {
    const wrapper = mountInput()

    await selectFile(wrapper, buildFile('escolhida.png'))

    expect(preview(wrapper).attributes('src')).toBe('blob:picked-1')
    expect(preview(wrapper).attributes('alt')).toBe('Pré-visualização de escolhida.png')
  })

  it('shows the cover the project already has', () => {
    const wrapper = mountInput({ existing: 'blob:salva' })

    expect(preview(wrapper).attributes('src')).toBe('blob:salva')
    // The url arrives without the name, so the alt cannot claim one.
    expect(preview(wrapper).attributes('alt')).toBe('Pré-visualização da capa do projeto')
  })

  it('lets a fresh pick take over the preview from the existing cover', async () => {
    const wrapper = mountInput({ existing: 'blob:salva' })

    await selectFile(wrapper, buildFile('nova.png'))

    expect(preview(wrapper).attributes('src')).toBe('blob:picked-1')
  })

  it('falls back to the existing cover when the pick is thrown away', async () => {
    const wrapper = mountInput({ existing: 'blob:salva' })

    await selectFile(wrapper, buildFile('nova.png'))
    await clickRemove(wrapper)

    expect(preview(wrapper).attributes('src')).toBe('blob:salva')

    const emitted = wrapper.emitted<[File | null]>('update:modelValue')

    expect(emitted?.[emitted.length - 1]?.[0]).toBeNull()
  })

  it('asks the parent to drop the existing cover instead of touching the model', async () => {
    const wrapper = mountInput({ existing: 'blob:salva' })

    await clickRemove(wrapper)

    expect(wrapper.emitted('removeExisting')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('never revokes the existing url, which belongs to whoever resolved it', async () => {
    const wrapper = mountInput({ existing: 'blob:salva' })

    await selectFile(wrapper, buildFile('nova.png'))
    await clickRemove(wrapper)
    wrapper.unmount()

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:picked-1')
    expect(revokeObjectURL).not.toHaveBeenCalledWith('blob:salva')
  })

  it('releases the picked url when it goes away', async () => {
    const wrapper = mountInput()

    await selectFile(wrapper, buildFile('nova.png'))
    wrapper.unmount()

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:picked-1')
  })

  it('refuses a file that is not an image and keeps the existing cover', async () => {
    const wrapper = mountInput({ existing: 'blob:salva' })

    await selectFile(wrapper, buildFile('notas.pdf', 'application/pdf'))

    expect(wrapper.find('[role="alert"]').text()).toBe(
      'Formato inválido. Escolha um arquivo .jpg ou .png.',
    )
    expect(preview(wrapper).attributes('src')).toBe('blob:salva')
  })
})
