<script setup lang="ts">
import ProjectsEmptyState from '@/components/ProjectsEmptyState.vue'
import ProjectsListing from '@/components/ProjectsListing.vue'
import { useProjectsStore } from '@/stores/projects'

const { projects } = useProjectsStore()
</script>

<template>
  <ProjectsListing v-if="projects.length" :projects="projects"></ProjectsListing>
  <ProjectsEmptyState v-else />
</template>

<style lang="css" scoped></style>
