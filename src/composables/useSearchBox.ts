import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProjectsStore } from '@/stores/projects'

import { useClickOutside } from '@/composables/useClickOutside'

export default function useSearchBox() {
  const router = useRouter()

  const searchBoxRef = ref<HTMLElement | null>(null)
  const inputRef = ref<HTMLElement | null>(null)
  const buttonRef = ref<HTMLElement | null>(null)

  const store = useProjectsStore()
  const { filters } = storeToRefs(store)

  const opened = ref(false)

  async function openSearch() {
    opened.value = true
    await nextTick()
    inputRef.value?.focus()
  }

  function closeSearch() {
    opened.value = false
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

  function handleSearch(e: InputEvent) {
    const target = e.target as HTMLInputElement
    const searchTerm = target.value
    filters.value.term = searchTerm

    if (searchTerm.length >= 3) {
      router.push('/search')
    } else if (router.currentRoute.value.name == 'projects-search-result') {
      router.push('/')
    }
  }

  useClickOutside(searchBoxRef, () => closeSearch(), [buttonRef])

  return {
    handleSearch,
    searchBoxRef,
    cancelSearch,
    resetSearch,
    openSearch,
    buttonRef,
    inputRef,
    filters,
    opened,
  }
}
