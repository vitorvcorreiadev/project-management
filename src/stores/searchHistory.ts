import { ref } from 'vue'
import { defineStore } from 'pinia'

export const MAX_STORED_TERMS = 10
export const VISIBLE_TERMS = 5
export const MIN_TERM_LENGTH = 3

/*
 * The terms are kept in one newest-first array and the cap is enforced on write
 * rather than on read, so the persisted payload never grows past the limit.
 * `filterTerms` deliberately takes the whole array instead of a pre-sliced one:
 * that is what lets a term sitting below the recent five surface once the recent
 * five are filtered out.
 */
export function filterTerms(terms: string[], filter: string): string[] {
  const needle = filter.trim().toLowerCase()
  const matches = needle ? terms.filter((term) => term.toLowerCase().includes(needle)) : terms

  return matches.slice(0, VISIBLE_TERMS)
}

export const useSearchHistoryStore = defineStore(
  'searchHistory',
  () => {
    const terms = ref<string[]>([])

    function record(rawTerm: string) {
      const term = rawTerm.trim()
      if (term.length < MIN_TERM_LENGTH) return

      // A repeat search moves the entry that is already there rather than adding
      // the incoming one, so the casing the term was first stored with survives a
      // later search that spells it differently.
      const index = terms.value.findIndex((it) => it.toLowerCase() === term.toLowerCase())
      if (index !== -1) {
        const [stored] = terms.value.splice(index, 1)
        terms.value.unshift(stored ?? term)
        return
      }

      terms.value.unshift(term)
      terms.value = terms.value.slice(0, MAX_STORED_TERMS)
    }

    function remove(rawTerm: string) {
      terms.value = terms.value.filter((it) => it.toLowerCase() !== rawTerm.toLowerCase())
    }

    return { terms, record, remove }
  },
  { persist: true },
)
