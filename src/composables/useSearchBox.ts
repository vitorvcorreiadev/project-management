import { computed, nextTick, ref, useId, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProjectsStore } from '@/stores/projects'
import { useSearchHistoryStore, filterTerms } from '@/stores/searchHistory'

import { useClickOutside } from '@/composables/useClickOutside'

export default function useSearchBox() {
  const router = useRouter()

  const searchBoxRef = ref<HTMLElement | null>(null)
  const inputRef = ref<HTMLElement | null>(null)
  const buttonRef = ref<HTMLElement | null>(null)

  const store = useProjectsStore()
  const { filters } = storeToRefs(store)

  const history = useSearchHistoryStore()
  const listboxId = `search-history-${useId()}`
  const activeIndex = ref(-1)

  const opened = ref(false)
  const visibleTerms = computed(() => filterTerms(history.terms, filters.value.term))
  const panelOpen = computed(() => visibleTerms.value.length > 0)
  const activeId = computed(() =>
    activeIndex.value < 0 ? undefined : `${listboxId}-option-${activeIndex.value}`,
  )

  async function openSearch() {
    opened.value = true
    await nextTick()
    inputRef.value?.focus()
  }

  function closeSearch() {
    opened.value = false
  }

  // The only path that records. Escape goes through `cancelSearch`, which clears
  // the term first, so a cancelled search can never reach the history.
  function dismissSearch() {
    history.record(filters.value.term)
    closeSearch()
  }

  function resetSearch() {
    filters.value.term = ''
  }

  async function cancelSearch() {
    resetSearch()
    closeSearch()
    await nextTick()
    buttonRef.value?.focus()

    if (router.currentRoute.value.name == 'projects-search-result') {
      router.back()
    }
  }

  function applyTerm(term: string) {
    filters.value.term = term

    if (term.length >= 3) {
      router.push('/search')
    } else if (router.currentRoute.value.name == 'projects-search-result') {
      router.push('/')
    }
  }

  function handleSearch(e: InputEvent) {
    applyTerm((e.target as HTMLInputElement).value)
  }

  function selectHistoryTerm(term: string) {
    applyTerm(term)
    history.record(term)
  }

  // `applyTerm` writes `filters.term`, which is what `visibleTerms` filters on, so
  // picking an entry narrows the panel down to that entry on its own. That is
  // left to stand rather than special-cased: it is the same rule the input
  // already follows, and the alternative is a filter that has to remember which
  // term it just filled the box with.

  function removeHistoryTerm(term: string) {
    history.remove(term)
  }

  function moveActive(delta: number) {
    const total = visibleTerms.value.length
    if (total === 0) return

    // The first ArrowUp starts from the end of the list the way the first ArrowDown
    // starts from the beginning: without the `||` the `-1` sentinel would count as
    // one step up and land on the second-to-last option.
    const from = activeIndex.value < 0 && delta < 0 ? 0 : activeIndex.value
    activeIndex.value = (from + delta + total) % total
  }

  function pickActiveTerm() {
    const term = visibleTerms.value[activeIndex.value]
    if (term === undefined) return

    selectHistoryTerm(term)
  }

  // Typing, picking and removing all change the list, and a stale `activeIndex`
  // would leave `aria-activedescendant` pointing at an option that is gone. One
  // watcher covers the three, where three manual resets would eventually miss one.
  watch(visibleTerms, () => {
    activeIndex.value = -1
  })

  useClickOutside(searchBoxRef, () => dismissSearch(), [buttonRef])

  return {
    handleSearch,
    searchBoxRef,
    cancelSearch,
    dismissSearch,
    resetSearch,
    openSearch,
    buttonRef,
    inputRef,
    filters,
    opened,
    visibleTerms,
    panelOpen,
    listboxId,
    activeIndex,
    activeId,
    moveActive,
    pickActiveTerm,
    selectHistoryTerm,
    removeHistoryTerm,
  }
}
