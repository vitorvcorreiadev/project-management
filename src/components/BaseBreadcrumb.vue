<script setup lang="ts">
import ArrowLeft from '@/assets/images/ArrowLeft.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const emit = defineEmits(['back'])

const handleBack = () => {
  router.back()
  emit('back')
}
</script>

<template>
  <div class="breadcrumb">
    <button @click="handleBack">
      <ArrowLeft />
      Voltar
    </button>

    <h2>Resultado da busca</h2>
  </div>
</template>

<style lang="css" scoped>
.breadcrumb {
  button {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    color: var(--color-purple-500);
    margin-bottom: var(--space-2);
    cursor: pointer;
    font-size: var(--font-size-16);
  }
}
</style>
