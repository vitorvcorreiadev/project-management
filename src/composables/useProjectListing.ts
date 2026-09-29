import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjectsStore } from '@/stores/projects'
import type { SortParam, SortRule } from '@/types/project'

const filters = ref({
  favorited: false,
})

const sorting = ref<{ param: SortParam; rule: SortRule }>({
  param: 'name',
  rule: 'asc',
})

export function useProjectListing() {
  const store = useProjectsStore()
  const { projects } = storeToRefs(store)

  const filteredProjects = computed(() => {
    return projects.value.filter((project) => {
      const matchesFavorited = !filters.value.favorited || project.favorited === true

      return matchesFavorited
    })
  })

  const sortedProjects = computed(() => {
    const { param, rule } = sorting.value
    const mult = rule === 'asc' ? 1 : -1

    return [...filteredProjects.value].sort((a, b) => {
      const valueA = a[param]
      const valueB = b[param]

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA.localeCompare(valueB) * mult
      }

      if (valueA < valueB) return -1 * mult
      if (valueA > valueB) return 1 * mult
      return 0
    })
  })

  return {
    filters,
    sorting,
    filteredProjects,
    sortedProjects,
  }
}
