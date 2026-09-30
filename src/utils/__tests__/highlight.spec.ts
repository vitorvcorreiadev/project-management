import { describe, it, expect } from 'vitest'

import { splitByTerm } from '../highlight'

describe('splitByTerm', () => {
  it('returns the whole text unmatched when there is no term', () => {
    expect(splitByTerm('Projeto Alpha', '')).toEqual([{ text: 'Projeto Alpha', matched: false }])
  })

  it('returns the whole text unmatched when the term is longer than the text', () => {
    expect(splitByTerm('Alpha', 'Alpha Beta')).toEqual([{ text: 'Alpha', matched: false }])
  })

  it('splits the text around a single match', () => {
    expect(splitByTerm('Projeto Alpha', 'Alpha')).toEqual([
      { text: 'Projeto ', matched: false },
      { text: 'Alpha', matched: true },
    ])
  })

  it('splits the text around the first match only', () => {
    expect(splitByTerm('Projeto Pro', 'Pro')).toEqual([
      { text: 'Pro', matched: true },
      { text: 'jeto Pro', matched: false },
    ])
  })

  it('marks the first of the matches it finds, leaving the later ones untouched', () => {
    expect(splitByTerm('teste', 'te')).toEqual([
      { text: 'te', matched: true },
      { text: 'ste', matched: false },
    ])
  })

  it('matches ignoring the case while keeping the casing of the text', () => {
    expect(splitByTerm('Projeto Alpha', 'aLP')).toEqual([
      { text: 'Projeto ', matched: false },
      { text: 'Alp', matched: true },
      { text: 'ha', matched: false },
    ])
  })

  it('matches regex-only characters literally instead of building a pattern', () => {
    expect(splitByTerm('Projeto (Alpha)', '(Alpha)')).toEqual([
      { text: 'Projeto ', matched: false },
      { text: '(Alpha)', matched: true },
    ])
  })

  it('matches a term that is the whole text', () => {
    expect(splitByTerm('Alpha', 'alpha')).toEqual([{ text: 'Alpha', matched: true }])
  })

  it('returns the empty text unmatched without throwing', () => {
    expect(splitByTerm('', 'Alpha')).toEqual([{ text: '', matched: false }])
  })
})
