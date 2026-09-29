<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from './BaseButton.vue'
import PlusCircle from '@/assets/images/PlusCircle.vue'

const router = useRouter()
</script>

<template>
  <div class="projects-empty-state">
    <h2>Nenhum projeto</h2>

    <p>Clique no botão abaixo para criar o primeiro e gerenciá-lo.</p>

    <BaseButton size="large" @click="router.push({ name: 'new-project' })">
      <PlusCircle />
      <span>Novo Projeto</span>
    </BaseButton>
  </div>
</template>

<style scoped>
.projects-empty-state {
  background-color: var(--color-surface);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: var(--radius-1);

  p {
    padding-block: var(--space-5) var(--space-6);
  }
}
</style>
