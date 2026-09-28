import { describe, it, expect, vi } from 'vitest'

import { mount } from '@vue/test-utils'
import BaseInput from '../components/BaseInput.vue'

describe('BaseInput', () => {
  function mountInput(errorMessage?: string) {
    return mount(BaseInput, { props: { label: 'Nome do projeto', errorMessage } })
  }

  it('renders the message as an alert', () => {
    const wrapper = mountInput('Por favor, digite ao menos duas palavras')
    const alert = wrapper.find('[role="alert"]')

    expect(alert.exists()).toBe(true)
    expect(alert.text()).toBe('Por favor, digite ao menos duas palavras')
  })

  it('applies the error styling while a message is present', () => {
    const wrapper = mountInput('Por favor, digite ao menos duas palavras')

    expect(wrapper.classes()).toContain('has-error')
  })

  it('shows neither a message nor the error styling when the prop is absent', () => {
    const wrapper = mountInput()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.classes()).not.toContain('has-error')
  })

  it('treats an empty string as no message, not as a message', () => {
    const wrapper = mountInput('')

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.classes()).not.toContain('has-error')
  })

  it('marks the input invalid and points it at the message', () => {
    const wrapper = mountInput('Selecione uma data válida')
    const input = wrapper.find('input')
    const alert = wrapper.find('[role="alert"]')

    expect(input.attributes('aria-invalid')).toBe('true')
    // The id has to resolve to the rendered message, not merely exist.
    expect(input.attributes('aria-describedby')).toBe(alert.attributes('id'))
  })

  it('leaves the input out of the invalid state when there is no message', () => {
    const wrapper = mountInput()
    const input = wrapper.find('input')

    expect(input.attributes('aria-invalid')).toBeUndefined()
    expect(input.attributes('aria-describedby')).toBeUndefined()
  })

  it('gives sibling fields their own message ids', () => {
    const wrapper = mount({
      components: { BaseInput },
      template: `
        <div>
          <BaseInput label="Início" error-message="primeira" />
          <BaseInput label="Fim" error-message="segunda" />
        </div>
      `,
    })

    const [first, second] = wrapper
      .findAll('input')
      .map((input) => input.attributes('aria-describedby'))

    expect(first).toBeDefined()
    expect(second).toBeDefined()
    expect(first).not.toBe(second)
  })

  it('forwards attributes and listeners to the inner input', async () => {
    const onBlur = vi.fn<() => void>()
    const wrapper = mount(BaseInput, {
      props: { label: 'Cliente' },
      attrs: { name: 'client', required: true, onBlur },
    })
    const input = wrapper.find('input')

    expect(input.attributes('name')).toBe('client')
    expect(input.attributes('required')).toBeDefined()

    await input.trigger('blur')

    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('binds the model to the inner input', async () => {
    const wrapper = mount(BaseInput, { props: { label: 'Cliente', modelValue: 'Clicksign' } })

    expect(wrapper.find('input').element.value).toBe('Clicksign')

    await wrapper.find('input').setValue('Clicksign SA')

    const emitted = wrapper.emitted('update:modelValue')

    expect(emitted?.[emitted.length - 1]).toEqual(['Clicksign SA'])
  })
})
