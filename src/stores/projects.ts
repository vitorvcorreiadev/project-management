import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Project } from '@/types/project'

export const useProjectsStore = defineStore(
  'projects',
  () => {
    const projects = ref<Project[]>([])

    const createProject = (project: Project) => {
      projects.value.push(project)
    }

    const findProjectById = (id: number) => projects.value.find((project) => project.id === id)

    const updateProject = (project: Project) => {
      const target = findProjectById(project.id)

      if (!target) return

      // Mutated in place rather than replaced, so a component holding a reference
      // to this project keeps seeing fresh values.
      Object.assign(target, project)
    }

    const removeProject = (id: number) => {
      projects.value = projects.value.filter((project) => project.id !== id)
    }

    const toggleFavorite = (id: number) => {
      const project = projects.value.find((project) => project.id == id)

      if (!project) return

      project.favorited = !project.favorited
    }

    return {
      projects,
      createProject,
      findProjectById,
      updateProject,
      removeProject,
      toggleFavorite,
    }
  },
  {
    persist: {
      pick: ['projects'],
    },
  },
)
