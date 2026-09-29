import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import {
  MAX_STORED_TERMS,
  MIN_TERM_LENGTH,
  VISIBLE_TERMS,
  filterTerms,
  useSearchHistoryStore,
} from '../stores/searchHistory'

/*
 * The store and `filterTerms` are the only places that decide what a search is and
 * what the panel shows, so both are asserted here in isolation. The composable and
 * the component are tested separately and would each otherwise re-assert the same
 * deduplication, cap and matching rules.
 */
describe('searchHistory', () => {
  beforeEach(() => setActivePinia(createPinia()))

  const store = () => useSearchHistoryStore()

  it('starts with no stored term', () => {
    expect(store().terms).toEqual([])
  })

  it('records a term as the newest one', () => {
    store().record('Alp')

    expect(store().terms).toEqual(['Alp'])
  })

  it('keeps the older terms below the newest one', () => {
    store().record('Alp')
    store().record('Bet')

    expect(store().terms).toEqual(['Bet', 'Alp'])
  })

  it('ignores a term below the minimum length', () => {
    store().record('Al')

    expect(store().terms).toEqual([])
  })

  it('ignores a blank term', () => {
    store().record('   ')

    expect(store().terms).toEqual([])
  })

  it('trims the term before measuring it', () => {
    store().record('  ab  ')

    expect(store().terms).toEqual([])
  })

  it('records a padded term without the padding', () => {
    store().record('  Alfa  ')

    expect(store().terms).toEqual(['Alfa'])
  })

  it('measures the minimum length after trimming', () => {
    expect(MIN_TERM_LENGTH).toBe(3)
  })

  it('moves an already stored term back to the newest position', () => {
    store().record('Alp')
    store().record('Bet')
    store().record('Gam')
    store().record('Alp')

    expect(store().terms).toEqual(['Alp', 'Gam', 'Bet'])
  })

  it('never stores the same term twice', () => {
    store().record('Alp')
    store().record('Alp')

    expect(store().terms).toEqual(['Alp'])
  })

  it('matches an already stored term ignoring the case', () => {
    store().record('Alfa')
    store().record('alfa')

    expect(store().terms).toEqual(['Alfa'])
  })

  it('keeps the casing that was stored first', () => {
    store().record('Alfa')
    store().record('ALFA')

    expect(store().terms).toEqual(['Alfa'])
  })

  it('leaves the list untouched when the same term is dismissed again', () => {
    store().record('Alp')
    store().record('Alp')

    expect(store().terms).toEqual(['Alp'])
  })

  it(`keeps only the ${MAX_STORED_TERMS} most recent terms`, () => {
    const twelve = [
      'a01',
      'a02',
      'a03',
      'a04',
      'a05',
      'a06',
      'a07',
      'a08',
      'a09',
      'a10',
      'a11',
      'a12',
    ]
    for (const term of twelve) store().record(term)

    expect(store().terms).toHaveLength(MAX_STORED_TERMS)
    expect(store().terms[0]).toBe('a12')
    expect(store().terms[MAX_STORED_TERMS - 1]).toBe('a03')
  })

  it('drops the oldest term once the cap is reached', () => {
    store().record('Alp')
    for (const term of ['a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a10']) {
      store().record(term)
    }

    expect(store().terms).not.toContain('Alp')
  })

  it('removes a term', () => {
    store().record('Alp')
    store().record('Bet')
    store().remove('Bet')

    expect(store().terms).toEqual(['Alp'])
  })

  it('removes a term ignoring the case', () => {
    store().record('Alfa')
    store().remove('ALFA')

    expect(store().terms).toEqual([])
  })

  it('ignores the removal of a term that is not stored', () => {
    store().record('Alp')
    store().remove('Bet')

    expect(store().terms).toEqual(['Alp'])
  })
})

describe('filterTerms', () => {
  const stored = ['s6', 's5', 's4', 's3', 's2', 's1']

  it('returns the five most recent terms for a blank filter', () => {
    expect(filterTerms(stored, '')).toEqual(['s6', 's5', 's4', 's3', 's2'])
  })

  it('matches anywhere in a term and not only at its start', () => {
    expect(filterTerms(stored, '5')).toEqual(['s5'])
  })

  it('matches ignoring the case', () => {
    expect(filterTerms(['Alfa', 'Beta'], 'AL')).toEqual(['Alfa'])
  })

  it('keeps the stored order among the matches instead of sorting them', () => {
    expect(filterTerms(['Gama', 'Alfa', 'Bola'], 'a')).toEqual(['Gama', 'Alfa', 'Bola'])
  })

  it(`returns only the ${VISIBLE_TERMS} most recent matches`, () => {
    const many = Array.from({ length: 8 }, (_, index) => `match${index}`)

    expect(filterTerms(many, 'match')).toHaveLength(VISIBLE_TERMS)
  })

  it('surfaces a stored term below the recent five when they do not match', () => {
    expect(filterTerms(stored, 's1')).toEqual(['s1'])
  })

  it('returns nothing when no term matches', () => {
    expect(filterTerms(stored, 'zzz')).toEqual([])
  })

  it('ignores a filter that is only padding', () => {
    expect(filterTerms(['Alfa'], '   ')).toEqual(['Alfa'])
  })

  it('narrows from a single character, with no minimum length', () => {
    expect(filterTerms(['Alfa', 'Bet'], 'A')).toEqual(['Alfa'])
  })

  it('leaves the stored terms untouched', () => {
    const terms = ['Alfa', 'Beta']
    filterTerms(terms, 'Al')

    expect(terms).toEqual(['Alfa', 'Beta'])
  })
})
