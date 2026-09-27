<script setup lang="ts">
import ProjectsEmptyState from '@/components/ProjectsEmptyState.vue'
import ProjectsListing from '@/components/ProjectsListing.vue'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'

const store = useProjectsStore()
const { filteredProjects } = storeToRefs(store)
</script>

<template>
  <ProjectsListing v-if="filteredProjects.length" :projects="filteredProjects"></ProjectsListing>
  <ProjectsEmptyState v-else />
</template>

<style lang="css" scoped></style>
