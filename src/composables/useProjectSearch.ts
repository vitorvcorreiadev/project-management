import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjectsStore } from '@/stores/projects'
import { useSearchStore } from '@/stores/search'

export function useProjectSearch() {
  const projectsStore = useProjectsStore()
  const searchStore = useSearchStore()

  const { projects } = storeToRefs(projectsStore)
  const { searchTerm } = storeToRefs(searchStore)

  const searchedProjects = computed(() => {
    return projects.value.filter((project) => {
      const matchesTerm =
        !searchTerm.value ||
        project.name.toLowerCase().includes(searchTerm.value.toLowerCase())

      return matchesTerm
    })
  })

  return {
    searchTerm,
    searchedProjects,
  }
}
