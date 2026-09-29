import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'

import useProjectForm from '../composables/useProjectForm'
import type { Project } from '../types/project'

const EXISTING: Project = {
  id: 7,
  name: 'Loja Virtual',
  client: 'Clicksign',
  started_at: '2026-09-01',
  end_at: '2026-12-15',
  favorited: true,
  hasCover: true,
}

describe('useProjectForm', () => {
  it('seeds a blank draft with a generated id', () => {
    const { form } = useProjectForm()

    expect(form.name).toBe('')
    expect(form.client).toBe('')
    expect(form.started_at).toBe('')
    expect(form.end_at).toBe('')
    expect(form.id).toBeTypeOf('number')
  })

  it('seeds from an existing project, which is how the edit form reuses it', () => {
    const { form } = useProjectForm(EXISTING)

    expect({ ...form }).toEqual(EXISTING)
  })

  it('says nothing about fields the user has not reached yet', () => {
    const { visibleErrors } = useProjectForm()

    expect(visibleErrors.value).toEqual({})
  })

  it('reveals only the field that was left', () => {
    const { form, visibleErrors, touch } = useProjectForm()

    form.name = 'Loja'
    touch('name')

    expect(visibleErrors.value).toEqual({ name: 'Por favor, digite ao menos duas palavras' })
  })

  it('revises a revealed message as the draft changes', async () => {
    const { form, visibleErrors, touch } = useProjectForm()

    touch('name')
    expect(visibleErrors.value.name).toBeDefined()

    form.name = 'Loja Virtual'
    await nextTick()

    expect(visibleErrors.value).toEqual({})
  })

  it('revalidates on blur even when the draft never changed', () => {
    const { visibleErrors, touch } = useProjectForm()

    touch('client')

    expect(visibleErrors.value).toEqual({ client: 'Por favor, digite ao menos uma palavra' })
  })

  it('unlocks every field once a submit is refused', () => {
    const { visibleErrors, validateAll } = useProjectForm()

    expect(validateAll()).toBe('name')
    expect(Object.keys(visibleErrors.value).sort()).toEqual([
      'client',
      'end_at',
      'name',
      'started_at',
    ])
  })

  it('accepts a draft that satisfies every rule', () => {
    const { validateAll } = useProjectForm(EXISTING)

    expect(validateAll()).toBeUndefined()
  })

  it('restores the seeded draft and clears the messages on reset', () => {
    const { form, visibleErrors, touch, validateAll, reset } = useProjectForm(EXISTING)

    form.name = 'Loja'
    touch('name')
    validateAll()
    expect(visibleErrors.value.name).toBeDefined()

    reset()

    expect({ ...form }).toEqual(EXISTING)
    expect(visibleErrors.value).toEqual({})
  })

  it('stays silent again after a reset, until the next interaction', () => {
    const { form, visibleErrors, validateAll, reset } = useProjectForm()

    form.name = 'Loja'
    validateAll()
    reset()

    form.client = 'Clicksign'

    expect(visibleErrors.value).toEqual({})
  })
})
