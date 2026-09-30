import { describe, it, expect, vi } from 'vitest'

import { mount } from '@vue/test-utils'
import FavoriteStar from '../../../components/project-card/FavoriteStar.vue'

describe('FavoriteStar', () => {
  it('renders a button carrying the favorite-star class', () => {
    const wrapper = mount(FavoriteStar)
    const button = wrapper.find('button')

    expect(button.classes()).toContain('favorite-star')
    expect(button.attributes('aria-pressed')).toBe('false')
  })

  it('reflects the favorited prop on aria-pressed', () => {
    const wrapper = mount(FavoriteStar, { props: { modelValue: true } })

    expect(wrapper.find('button').attributes('aria-pressed')).toBe('true')
  })

  it('emits the flipped value on click', async () => {
    const wrapper = mount(FavoriteStar)

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('emits false when clicked while favorited', async () => {
    const wrapper = mount(FavoriteStar, { props: { modelValue: true } })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('falls attributes and listeners through to the root button', async () => {
    const onClick = vi.fn<() => void>()
    const wrapper = mount(FavoriteStar, {
      attrs: { id: 'star', 'aria-label': 'Favorite project', onClick },
    })
    const button = wrapper.find('button')

    expect(button.attributes('id')).toBe('star')
    expect(button.attributes('aria-label')).toBe('Favorite project')

    await button.trigger('click')

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('merges a class supplied through attributes with its own', () => {
    const wrapper = mount(FavoriteStar, { attrs: { class: 'compact' } })
    const button = wrapper.find('button')

    expect(button.classes()).toEqual(
      expect.arrayContaining(['compact', 'favorite-star']),
    )
  })
})
