<script setup lang="ts">
import ProjectsListing from '@/components/ProjectsListing.vue'
import BaseBreadcrumb from '@/components/BaseBreadcrumb.vue'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import useSearchBox from '@/composables/useSearchBox'

const store = useProjectsStore()
const { searchedProjects, filters } = storeToRefs(store)

const { resetSearch } = useSearchBox()
</script>

<template>
  <ProjectsListing :projects="searchedProjects" :filterPanel="false" :highlightTerm="filters.term">
    <template #header>
      <BaseBreadcrumb title="Resultado da busca" @back="resetSearch" />
    </template>
  </ProjectsListing>
</template>
