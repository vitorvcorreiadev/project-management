<script setup lang="ts">
import { computed, onUnmounted, ref, useId, watch } from 'vue'
import UploadLight from '@/assets/images/UploadLight.vue'
import TrashIcon from '@/assets/images/TrashIcon.vue'
import BaseButton from './BaseButton.vue'

const cover = defineModel<File | null>({ default: null })

const inputRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const inputId = useId()
const hintId = useId()

const hasPreview = computed(() => previewUrl.value !== null)

const statusText = computed(() => (cover.value ? `Imagem ${cover.value.name} selecionada.` : ''))

function openFileDialog(): void {
  inputRef.value?.click()
}

function onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  input.value = ''

  if (!file) return

  if (!file.type.startsWith('image/')) {
    cover.value = null
    errorMessage.value = 'Formato inválido. Escolha um arquivo .jpg ou .png.'
    return
  }

  errorMessage.value = null
  cover.value = file
}

function removeCover(): void {
  cover.value = null
  errorMessage.value = null
}

function releasePreview(): void {
  if (!previewUrl.value) return
  URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
}

watch(cover, (file) => {
  releasePreview()
  previewUrl.value = file ? URL.createObjectURL(file) : null
})

onUnmounted(releasePreview)
</script>

<template>
  <div class="image-input" :class="{ 'has-preview': hasPreview }">
    <input
      :id="inputId"
      ref="inputRef"
      type="file"
      accept="image/jpeg,image/png"
      class="visually-hidden"
      tabindex="-1"
      aria-hidden="true"
      @change="onFileChange"
    />

    <template v-if="hasPreview">
      <img :src="previewUrl ?? undefined" :alt="`Pré-visualização de ${cover?.name}`" />

      <BaseButton
        variant="secondary"
        type="button"
        class="remove"
        aria-label="Remover imagem"
        @click="removeCover"
      >
        <TrashIcon aria-hidden="true" />
      </BaseButton>
    </template>

    <template v-else>
      <UploadLight aria-hidden="true" />
      <p :id="hintId">Escolha uma imagem .jpg ou .png no seu dispositivo</p>

      <BaseButton variant="secondary" type="button" @click="openFileDialog">
        Selecionar
      </BaseButton>
    </template>

    <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <p class="visually-hidden" role="status">{{ statusText }}</p>
  </div>
</template>

<style lang="css" scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.image-input {
  position: relative;
  border: 1px dashed var(--color-gray-400);
  border-radius: var(--radius-2);
  padding-block: var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--color-gray-400);
  overflow: hidden;

  p {
    padding: var(--space-4) 0 var(--space-5);
  }

  &.has-preview {
    border-style: solid;
    border-color: var(--color-gray-100);
    padding-block: 0;
    min-height: 20rem;

    img {
      width: 100%;
      height: 100%;
      max-height: 800px;
      object-fit: cover;
    }
  }

  .remove {
    position: absolute;
    top: var(--space-3);
    inset-inline-end: var(--space-3);
    z-index: 1;
    padding: var(--space-2);
    border-radius: 50%;
    box-shadow: var(--shadow-2);
  }

  .error {
    color: var(--color-red-500);
    padding: var(--space-2) 0 0;
  }
}
</style>
