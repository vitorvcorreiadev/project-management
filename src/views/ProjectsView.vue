<script setup lang="ts">
import ProjectsEmptyState from '@/components/project/ProjectsEmptyState.vue'
import ProjectList from '@/components/project-list/ProjectList.vue'
import { useProjectListing } from '@/composables/useProjectListing'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'

const store = useProjectsStore()
const { projects } = storeToRefs(store)
const { sortedProjects } = useProjectListing()
</script>

<template>
  <ProjectList v-if="projects.length" :projects="sortedProjects">
    <template #header>
      <div class="projects-list-header">
        <h2>Projetos</h2>
        <span>({{ sortedProjects.length }})</span>
      </div>
    </template>
  </ProjectList>
  <ProjectsEmptyState v-else />
</template>

<style lang="css" scoped>
.projects-list-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);

  span {
    font-size: var(--font-size-sm);
    color: var(--color-purple-500);
  }
}
</style>
