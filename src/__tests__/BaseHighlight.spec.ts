import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import BaseHighlight from '../components/BaseHighlight.vue'

describe('BaseHighlight', () => {
  it('renders the text as-is when it is not given a term', () => {
    const wrapper = mount(BaseHighlight, { props: { text: 'Projeto Alpha' } })

    expect(wrapper.text()).toBe('Projeto Alpha')
    expect(wrapper.find('mark').exists()).toBe(false)
  })

  it('wraps only the matched part of the text in a mark', () => {
    const wrapper = mount(BaseHighlight, { props: { text: 'Projeto Alpha', term: 'Alp' } })

    expect(wrapper.get('mark').text()).toBe('Alp')
    expect(wrapper.text()).toBe('Projeto Alpha')
  })

  it('wraps every occurrence of the term', () => {
    const wrapper = mount(BaseHighlight, { props: { text: 'Projeto Pro', term: 'pro' } })

    expect(wrapper.findAll('mark').map((mark) => mark.text())).toEqual(['Pro', 'Pro'])
  })

  it('keeps the whole text readable when the term matches nothing', () => {
    const wrapper = mount(BaseHighlight, { props: { text: 'Projeto Alpha', term: 'Zzz' } })

    expect(wrapper.find('mark').exists()).toBe(false)
    expect(wrapper.text()).toBe('Projeto Alpha')
  })
})
