import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Project } from '@/types/project'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([
    {
      title: 'Projeto 1',
      client: 'Clicksign',
      started_at: '01 de setembro de 2024',
      ended_at: '12 de dezembro de 2024',
    },
    {
      title: 'Projeto 2',
      client: 'Clicksign',
      started_at: '01 de setembro de 2024',
      ended_at: '12 de dezembro de 2024',
    },
  ])

  return { projects }
})
