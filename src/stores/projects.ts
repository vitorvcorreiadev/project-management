import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Project } from '@/types/project'

export const useProjectsStore = defineStore(
  'projects',
  () => {
    const projects = ref<Project[]>([
      {
        id: 1,
        title: 'Projeto 1',
        client: 'Clicksign',
        started_at: '01 de setembro de 2024',
        ended_at: '12 de dezembro de 2024',
        favorited: false,
      },
      {
        id: 2,
        title: 'Projeto 2',
        client: 'Clicksign',
        started_at: '01 de setembro de 2024',
        ended_at: '12 de dezembro de 2024',
        favorited: false,
      },
    ])

    const filters = ref({
      favorited: false,
    })

    const filteredProjects = computed(() => {
      return projects.value.filter((project) => {
        return !filters.value.favorited || project.favorited === true
      })
    })

    const toggleFavorite = (id: number) => {
      const project = projects.value.find((project) => project.id == id)

      if (!project) return

      project.favorited = !project.favorited
    }

    return { filteredProjects, toggleFavorite, filters, projects }
  },
  {
    persist: {
      pick: ['projects'],
    },
  },
)
