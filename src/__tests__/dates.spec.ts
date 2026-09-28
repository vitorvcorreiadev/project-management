import { describe, it, expect } from 'vitest'

import { formatProjectDate } from '../utils/dates'

describe('formatProjectDate', () => {
  it('renders the exact day named by a date-only value', () => {
    expect(formatProjectDate('2026-09-01')).toBe('01 de setembro de 2026')
  })

  it('does not roll back to the previous year at a year boundary', () => {
    expect(formatProjectDate('2026-01-01')).toBe('01 de janeiro de 2026')
  })

  it('renders the day a timestamp falls on', () => {
    expect(formatProjectDate('2026-01-27T14:30:00.000Z')).toBe('27 de janeiro de 2026')
  })

  it('zero-pads the day', () => {
    expect(formatProjectDate('2026-06-30')).toBe('30 de junho de 2026')
  })

  it('returns an empty string instead of throwing on a missing value', () => {
    expect(formatProjectDate('')).toBe('')
  })
})
