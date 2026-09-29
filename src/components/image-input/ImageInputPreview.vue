<script setup lang="ts">
import BaseButton from '@/components/BaseButton.vue'
import TrashIcon from '@/assets/images/TrashIcon.vue'

defineProps<{ src: string; alt: string }>()

const emit = defineEmits<{ remove: [] }>()
</script>

<template>
  <div class="image-input-preview">
    <img class="image-input-preview-image" :src="src" :alt="alt" />

    <BaseButton
      variant="secondary"
      type="button"
      class="image-input-preview-remove"
      aria-label="Remover imagem"
      @click="emit('remove')"
    >
      <TrashIcon aria-hidden="true" />
    </BaseButton>
  </div>
</template>

<style lang="css" scoped>
.image-input-preview {
  /* Owns its own box: the container reserves the height, this grows into it and
     stays the positioning context for the remove control, so the two never
     depend on the container's layout to line up. */
  flex: 1;
  align-self: stretch;
  position: relative;
  display: flex;
}

.image-input-preview-image {
  align-self: stretch;
  width: 100%;
  max-height: 800px;
  object-fit: cover;
}

.image-input-preview-remove {
  position: absolute;
  top: var(--space-3);
  inset-inline-end: var(--space-3);
  padding: 0;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  box-shadow: var(--shadow-default);
}
</style>
