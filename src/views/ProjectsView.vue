<script setup lang="ts">
import ProjectsEmptyState from '@/components/ProjectsEmptyState.vue'
import ProjectsListing from '@/components/ProjectsListing.vue'
import type { Project } from '@/types/project'
import { ref } from 'vue'

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
  {
    title: 'Projeto 1',
    client: 'Clicksign',
    started_at: '01 de setembro de 2024',
    ended_at: '12 de dezembro de 2024',
  },
  {
    title: 'Projeto 1',
    client: 'Clicksign',
    started_at: '01 de setembro de 2024',
    ended_at: '12 de dezembro de 2024',
  },
  {
    title: 'Projeto 1',
    client: 'Clicksign',
    started_at: '01 de setembro de 2024',
    ended_at: '12 de dezembro de 2024',
  },
  {
    title: 'Projeto 1',
    client: 'Clicksign',
    started_at: '01 de setembro de 2024',
    ended_at: '12 de dezembro de 2024',
  },
  {
    title: 'Projeto 1',
    client: 'Clicksign',
    started_at: '01 de setembro de 2024',
    ended_at: '12 de dezembro de 2024',
  },
  {
    title: 'Projeto 1',
    client: 'Clicksign',
    started_at: '01 de setembro de 2024',
    ended_at: '12 de dezembro de 2024',
  },
  {
    title: 'Projeto 1',
    client: 'Clicksign',
    started_at: '01 de setembro de 2024',
    ended_at: '12 de dezembro de 2024',
  },
])
</script>

<template>
  <ProjectsListing v-if="projects.length" :projects="projects"></ProjectsListing>
  <ProjectsEmptyState v-else />
</template>

<style lang="css" scoped></style>
