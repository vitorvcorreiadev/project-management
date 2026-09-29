import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { SortState, FilterState } from '@/types/project'

export const useListingStore = defineStore('listing', () => {
  const filters = ref<FilterState>({
    favorited: false,
  })

  const sorting = ref<SortState>({
    param: 'name',
    rule: 'asc',
  })

  function setFilter(key: 'favorited', value: boolean) {
    filters.value[key] = value
  }

  function setSorting(param: SortState['param'], rule: SortState['rule']) {
    sorting.value = { param, rule }
  }

  return { filters, sorting, setFilter, setSorting }
})
