<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import UploadLight from '@/assets/images/UploadLight.vue'

const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <div class="image-input-picker">
    <UploadLight aria-hidden="true" />

    <p class="image-input-picker-hint">Escolha uma imagem .jpg ou .png no seu dispositivo</p>

    <BaseButton variant="secondary" type="button" @click="emit('select')">
      <span>Selecionar</span>
    </BaseButton>
  </div>
</template>

<style lang="css" scoped>
.image-input-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-input-picker-hint {
  padding: var(--space-4) 0 var(--space-5);
}
</style>
