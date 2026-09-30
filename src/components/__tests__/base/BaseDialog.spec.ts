import { describe, it, expect, afterEach, beforeAll, afterAll, beforeEach, vi } from 'vitest'

import { mount, type VueWrapper } from '@vue/test-utils'
import BaseDialog from '../../../components/base/BaseDialog.vue'

const wrappers: VueWrapper[] = []

const showModalMock = vi.fn<() => void>(function (this: HTMLDialogElement) {
  this.open = true
})

const closeMock = vi.fn<() => void>(function (this: HTMLDialogElement) {
  if (!this.open) return

  this.open = false
  this.dispatchEvent(new Event('close'))
})

const nativeShowModal = HTMLDialogElement.prototype.showModal
const nativeClose = HTMLDialogElement.prototype.close

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = showModalMock
  HTMLDialogElement.prototype.close = closeMock
})

afterAll(() => {
  HTMLDialogElement.prototype.showModal = nativeShowModal
  HTMLDialogElement.prototype.close = nativeClose
})

beforeEach(() => {
  showModalMock.mockClear()
  closeMock.mockClear()
})

function render(
  props: { title?: string; open?: boolean } = {},
  slots: Record<string, string> = {},
) {
  const wrapper = mount(BaseDialog, {
    props: { title: 'Remover projeto', open: false, ...props },
    slots: { default: '<p class="content">Essa ação não pode ser desfeita.</p>', ...slots },
    attachTo: document.body,
  })

  wrappers.push(wrapper)

  return wrapper
}

function pointerDown(node: Node) {
  node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
}

function lastOpenEmission(wrapper: VueWrapper): [boolean] | undefined {
  const emissions = wrapper.emitted<[boolean]>('update:open')

  return emissions?.slice(-1)[0]
}

describe('BaseDialog', () => {
  afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.unmount()
  })

  it('renders shut until it is told to open', () => {
    const wrapper = render()

    expect(wrapper.find('dialog').element.open).toBe(false)
    expect(showModalMock).not.toHaveBeenCalled()
  })

  it('opens as a modal when it mounts already open', () => {
    const wrapper = render({ open: true })

    expect(showModalMock).toHaveBeenCalledTimes(1)
    expect(wrapper.find('dialog').element.open).toBe(true)
  })

  it('opens as a modal when the model flips to true', async () => {
    const wrapper = render()

    await wrapper.setProps({ open: true })

    expect(wrapper.find('dialog').element.open).toBe(true)
  })

  it('shuts when the model flips to false', async () => {
    const wrapper = render({ open: true })

    await wrapper.setProps({ open: false })

    expect(wrapper.find('dialog').element.open).toBe(false)
  })

  it('asks the platform to close only once even though the close event re-enters', async () => {
    const wrapper = render({ open: true })

    await wrapper.setProps({ open: false })

    expect(closeMock).toHaveBeenCalledTimes(1)
  })

  it('never asks the platform to close a dialog that is already shut', () => {
    render()

    pointerDown(document.body)

    expect(closeMock).not.toHaveBeenCalled()
  })

  it('renders the title given through the prop', () => {
    const wrapper = render({ title: 'Remover projeto' })

    expect(wrapper.find('.dialog-title').text()).toBe('Remover projeto')
  })

  it('labels the dialog with its own title, the way a screen reader names it', () => {
    const wrapper = render()
    const labelledBy = wrapper.find('dialog').attributes('aria-labelledby')

    expect(labelledBy).toBe(wrapper.find('.dialog-title').attributes('id'))
  })

  it('lays the title, the divider and the content out in that order', () => {
    const wrapper = render()
    const children = [...wrapper.find('.dialog-body').element.children]

    expect(children.map((child) => child.className)).toEqual([
      'dialog-title',
      'dialog-content',
    ])
  })

  it('renders the content given through the default slot', () => {
    const wrapper = render()

    expect(wrapper.find('.dialog-content .content').text()).toBe('Essa ação não pode ser desfeita.')
  })

  it('leaves the icon circle out when no icon is given', () => {
    const wrapper = render()

    expect(wrapper.find('.dialog-icon').exists()).toBe(false)
  })

  it('renders the icon given through the icon slot', () => {
    const wrapper = render({}, { icon: '<span class="warn-icon" />' })

    expect(wrapper.find('.dialog-icon .warn-icon').exists()).toBe(true)
  })

  it('leaves the actions row out when no actions are given', () => {
    const wrapper = render()

    expect(wrapper.find('.dialog-actions').exists()).toBe(false)
  })

  it('renders the actions given through the actions slot', () => {
    const wrapper = render({}, { actions: '<button class="confirm">Remover</button>' })

    expect(wrapper.find('.dialog-actions .confirm').text()).toBe('Remover')
  })

  it('writes the close back to the model when the platform shuts it', () => {
    const wrapper = render({ open: true })

    wrapper.find('dialog').element.dispatchEvent(new Event('close'))

    expect(lastOpenEmission(wrapper)).toEqual([false])
  })

  it('shuts when a pointer lands outside the panel', () => {
    const wrapper = render({ open: true })

    pointerDown(document.body)

    expect(lastOpenEmission(wrapper)).toEqual([false])
  })

  it('stays open when a pointer lands on the panel', () => {
    const wrapper = render({ open: true })

    pointerDown(wrapper.find('.dialog-panel').element)

    expect(lastOpenEmission(wrapper)).toBeUndefined()
  })
})
