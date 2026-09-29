import { describe, it, expect, vi } from 'vitest'

import { mount } from '@vue/test-utils'
import Toggle from '../components/base/BaseToggle.vue'

/*
 * BaseToggle is fully controlled through `modelValue`, so the switch never mutates
 * itself: every state assertion below drives the prop directly. The root is a
 * <label> so the caption click and the accessible name both come for free, which
 * is also why `inheritAttrs` is off and `$attrs` is bound to the inner button —
 * attributes a caller passes describe the control, not the row around it.
 */
describe('BaseToggle', () => {
  it('renders a switch carrying the default off state', () => {
    const wrapper = mount(Toggle)
    const toggle = wrapper.find('label')

    expect(toggle.classes()).toEqual(expect.arrayContaining(['toggle', 'toggle--off']))
    expect(wrapper.find('button').attributes('role')).toBe('switch')
    expect(wrapper.find('button').attributes('aria-checked')).toBe('false')
  })

  it('swaps in exactly the state modifier the prop selects', () => {
    const wrapper = mount(Toggle, { props: { modelValue: true } })
    const toggle = wrapper.find('label')

    expect(toggle.classes()).toEqual(expect.arrayContaining(['toggle', 'toggle--on']))
    expect(toggle.classes()).not.toContain('toggle--off')
    expect(wrapper.find('button').attributes('aria-checked')).toBe('true')
  })

  it('carries a ball inside the switch', () => {
    const wrapper = mount(Toggle)

    expect(wrapper.find('.switch .ball').exists()).toBe(true)
  })

  it('never submits a surrounding form', () => {
    const wrapper = mount(Toggle)

    expect(wrapper.find('button').attributes('type')).toBe('button')
  })

  it('emits the flipped value on click', async () => {
    const wrapper = mount(Toggle)

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('emits false when clicked while on', async () => {
    const wrapper = mount(Toggle, { props: { modelValue: true } })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('renders default slot content as the caption', () => {
    const wrapper = mount(Toggle, { slots: { default: 'Notifications' } })

    expect(wrapper.find('.label').text()).toBe('Notifications')
  })

  it('omits the caption when no slot content is given', () => {
    const wrapper = mount(Toggle)

    expect(wrapper.find('.label').exists()).toBe(false)
  })

  it('falls attributes and listeners through to the switch', async () => {
    const onClick = vi.fn<() => void>()
    const wrapper = mount(Toggle, {
      attrs: { id: 'notifications', 'aria-label': 'Notifications', onClick },
    })
    const button = wrapper.find('button')

    expect(button.attributes('id')).toBe('notifications')
    expect(button.attributes('aria-label')).toBe('Notifications')
    expect(wrapper.find('label').attributes('id')).toBeUndefined()

    await button.trigger('click')

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('merges a class supplied through attributes with the switch modifier', () => {
    const wrapper = mount(Toggle, { attrs: { class: 'compact' } })
    const button = wrapper.find('button')

    expect(button.classes()).toEqual(expect.arrayContaining(['compact', 'switch']))
  })
})
