import { describe, it, expect } from 'vitest'

import { firstInvalidField, isValidDate, validateProject } from '../project'
import type { ProjectInput } from '@/types/project'

const VALID: ProjectInput = {
  name: 'Projeto novo',
  client: 'Clicksign',
  started_at: '2026-09-01',
  end_at: '2026-12-15',
}

function build(overrides: Partial<ProjectInput> = {}): ProjectInput {
  return { ...VALID, ...overrides }
}

describe('isValidDate', () => {
  it('accepts a zero-padded calendar day', () => {
    expect(isValidDate('2026-09-01')).toBe(true)
  })

  it('accepts a real leap day', () => {
    expect(isValidDate('2024-02-29')).toBe(true)
  })

  it('rejects a day that overflows into the next month', () => {
    // `new Date` would silently roll this over to March 3rd instead of failing.
    expect(isValidDate('2026-02-31')).toBe(false)
  })

  it('rejects a leap day in a non-leap year', () => {
    expect(isValidDate('2026-02-29')).toBe(false)
  })

  it('rejects a month outside the calendar', () => {
    expect(isValidDate('2026-13-01')).toBe(false)
  })

  it('rejects a day outside the month', () => {
    expect(isValidDate('2026-04-31')).toBe(false)
  })

  it('rejects unpadded and reordered formats', () => {
    expect(isValidDate('2026-9-1')).toBe(false)
    expect(isValidDate('01/09/2026')).toBe(false)
    expect(isValidDate('09-01-2026')).toBe(false)
  })

  it('rejects an empty value and any surrounding text', () => {
    expect(isValidDate('')).toBe(false)
    expect(isValidDate(' 2026-09-01 ')).toBe(false)
    expect(isValidDate('2026-09-01T10:00')).toBe(false)
  })
})

describe('validateProject - name', () => {
  it('accepts two or more words', () => {
    expect(validateProject(build({ name: 'Loja Virtual' })).name).toBeUndefined()
  })

  it('accepts more than two words and repeated internal whitespace', () => {
    expect(validateProject(build({ name: '  Loja   Virtual   do   Brasil ' })).name).toBeUndefined()
  })

  it('accepts a two-word name whose second token is a digit', () => {
    expect(validateProject(build({ name: 'Projeto 1' })).name).toBeUndefined()
  })

  it('rejects a single word', () => {
    expect(validateProject(build({ name: 'Loja' })).name).toBe(
      'Por favor, digite ao menos duas palavras',
    )
  })

  it('rejects an empty name', () => {
    expect(validateProject(build({ name: '' })).name).toBe(
      'Por favor, digite ao menos duas palavras',
    )
  })

  it('rejects a name made only of whitespace, which `required` would accept', () => {
    expect(validateProject(build({ name: '   ' })).name).toBe(
      'Por favor, digite ao menos duas palavras',
    )
    expect(validateProject(build({ name: '\t\n ' })).name).toBe(
      'Por favor, digite ao menos duas palavras',
    )
  })
})

describe('validateProject - client', () => {
  it('accepts a single word, since company names rarely have more', () => {
    expect(validateProject(build({ client: 'Clicksign' })).client).toBeUndefined()
  })

  it('accepts a multi-word client', () => {
    expect(validateProject(build({ client: 'Clicksign Software' })).client).toBeUndefined()
  })

  it('rejects a whitespace-only client, which `required` would accept', () => {
    expect(validateProject(build({ client: '  ' })).client).toBe(
      'Por favor, digite ao menos uma palavra',
    )
  })

  it('rejects an empty client', () => {
    expect(validateProject(build({ client: '' })).client).toBe(
      'Por favor, digite ao menos uma palavra',
    )
  })
})

describe('validateProject - started_at', () => {
  it('accepts a valid date', () => {
    expect(validateProject(build({ started_at: '2026-09-01' })).started_at).toBeUndefined()
  })

  it('rejects an empty date', () => {
    expect(validateProject(build({ started_at: '' })).started_at).toBe('Selecione uma data válida')
  })

  it('rejects a malformed date', () => {
    expect(validateProject(build({ started_at: '31/09/2026' })).started_at).toBe(
      'Selecione uma data válida',
    )
  })
})

describe('validateProject - end_at range', () => {
  it('accepts an end date after the start date', () => {
    expect(
      validateProject(build({ started_at: '2026-09-01', end_at: '2026-12-15' })).end_at,
    ).toBeUndefined()
  })

  it('accepts an end date equal to the start date', () => {
    expect(
      validateProject(build({ started_at: '2026-09-01', end_at: '2026-09-01' })).end_at,
    ).toBeUndefined()
  })

  it('rejects an end date before the start date', () => {
    expect(validateProject(build({ started_at: '2026-09-01', end_at: '2026-08-31' })).end_at).toBe(
      'A data final deve ser igual ou posterior à data de início.',
    )
  })

  it('does not also report the range when the end date is itself invalid', () => {
    const errors = validateProject(build({ started_at: '2026-09-01', end_at: '2026-02-31' }))

    expect(errors.end_at).toBe('Selecione uma data válida')
  })

  it('does not also report the range when the start date is itself invalid', () => {
    const errors = validateProject(build({ started_at: 'nope', end_at: '2026-12-15' }))

    expect(errors.end_at).toBeUndefined()
  })
})

describe('validateProject', () => {
  it('reports nothing for a fully valid project', () => {
    expect(validateProject(VALID)).toEqual({})
  })

  it('reports every invalid field at once', () => {
    const errors = validateProject({ name: '', client: '  ', started_at: '', end_at: '' })

    expect(Object.keys(errors).sort()).toEqual(['client', 'end_at', 'name', 'started_at'])
  })
})

describe('firstInvalidField', () => {
  it('is undefined when nothing is wrong', () => {
    expect(firstInvalidField(validateProject(VALID))).toBeUndefined()
  })

  it('follows the visual order of the form rather than object key order', () => {
    const errors = validateProject({ name: '', client: '', started_at: '', end_at: '' })

    expect(firstInvalidField(errors)).toBe('name')
    expect(firstInvalidField({ end_at: 'x', started_at: 'x' })).toBe('started_at')
    expect(firstInvalidField({ client: 'x' })).toBe('client')
  })

  it('reaches the date range error when it is the only problem left', () => {
    const errors = validateProject(build({ started_at: '2026-09-01', end_at: '2026-01-01' }))

    expect(firstInvalidField(errors)).toBe('end_at')
  })
})
