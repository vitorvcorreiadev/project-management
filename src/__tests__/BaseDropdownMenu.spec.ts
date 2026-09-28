import { describe, it, expect, afterEach } from 'vitest'

import { mount, type VueWrapper } from '@vue/test-utils'
import BaseDropdownMenu from '../components/BaseDropdownMenu.vue'
import type { DropdownItem } from '../types/dropdown'

const items: DropdownItem[] = [
  { id: 'edit', label: 'Editar' },
  { id: 'archive', label: 'Arquivar', icon: { template: '<svg class="archive-icon" />' } },
]

const wrappers: VueWrapper[] = []

function render(props: { items?: DropdownItem[]; ariaLabel?: string } = {}) {
  const wrapper = mount(BaseDropdownMenu, {
    props: {
      items,
      ariaLabel: 'Ações do projeto',
      ...props,
    },
    slots: {
      default: '<svg class="trigger-icon" />',
    },
    attachTo: document.body,
  })

  wrappers.push(wrapper)

  return wrapper
}

function pointerDown(node: Node) {
  node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
}

/*
 * The menu is built on the native `<details>`, so the platform owns opening and
 * closing when the trigger is clicked and the component only adds Escape, the
 * click outside, and the close that follows an item activation. Every test that
 * cares about focus mounts into the document, because a detached tree has no
 * active element to move focus to — the wrapper is torn down between tests so its
 * document listeners do not outlive the assertions that registered them.
 */
describe('BaseDropdownMenu', () => {
  afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.unmount()
  })

  it('renders a closed menu', () => {
    const wrapper = render()
    const menu = wrapper.find('details')

    expect(menu.attributes('open')).toBeUndefined()
  })

  it('renders the trigger content given through the default slot', () => {
    const wrapper = render()

    expect(wrapper.find('summary .trigger-icon').exists()).toBe(true)
  })

  it('wears the look of the remove-cover button on the summary', () => {
    const wrapper = render()
    const classes = wrapper.find('summary').classes()

    expect(classes).toContain('button')
    expect(classes).toContain('secondary')
    expect(classes).toContain('medium')
  })

  it('takes the accessible name of the trigger from the prop', () => {
    const wrapper = render({ ariaLabel: 'Filtrar projetos' })

    expect(wrapper.find('summary').attributes('aria-label')).toBe('Filtrar projetos')
  })

  it('renders one row per item, in order, with its label', () => {
    const wrapper = render()
    const rows = wrapper.findAll('.dropdown-menu-panel .dropdown-menu-item')

    expect(rows.map((row) => row.text())).toEqual(['Editar', 'Arquivar'])
  })

  it('renders the icon of the items that bring one', () => {
    const wrapper = render()

    expect(wrapper.findAll('.dropdown-menu-item .archive-icon')).toHaveLength(1)
  })

  it('hides the panel when there is no item to show', () => {
    const wrapper = render({ items: [] })

    expect(wrapper.find('.dropdown-menu-panel').exists()).toBe(false)
  })

  it('opens when the trigger is clicked', async () => {
    const wrapper = render()

    await wrapper.find('summary').trigger('click')

    expect(wrapper.find('details').element.open).toBe(true)
  })

  it('closes when the trigger is clicked again', async () => {
    const wrapper = render()
    const trigger = wrapper.find('summary')

    await trigger.trigger('click')
    await trigger.trigger('click')

    expect(wrapper.find('details').element.open).toBe(false)
  })

  it('closes when a pointer lands outside', async () => {
    const wrapper = render()

    await wrapper.find('summary').trigger('click')
    pointerDown(document.body)

    expect(wrapper.find('details').element.open).toBe(false)
  })

  it('stays open when a pointer lands on the trigger', async () => {
    const wrapper = render()
    const trigger = wrapper.find('summary')

    await trigger.trigger('click')
    pointerDown(trigger.element)

    expect(wrapper.find('details').element.open).toBe(true)
  })

  it('closes on Escape and hands focus back to the trigger', async () => {
    const wrapper = render()
    const trigger = wrapper.find('summary')

    await trigger.trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.find('details').element.open).toBe(false)
    expect(document.activeElement).toBe(trigger.element)
  })

  it('ignores Escape while closed instead of pulling focus to the trigger', () => {
    const wrapper = render()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.find('details').element.open).toBe(false)
    expect(document.activeElement).not.toBe(wrapper.find('summary').element)
  })

  it('leaves the menu alone for keys other than Escape', async () => {
    const wrapper = render()

    await wrapper.find('summary').trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

    expect(wrapper.find('details').element.open).toBe(true)
  })

  it('emits the picked item', async () => {
    const wrapper = render()

    await wrapper.find('.dropdown-menu-panel .dropdown-menu-item').trigger('click')

    expect(wrapper.emitted<[DropdownItem]>('select')?.[0]?.[0]).toEqual(items[0])
  })

  it('closes once an item is activated and returns focus to the trigger', async () => {
    const wrapper = render()
    const trigger = wrapper.find('summary')

    await trigger.trigger('click')
    await wrapper.findAll('.dropdown-menu-item')[1]?.trigger('click')

    expect(wrapper.find('details').element.open).toBe(false)
    expect(document.activeElement).toBe(trigger.element)
  })
})
