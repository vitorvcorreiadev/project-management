<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from './BaseButton.vue'
import PlusCircle from '@/assets/images/PlusCircle.vue'

const router = useRouter()
</script>

<template>
  <div role="status" aria-live="polite">
    <h1>Nenhum projeto</h1>

    <p>Clique no botão abaixo para criar o primeiro e gerenciá-lo.</p>

    <BaseButton size="large" @click="router.push('/new-project')">
      <PlusCircle />
      Novo Projeto
    </BaseButton>
  </div>
</template>

<style lang="css" scoped>
div[role='status'] {
  width: 100%;
  background-color: white;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: var(--radius-4);

  p {
    padding: var(--space-5) 0 var(--space-6);
  }
}
</style>
