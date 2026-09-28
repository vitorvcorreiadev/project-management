import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'

import ProjectCard from '../components/ProjectCard.vue'
import type { Project } from '../types/project'

function buildProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    name: 'Projeto 1',
    client: 'Clicksign',
    started_at: '2026-09-01',
    end_at: '2026-12-15',
    favorited: false,
    hasCover: false,
    ...overrides,
  }
}

describe('ProjectCard', () => {
  function mountCard(project: Project) {
    const pinia = createPinia()
    setActivePinia(pinia)

    return mount(ProjectCard, { props: { project }, global: { plugins: [pinia] } })
  }

  it('renders the start day the user picked, not the day before', () => {
    const wrapper = mountCard(buildProject())

    expect(wrapper.text()).toContain('01 de setembro de 2026')
    expect(wrapper.text()).not.toContain('31 de agosto')
  })

  it('renders the end day the user picked', () => {
    const wrapper = mountCard(buildProject())

    expect(wrapper.text()).toContain('15 de dezembro de 2026')
  })

  it('renders both dates alongside the name and the client', () => {
    const wrapper = mountCard(buildProject({ name: 'Projeto 1', client: 'Clicksign' }))

    expect(wrapper.get('h2').text()).toBe('Projeto 1')
    expect(wrapper.text()).toContain('Clicksign')
    expect(wrapper.text()).toContain('01 de setembro de 2026')
    expect(wrapper.text()).toContain('15 de dezembro de 2026')
  })

  it('does not throw when a date is missing', () => {
    expect(() => mountCard(buildProject({ started_at: '', end_at: '' }))).not.toThrow()
  })
})
