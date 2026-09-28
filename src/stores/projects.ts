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
        started_at: '2026-01-27T14:30:00.000Z',
        end_at: '2026-06-30T14:30:00.000Z',
        favorited: false,
      },
      {
        id: 2,
        name: 'Projeto 2',
        client: 'Clicksign',
        started_at: '2025-01-27T14:30:00.000Z',
        end_at: '2025-06-30T14:30:00.000Z',
        favorited: false,
      },
      {
        id: 3,
        name: 'AAAAAA',
        client: 'Clicksign',
        started_at: '2022-01-27T14:30:00.000Z',
        end_at: '2022-06-30T14:30:00.000Z',
        favorited: false,
      },
      {
        id: 4,
        name: 'QQQQQQQQQ',
        client: 'Clicksign',
        started_at: '2021-01-27T14:30:00.000Z',
        end_at: '2021-06-30T14:30:00.000Z',
        favorited: false,
      },
      {
        id: 5,
        name: 'OOOOOOOO',
        client: 'Clicksign',
        started_at: '2026-01-27T14:30:00.000Z',
        end_at: '2026-06-30T14:30:00.000Z',
        favorited: false,
      },
    ])

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

    return { sortedProjects, toggleFavorite, filters, projects, sorting, searchedProjects }
  },
  {
    persist: {
      pick: ['projects'],
    },
  },
)
