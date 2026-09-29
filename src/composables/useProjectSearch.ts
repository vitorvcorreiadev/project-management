import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjectsStore } from '@/stores/projects'

const searchTerm = ref('')

export function useProjectSearch() {
  const store = useProjectsStore()
  const { projects } = storeToRefs(store)

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
