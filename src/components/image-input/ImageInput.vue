<script setup lang="ts">
import { computed, shallowRef, useTemplateRef } from 'vue'

import ImageInputPicker from './ImageInputPicker.vue'
import ImageInputPreview from './ImageInputPreview.vue'
import { useObjectUrl } from '@/composables/useObjectUrl'
import { ACCEPT_ATTRIBUTE, isAcceptedImage } from '@/utils/images'

const INVALID_FORMAT_MESSAGE = 'Formato inválido. Escolha um arquivo .jpg ou .png.'

const cover = defineModel<File | null>({ default: null })

const props = defineProps<{ existing?: string | null }>()

const emit = defineEmits<{ removeExisting: [] }>()

const inputRef = useTemplateRef<HTMLInputElement>('input')
const errorMessage = shallowRef<string | null>(null)

// Only the pick gets an object URL from here; `existing` was minted by whoever
// resolved it and is shown as-is.
const pickedUrl = useObjectUrl(() => cover.value)

const preview = computed<{ src: string; alt: string } | null>(() => {
  const src = pickedUrl.value ?? props.existing

  if (!src) return null

  return {
    src,
    alt: cover.value
      ? `Pré-visualização de ${cover.value.name}`
      : 'Pré-visualização da capa do projeto',
  }
})

const statusText = computed(() => (cover.value ? `Imagem ${cover.value.name} selecionada.` : ''))

function openFileDialog(): void {
  inputRef.value?.click()
}

function onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  // Cleared up front so picking the same file twice still fires a change.
  input.value = ''

  if (!file) return

  if (!isAcceptedImage(file)) {
    cover.value = null
    errorMessage.value = INVALID_FORMAT_MESSAGE
    return
  }

  errorMessage.value = null
  cover.value = file
}

function removeCover(): void {
  errorMessage.value = null

  // The pick and the stored cover are two different things the parent owns:
  // dropping the pick is a model change, but discarding a cover that lives on
  // disk is the parent's decision, since only it knows how to apply that when
  // the form is saved.
  if (cover.value) {
    cover.value = null
    return
  }

  emit('removeExisting')
}
</script>

<template>
  <div class="image-input" :class="{ 'has-preview': preview }">
    <input
      ref="input"
      type="file"
      :accept="ACCEPT_ATTRIBUTE"
      class="visually-hidden"
      tabindex="-1"
      aria-hidden="true"
      @change="onFileChange"
    />

    <ImageInputPreview v-if="preview" :src="preview.src" :alt="preview.alt" @remove="removeCover" />

    <ImageInputPicker v-else @select="openFileDialog" />

    <p v-if="errorMessage" class="image-input-error" role="alert">{{ errorMessage }}</p>

    <p class="visually-hidden" role="status">{{ statusText }}</p>
  </div>
</template>

<style lang="css" scoped>
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
}

.image-input.has-preview {
  border-style: solid;
  border-color: var(--color-gray-100);
  padding-block: 0;
  min-height: 20rem;
}

.image-input-error {
  color: var(--color-red-500);
  padding: var(--space-2) 0 0;
}
</style>
