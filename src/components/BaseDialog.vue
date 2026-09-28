<script setup lang="ts">
import { onMounted, useId, useTemplateRef, watch } from 'vue'
import { useClickOutside } from '@/composables/useClickOutside'

defineProps<{ title: string }>()

const open = defineModel<boolean>('open', { default: false })

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const panelRef = useTemplateRef<HTMLDivElement>('panel')
const titleId = useId()

function syncDialog() {
  const dialog = dialogRef.value

  if (!dialog) return

  if (open.value && !dialog.open) {
    dialog.showModal()
  } else if (!open.value && dialog.open) {
    dialog.close()
  }
}

watch(open, syncDialog, { flush: 'post' })

onMounted(syncDialog)

useClickOutside(panelRef, () => {
  open.value = false
})

defineSlots<{
  default(): unknown
  icon(): unknown
  actions(): unknown
}>()
</script>

<template>
  <dialog ref="dialog" class="dialog" :aria-labelledby="titleId" @close="open = false">
    <div ref="panel" class="dialog-panel">
      <div v-if="$slots.icon" class="dialog-icon">
        <slot name="icon" />
      </div>

      <div class="dialog-body">
        <h2 :id="titleId" class="dialog-title">{{ title }}</h2>
        <hr class="dialog-divider" />

        <div class="dialog-content">
          <slot />
        </div>

        <div v-if="$slots.actions" class="dialog-actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </dialog>
</template>

<style lang="css" scoped>
.dialog {
  border: none;
  padding: 0;
  background: none;
  max-inline-size: none;
  max-block-size: none;
  inline-size: min(var(--dialog-inline-size), calc(100vw - var(--space-7)));
  overflow: visible;

  &::backdrop {
    background-color: var(--dialog-backdrop-bg);
    backdrop-filter: blur(var(--dialog-backdrop-blur));
  }
}

.dialog-panel {
  display: flex;
  flex-direction: column;
  max-block-size: var(--dialog-max-block-size);
  background-color: var(--dialog-bg);
  border-radius: var(--dialog-radius);
  box-shadow: var(--shadow-default);
  padding-inline: var(--dialog-padding-inline);
  padding-block-end: var(--dialog-padding-block);
}

.dialog-icon {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--dialog-icon-size);
  block-size: var(--dialog-icon-size);
  margin-inline: auto;
  margin-block-start: var(--dialog-icon-offset);
  border-radius: var(--radius-full);
  background-color: var(--dialog-icon-bg);
  color: var(--dialog-icon-color);
}

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-block-size: 0;
  padding-block-start: var(--dialog-body-padding-block-start);
  overflow-y: auto;
}

.dialog-title {
  font-size: var(--dialog-title-font-size);
  line-height: var(--dialog-title-line-height);
  font-weight: var(--dialog-title-font-weight);
  color: var(--dialog-title-color);
  text-align: center;
}

.dialog-divider {
  border: 0;
  border-block-start: 1px solid var(--dialog-divider-color);
}

.dialog-content {
  color: var(--dialog-content-color);
  font-size: var(--dialog-content-font-size);
  line-height: var(--dialog-content-line-height);
  text-align: center;
}

.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding-block-start: var(--space-2);
}
</style>
