<script setup lang="ts">
import BaseButton from '@/components/BaseButton.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import TrashIcon from '@/assets/images/TrashIcon.vue'

defineProps<{ projectName: string }>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{ confirm: [] }>()
</script>

<template>
  <BaseDialog v-model:open="open" title="Remover projeto">
    <template #icon>
      <TrashIcon aria-hidden="true" />
    </template>

    <p>Essa ação removerá definitivamente o projeto:</p>
    <span>{{ projectName }}</span>

    <template #actions>
      <BaseButton variant="secondary" @click="open = false">Cancelar</BaseButton>
      <BaseButton @click="emit('confirm')">Confirmar</BaseButton>
    </template>
  </BaseDialog>
</template>
