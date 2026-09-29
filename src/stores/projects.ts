import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Project } from '@/types/project'

export const useProjectsStore = defineStore(
  'projects',
  () => {
    const projects = ref<Project[]>([
      {
        id: 1,
        name: 'Projeto 1',
        client: 'Clicksign',
        started_at: '2026-01-27',
        end_at: '2026-06-30',
        favorited: false,
        hasCover: false,
      },
      {
        id: 2,
        name: 'Projeto 2',
        client: 'Clicksign',
        started_at: '2025-01-27',
        end_at: '2025-06-30',
        favorited: false,
        hasCover: false,
      },
      {
        id: 3,
        name: 'AAAAAA',
        client: 'Clicksign',
        started_at: '2022-01-27',
        end_at: '2022-06-30',
        favorited: false,
        hasCover: false,
      },
      {
        id: 4,
        name: 'QQQQQQQQQ',
        client: 'Clicksign',
        started_at: '2021-01-27',
        end_at: '2021-06-30',
        favorited: false,
        hasCover: false,
      },
      {
        id: 5,
        name: 'OOOOOOOO',
        client: 'Clicksign',
        started_at: '2026-01-27',
        end_at: '2026-06-30',
        favorited: false,
        hasCover: false,
      },
    ])

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
