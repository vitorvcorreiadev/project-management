import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount, type VueWrapper } from '@vue/test-utils'

import ProjectCard from '../components/ProjectCard.vue'
import { useProjectsStore } from '../stores/projects'
import type { Project } from '../types/project'

const { push } = vi.hoisted(() => ({ push: vi.fn<(to: string) => unknown>() }))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push, back: vi.fn<() => void>() }),
}))

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
  const wrappers: VueWrapper[] = []

  function mountCard(project: Project, highlightTerm = '') {
    const pinia = createPinia()
    setActivePinia(pinia)

    const wrapper = mount(ProjectCard, {
      props: { project, highlightTerm },
      global: { plugins: [pinia] },
      attachTo: document.body,
    })

    wrappers.push(wrapper)

    return wrapper
  }

  async function pickMenuItem(wrapper: ReturnType<typeof mountCard>, label: string) {
    const item = wrapper
      .findAll('.dropdown-menu-item')
      .find((candidate) => candidate.text() === label)

    if (!item) throw new Error(`No menu item labeled "${label}"`)

    await item.trigger('click')
  }

  async function openRemoveDialog(wrapper: ReturnType<typeof mountCard>) {
    await pickMenuItem(wrapper, 'Remover')
  }

  function dialogOf(wrapper: ReturnType<typeof mountCard>) {
    return wrapper.find('dialog').element as HTMLDialogElement
  }

  beforeEach(() => {
    push.mockReset()
    showModalMock.mockClear()
    closeMock.mockClear()
  })

  afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.unmount()
  })

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

  it('leaves the name unhighlighted when it is not given a search term', () => {
    const wrapper = mountCard(buildProject({ name: 'Projeto Alpha' }))

    expect(wrapper.find('h2 mark').exists()).toBe(false)
  })

  it('highlights the searched term inside the name, keeping the whole name readable', () => {
    const wrapper = mountCard(buildProject({ name: 'Projeto Alpha' }), 'Alp')

    expect(wrapper.get('h2 mark').text()).toBe('Alp')
    expect(wrapper.get('h2').text()).toBe('Projeto Alpha')
  })

  it('highlights only the first occurrence of the term in the name', () => {
    const wrapper = mountCard(buildProject({ name: 'Projeto teste' }), 'te')

    expect(wrapper.findAll('h2 mark').map((mark) => mark.text())).toEqual(['te'])
    expect(wrapper.get('h2').text()).toBe('Projeto teste')
  })

  it('does not throw when a date is missing', () => {
    expect(() => mountCard(buildProject({ started_at: '', end_at: '' }))).not.toThrow()
  })

  it('navigates to the edit route for the project it was given', async () => {
    const wrapper = mountCard(buildProject({ id: 7 }))

    await pickMenuItem(wrapper, 'Editar')

    expect(push).toHaveBeenCalledWith('/projects/7/edit')
  })

  it('does not navigate when Remover is picked', async () => {
    const wrapper = mountCard(buildProject())

    await pickMenuItem(wrapper, 'Remover')

    expect(push).not.toHaveBeenCalled()
  })

  it('asks which project is about to go before letting the user delete anything', async () => {
    const wrapper = mountCard(buildProject({ name: 'Projeto 1' }))

    await openRemoveDialog(wrapper)

    const content = wrapper.get('.dialog-content')

    expect(wrapper.get('.dialog-title').text()).toBe('Remover projeto')
    expect(content.get('p').text()).toContain('Essa ação removerá definitivamente o projeto')
    expect(content.get('p span').text()).toBe('Projeto 1')
    expect(wrapper.find('.dialog-icon svg').exists()).toBe(true)
    expect(wrapper.get('.dialog-actions').text()).toBe('CancelarConfirmar')
  })

  it('opens the dialog when Remover is picked', async () => {
    const wrapper = mountCard(buildProject())

    await openRemoveDialog(wrapper)

    expect(showModalMock).toHaveBeenCalledTimes(1)
    expect(dialogOf(wrapper).open).toBe(true)
  })

  it('leaves the project alone and shuts the dialog when Cancelar is pressed', async () => {
    const wrapper = mountCard(buildProject())
    const store = useProjectsStore()

    await openRemoveDialog(wrapper)
    await wrapper.get('.dialog-actions button.secondary').trigger('click')

    expect(store.findProjectById(1)).toBeDefined()
    expect(dialogOf(wrapper).open).toBe(false)
  })

  it('removes the project and shuts the dialog when Confirmar is pressed', async () => {
    const wrapper = mountCard(buildProject())
    const store = useProjectsStore()

    await openRemoveDialog(wrapper)
    await wrapper.get('.dialog-actions button.primary').trigger('click')

    expect(store.findProjectById(1)).toBeUndefined()
    expect(dialogOf(wrapper).open).toBe(false)
  })
})
