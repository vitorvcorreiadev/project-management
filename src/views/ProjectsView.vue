<script setup lang="ts">
import ProjectsEmptyState from '@/components/ProjectsEmptyState.vue'
import { ref } from 'vue'

const projects = ref([])
</script>

<template>
  <ProjectsEmptyState v-if="!projects.length" />
</template>

<style lang="css" scoped></style>
