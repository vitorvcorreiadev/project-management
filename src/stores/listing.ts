import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { SortParam, SortRule } from '@/types/project'

export const useListingStore = defineStore('listing', () => {
  const filters = ref({
    favorited: false,
  })

  const sorting = ref<{ param: SortParam; rule: SortRule }>({
    param: 'name',
    rule: 'asc',
  })

  function setFilter(key: 'favorited', value: boolean) {
    filters.value[key] = value
  }

  function setSorting(param: SortParam, rule: SortRule) {
    sorting.value = { param, rule }
  }

  return { filters, sorting, setFilter, setSorting }
})
