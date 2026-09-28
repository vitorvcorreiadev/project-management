<script setup lang="ts">
import BaseButton from './BaseButton.vue'
import BaseToggle from './BaseToggle.vue'
import ProjectCard from './ProjectCard.vue'
import type { Project, SortParam, SortRule } from '@/types/project'
import PlusCircle from '@/assets/images/PlusCircle.vue'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const store = useProjectsStore()
const { filters, sorting } = storeToRefs(store)

withDefaults(defineProps<{ projects: Project[]; filterPanel?: boolean }>(), { filterPanel: true })

const router = useRouter()

const handleSortSelection = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const selectedOption = target.options[target.selectedIndex]

  sorting.value.param = selectedOption?.dataset.param as SortParam
  sorting.value.rule = selectedOption?.dataset.rule as SortRule
}
</script>

<template>
  <div class="project-listing">
    <header>
      <slot name="header"></slot>

      <div v-if="filterPanel">
        <BaseToggle v-model="filters.favorited">Apenas Favoritos</BaseToggle>

        <select @change="handleSortSelection" :value="sorting.param">
          <option data-param="name" data-rule="asc" value="name">Ordem alfabética</option>
          <option data-param="started_at" data-rule="desc" value="started_at">
            Iniciados mais recentes
          </option>
          <option data-param="end_at" data-rule="desc" value="end_at">Prazo mais próximo</option>
        </select>

        <BaseButton @click="router.push('/projects/new')">
          <PlusCircle />
          Novo Projeto
        </BaseButton>
      </div>
    </header>

    <ul>
      <li v-for="project in projects" :key="project.id">
        <ProjectCard :project="project" />
      </li>
    </ul>
  </div>
</template>

<style lang="css" scoped>
.project-listing {
  > header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    > div:last-child {
      display: flex;
      align-items: center;
      gap: var(--space-6);
    }
  }

  > ul {
    display: flex;
    gap: var(--space-6);
    flex-wrap: wrap;
    margin-top: var(--space-5);
  }
}
</style>
