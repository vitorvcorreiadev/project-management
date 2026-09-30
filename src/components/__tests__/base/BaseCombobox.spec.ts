import { describe, it, expect, afterEach, beforeEach } from 'vitest'

import { mount, type VueWrapper } from '@vue/test-utils'
import BaseCombobox from '../../../components/base/BaseCombobox.vue'
import type { ComboboxOption } from '../../../types/combobox'

const options: ComboboxOption[] = [
  { value: 'banana', label: 'Banana' },
  { value: 'laranja', label: 'Laranja' },
  { value: 'uva', label: 'Uva' },
]

const wrappers: VueWrapper[] = []

function render(props: { modelValue?: string; options?: ComboboxOption[] } = {}) {
  const wrapper = mount(BaseCombobox, {
    props: {
      label: 'Fruta favorita',
      options,
      ...props,
    },
    attachTo: document.body,
  })

  wrappers.push(wrapper)

  return wrapper
}

function trigger(wrapper: VueWrapper, key: string, init: KeyboardEventInit = {}) {
  return wrapper.get('[role="combobox"]').trigger('keydown', { key, ...init })
}

function isOpen(wrapper: VueWrapper) {
  return wrapper.get('[role="combobox"]').attributes('aria-expanded')
}

function optionWrappers(wrapper: VueWrapper) {
  return wrapper.findAll('[role="option"]')
}

/* The id the trigger points at is the id of the option currently active. */
function activeIndex(wrapper: VueWrapper) {
  const active = wrapper.get('[role="combobox"]').attributes('aria-activedescendant')

  return optionWrappers(wrapper).findIndex((option) => option.attributes('id') === active)
}

function activeClasses(wrapper: VueWrapper) {
  return optionWrappers(wrapper).flatMap((option) =>
    option.classes().includes('combobox-option--active') ? [option.text()] : [],
  )
}

function selectedLabels(wrapper: VueWrapper) {
  return optionWrappers(wrapper)
    .filter((option) => option.attributes('aria-selected') === 'true')
    .map((option) => option.text())
}

function updates(wrapper: VueWrapper) {
  return wrapper.emitted<[string]>('update:modelValue') ?? []
}

function lastUpdate(wrapper: VueWrapper) {
  const emitted = updates(wrapper)

  return emitted[emitted.length - 1]?.[0]
}

/*
 * The focus lives on the trigger for the whole interaction, so every test mounts
 * into the document — a detached tree has no active element to move focus to.
 * jsdom ships no `scrollIntoView`, so the scroll the popup performs is recorded
 * here and asserted through the option it was handed.
 */
describe('BaseCombobox', () => {
  const originalScrollIntoView = Element.prototype.scrollIntoView
  let scrolled: Element[]

  beforeEach(() => {
    scrolled = []
    Element.prototype.scrollIntoView = function recordScroll(this: Element) {
      scrolled.push(this)
    }
  })

  afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.unmount()

    if (originalScrollIntoView) {
      Element.prototype.scrollIntoView = originalScrollIntoView
    } else {
      delete (Element.prototype as Partial<Element>).scrollIntoView
    }
  })

  it('names the trigger after the label prop', () => {
    const wrapper = render({ options })

    expect(wrapper.get('[role="combobox"]').attributes('aria-label')).toBe('Fruta favorita')
    expect(wrapper.find('.combobox-label').exists()).toBe(false)
  })

  it('points the trigger at the listbox it owns', () => {
    const wrapper = render({ options })

    const trigger = wrapper.get('[role="combobox"]')

    expect(trigger.attributes('aria-haspopup')).toBe('listbox')
    expect(trigger.attributes('tabindex')).toBe('0')
    expect(wrapper.get('[role="listbox"]').attributes('id')).toBe(
      trigger.attributes('aria-controls'),
    )
  })

  it('falls back to the placeholder while nothing is selected', () => {
    const wrapper = render({ options })

    expect(wrapper.get('[role="combobox"]').text()).toBe('Escolha uma opção')
  })

  it('shows the label of the option the model holds', () => {
    const wrapper = render({ options, modelValue: 'uva' })

    expect(wrapper.get('[role="combobox"]').text()).toBe('Uva')
  })

  it('renders one option per entry, in order', () => {
    const wrapper = render({ options })

    expect(optionWrappers(wrapper).map((option) => option.text())).toEqual([
      'Banana',
      'Laranja',
      'Uva',
    ])
  })

  it('starts closed and without an active descendant', () => {
    const wrapper = render({ options })

    expect(isOpen(wrapper)).toBe('false')
    expect(activeIndex(wrapper)).toBe(-1)
  })

  it('opens and closes when the trigger is clicked', async () => {
    const wrapper = render({ options })

    await wrapper.get('[role="combobox"]').trigger('click')
    expect(isOpen(wrapper)).toBe('true')

    await wrapper.get('[role="combobox"]').trigger('click')
    expect(isOpen(wrapper)).toBe('false')
  })

  it.each(['ArrowDown', 'Enter', ' '])('opens on %s', async (key) => {
    const wrapper = render({ options })

    await trigger(wrapper, key)

    expect(isOpen(wrapper)).toBe('true')
  })

  it('opens on ArrowUp with the first option active', async () => {
    const wrapper = render({ options })

    await trigger(wrapper, 'ArrowUp')

    expect(activeIndex(wrapper)).toBe(0)
  })

  it('opens on End with the last option active', async () => {
    const wrapper = render({ options })

    await trigger(wrapper, 'End')

    expect(activeIndex(wrapper)).toBe(2)
  })

  it('opens on the option the model holds', async () => {
    const wrapper = render({ options, modelValue: 'laranja' })

    await trigger(wrapper, 'ArrowDown')

    expect(activeIndex(wrapper)).toBe(1)
  })

  it('moves the active option with the arrows without changing the model', async () => {
    const wrapper = render({ options, modelValue: 'banana' })

    await trigger(wrapper, 'ArrowDown')
    await trigger(wrapper, 'ArrowDown')
    await trigger(wrapper, 'ArrowDown')
    await trigger(wrapper, 'ArrowUp')

    expect(activeIndex(wrapper)).toBe(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('jumps to the edges on Home and End', async () => {
    const wrapper = render({ options })

    await trigger(wrapper, 'ArrowDown')
    await trigger(wrapper, 'End')
    expect(activeIndex(wrapper)).toBe(2)

    await trigger(wrapper, 'Home')
    expect(activeIndex(wrapper)).toBe(0)
  })

  it('clamps the active option at the edges', async () => {
    const wrapper = render({ options })

    await trigger(wrapper, 'ArrowUp')
    expect(activeIndex(wrapper)).toBe(0)

    await trigger(wrapper, 'End')
    await trigger(wrapper, 'ArrowDown')
    expect(activeIndex(wrapper)).toBe(2)
  })

  it('takes PageUp and PageDown ten options at a time', async () => {
    const long: ComboboxOption[] = Array.from({ length: 25 }, (_, index) => ({
      value: `option-${index}`,
      label: `Opção ${index}`,
    }))

    const wrapper = render({ options: long })

    await trigger(wrapper, 'ArrowDown')
    await trigger(wrapper, 'PageDown')
    expect(activeIndex(wrapper)).toBe(10)

    await trigger(wrapper, 'PageUp')
    expect(activeIndex(wrapper)).toBe(0)
  })

  it.each([
    ['Enter', {}],
    [' ', {}],
    ['Tab', {}],
    ['ArrowUp', { altKey: true }],
  ])('commits the active option and closes on %s', async (key, init) => {
    const wrapper = render({ options })

    await trigger(wrapper, 'ArrowDown')
    await trigger(wrapper, 'ArrowDown')
    await trigger(wrapper, key, init)

    expect(lastUpdate(wrapper)).toBe('laranja')
    expect(isOpen(wrapper)).toBe('false')
  })

  it('lets Tab move the focus on to the next element', async () => {
    const wrapper = render({ options })
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    })

    await trigger(wrapper, 'ArrowDown')
    wrapper.get('[role="combobox"]').element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(lastUpdate(wrapper)).toBe('banana')
  })

  it('closes on Escape and keeps the current value', async () => {
    const wrapper = render({ options, modelValue: 'banana' })

    await trigger(wrapper, 'ArrowDown')
    await trigger(wrapper, 'ArrowDown')
    await trigger(wrapper, 'Escape')

    expect(isOpen(wrapper)).toBe('false')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.get('[role="combobox"]').text()).toBe('Banana')
  })

  it('commits the active option when the trigger loses the focus', async () => {
    const wrapper = render({ options })

    await trigger(wrapper, 'ArrowDown')
    await trigger(wrapper, 'ArrowDown')
    await wrapper.get('[role="combobox"]').trigger('blur')

    expect(lastUpdate(wrapper)).toBe('laranja')
    expect(isOpen(wrapper)).toBe('false')
  })

  it('ignores a blur that happens while closed', async () => {
    const wrapper = render({ options, modelValue: 'banana' })

    await wrapper.get('[role="combobox"]').trigger('blur')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('marks the committed option as selected and the active one as active', async () => {
    const wrapper = render({ options, modelValue: 'uva' })

    await trigger(wrapper, 'ArrowDown')
    await trigger(wrapper, 'ArrowUp')

    expect(selectedLabels(wrapper)).toEqual(['Uva'])
    expect(activeClasses(wrapper)).toEqual(['Laranja'])
  })

  it('scrolls the active option into view', async () => {
    const wrapper = render({ options })

    await trigger(wrapper, 'ArrowDown')
    await trigger(wrapper, 'ArrowDown')
    await wrapper.vm.$nextTick()

    expect(scrolled[scrolled.length - 1]).toBe(optionWrappers(wrapper)[1]?.element)
  })

  it('commits and focuses the trigger when an option is clicked', async () => {
    const wrapper = render({ options })
    const trigger = wrapper.get('[role="combobox"]')

    await trigger.trigger('click')
    await optionWrappers(wrapper)[2]?.trigger('click')

    expect(lastUpdate(wrapper)).toBe('uva')
    expect(isOpen(wrapper)).toBe('false')
    expect(document.activeElement).toBe(trigger.element)
  })

  it('keeps the focus on the trigger when an option is pressed on', async () => {
    const wrapper = render({ options })
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })

    await wrapper.get('[role="combobox"]').trigger('click')
    wrapper.get('[role="listbox"]').element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
  })

  it('opens on a letter and lands on the first option starting with it', async () => {
    const wrapper = render({ options })

    await trigger(wrapper, 'l')

    expect(isOpen(wrapper)).toBe('true')
    expect(activeIndex(wrapper)).toBe(1)
  })

  it('cycles through the options sharing the first typed letter', async () => {
    const twins: ComboboxOption[] = [
      { value: 'banana', label: 'Banana' },
      { value: 'bergamota', label: 'Bergamota' },
      { value: 'uva', label: 'Uva' },
    ]

    const wrapper = render({ options: twins })

    await trigger(wrapper, 'b')
    expect(activeIndex(wrapper)).toBe(1)

    await trigger(wrapper, 'b')
    expect(activeIndex(wrapper)).toBe(0)

    await trigger(wrapper, 'b')
    expect(activeIndex(wrapper)).toBe(1)
  })

  it('keeps narrowing the term as more letters arrive', async () => {
    const wrapper = render({ options })

    await trigger(wrapper, 'b')
    await trigger(wrapper, 'a')

    expect(activeIndex(wrapper)).toBe(0)
  })

  it('stays put for a key that matches no option', async () => {
    const wrapper = render({ options })

    await trigger(wrapper, 'ArrowDown')
    await trigger(wrapper, 'ArrowDown')
    await trigger(wrapper, 'z')

    expect(activeIndex(wrapper)).toBe(1)
  })

  it('forgets the typed letters once the popup closes', async () => {
    const wrapper = render({ options })

    await trigger(wrapper, 'b')
    await trigger(wrapper, 'Escape')
    await trigger(wrapper, 'u')

    expect(activeIndex(wrapper)).toBe(2)
  })

  it('keeps the value when the options list is empty', async () => {
    const wrapper = render({ options: [] })

    await trigger(wrapper, 'ArrowDown')
    await trigger(wrapper, 'Enter')

    expect(isOpen(wrapper)).toBe('false')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
