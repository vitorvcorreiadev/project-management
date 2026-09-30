<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import BaseDialog from '@/components/base/BaseDialog.vue'
import TrashIcon from '@/icons/TrashIcon.vue'

defineProps<{ projectName: string }>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{ confirm: [] }>()
</script>

<template>
  <BaseDialog v-model:open="open" title="Remover projeto">
    <template #icon>
      <TrashIcon />
    </template>

    <div class="remove-info">
      <p>Essa ação removerá definitivamente o projeto:</p>
      <span>{{ projectName }}</span>
    </div>

    <template #actions>
      <BaseButton variant="secondary" @click="open = false" size="large" full>Cancelar</BaseButton>
      <BaseButton @click="emit('confirm')" size="large" full>Confirmar</BaseButton>
    </template>
  </BaseDialog>
</template>

<style lang="css" scoped>
<<<<<<< HEAD
@layer components {
  .remove-info {
    p {
      margin-bottom: var(--space-3);
    }

    span {
      color: var(--color-purple-950);
      font-size: var(--font-size-2xl);
      line-height: var(--line-height-2xl);
      font-weight: var(--font-weight-medium);
    }
=======
.remove-info {
  p {
    margin-bottom: var(--space-3);
  }

  span {
    color: var(--color-purple-950);
    font-size: var(--font-size-2xl);
    line-height: var(--line-height-2xl);
    font-weight: var(--font-weight-medium);
>>>>>>> d950bf003af40be1c761463fb068149b3fbc77ac
  }
}
</style>
