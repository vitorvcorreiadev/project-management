import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Project, SortParam, SortRule } from '@/types/project'

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

    const filters = ref({
      favorited: false,
      term: '',
    })

    const filteredProjects = computed(() => {
      return projects.value.filter((project) => {
        const matchesFavorited = !filters.value.favorited || project.favorited === true

        return matchesFavorited
      })
    })

    const searchedProjects = computed(() => {
      return projects.value.filter((project) => {
        const matchesTerm =
          !filters.value.term ||
          project.name.toLowerCase().includes(filters.value.term.toLowerCase())

        return matchesTerm
      })
    })

    const sorting = ref<{ param: SortParam; rule: SortRule }>({
      param: 'name',
      rule: 'asc',
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

    const toggleFavorite = (id: number) => {
      const project = projects.value.find((project) => project.id == id)

      if (!project) return

      project.favorited = !project.favorited
    }

    return {
      sortedProjects,
      toggleFavorite,
      filters,
      projects,
      sorting,
      searchedProjects,
      createProject,
      findProjectById,
      updateProject,
    }
  },
  {
    persist: {
      pick: ['projects'],
    },
  },
)
