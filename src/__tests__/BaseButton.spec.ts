import { describe, it, expect, vi } from 'vitest'

import { mount } from '@vue/test-utils'
import BaseButton from '../components/base/BaseButton.vue'

/*
 * BaseButton has a single `<button>` root, so `find('button')` is the component
 * root rather than one branch of a fragment. The defaults are spelled out in the
 * assertions because every modifier the component owns is derived from a prop,
 * which means a missing default is a silent regression rather than a failure.
 */
describe('BaseButton', () => {
  it('renders a button carrying the default modifiers', () => {
    const wrapper = mount(BaseButton)
    const button = wrapper.find('button')

    expect(button.classes()).toEqual(expect.arrayContaining(['button', 'primary', 'medium']))
  })

  it('swaps in exactly the modifiers the props select', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'secondary', size: 'large', full: true },
    })
    const button = wrapper.find('button')

    expect(button.classes()).toEqual(
      expect.arrayContaining(['button', 'secondary', 'large', 'full']),
    )
    expect(button.classes()).not.toContain('primary')
    expect(button.classes()).not.toContain('medium')
  })

  it('omits the full-width modifier when the option is not set', () => {
    const wrapper = mount(BaseButton)

    expect(wrapper.find('button').classes()).not.toContain('full')
  })

  it('exposes the native disabled state when the option is set', () => {
    const wrapper = mount(BaseButton, { props: { disabled: true } })

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('carries no disabled attribute otherwise', () => {
    const wrapper = mount(BaseButton)

    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })

  it('merges a class supplied through attributes with its own', () => {
    const wrapper = mount(BaseButton, { attrs: { class: 'call-to-action' } })

    expect(wrapper.find('button').classes()).toEqual(
      expect.arrayContaining(['call-to-action', 'button', 'primary', 'medium']),
    )
  })

  it('renders default slot content inside the root', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'New project' } })
    const button = wrapper.find('button')

    expect(button.text()).toBe('New project')
  })

  it('falls attributes and listeners through to the root button', async () => {
    const onClick = vi.fn<() => void>()
    const wrapper = mount(BaseButton, {
      attrs: { id: 'save', 'aria-label': 'Save project', onClick },
    })
    const button = wrapper.find('button')

    expect(button.attributes('id')).toBe('save')
    expect(button.attributes('aria-label')).toBe('Save project')

    await button.trigger('click')

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
