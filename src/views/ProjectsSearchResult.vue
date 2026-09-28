<script setup lang="ts">
import ProjectsListing from '@/components/ProjectsListing.vue'
import BaseBreadcrumb from '@/components/BaseBreadcrumb.vue'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import useSearchBox from '@/composables/useSearchBox'

const store = useProjectsStore()
const { searchedProjects } = storeToRefs(store)

const { resetSearch } = useSearchBox()
</script>

<template>
  <ProjectsListing :projects="searchedProjects" :filterPanel="false">
    <template #header>
      <BaseBreadcrumb @back="resetSearch" />
    </template>
  </ProjectsListing>
</template>
