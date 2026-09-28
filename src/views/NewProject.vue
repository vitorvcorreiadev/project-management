<script setup lang="ts">
import BaseBreadcrumb from '@/components/BaseBreadcrumb.vue'
import ProjectForm from '@/components/ProjectForm.vue'
import { useProjectsStore } from '@/stores/projects'
import { useRouter } from 'vue-router'
import type { Project } from '@/types/project'

const store = useProjectsStore()
const router = useRouter()

function handleSave(project: Project): void {
  store.createProject(project)
  router.push('/')
}
</script>

<template>
  <div>
    <BaseBreadcrumb title="Novo projeto" />

    <ProjectForm @save="handleSave" />
  </div>
</template>
