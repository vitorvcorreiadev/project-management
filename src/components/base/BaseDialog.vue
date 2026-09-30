<script setup lang="ts">
import { onMounted, useId, useTemplateRef, watch } from 'vue'
import { useClickOutside } from '@/composables/useClickOutside'

defineProps<{ title: string }>()

const open = defineModel<boolean>('open', { default: false })

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const panelRef = useTemplateRef<HTMLDivElement>('panel')
const titleId = useId()

function syncDialog() {
  const dialog = dialogRef.value!

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
        <h3 :id="titleId" class="dialog-title">{{ title }}</h3>

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
@layer components {
  .dialog {
    border: none;
    padding: 0;
    background: none;
    max-inline-size: none;
    max-block-size: none;
    inline-size: min(48rem, calc(100vw - var(--space-7)));
    overflow: visible;
    word-break: break-all;

    &::backdrop {
      background-color: var(--color-backdrop);
      backdrop-filter: blur(1rem);
    }

    .dialog-panel {
      display: flex;
      flex-direction: column;
      max-block-size: calc(100dvh - var(--space-7));
      background-color: var(--color-white);
      border-radius: var(--radius-2);
      box-shadow: var(--shadow-default);
      padding-inline: var(--space-6);
      padding-block-end: var(--space-5);

      .dialog-icon {
        --dialog-icon-size: 6.4rem;
        --dialog-icon-offset: calc(var(--dialog-icon-size) / -2);

        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: var(--dialog-icon-size);
        block-size: var(--dialog-icon-size);
        margin-inline: auto;
        margin-block-start: var(--dialog-icon-offset);
        border-radius: var(--radius-full);
        background-color: var(--color-purple-500);
        color: var(--color-white);
      }

      .dialog-body {
        display: flex;
        flex-direction: column;
        min-block-size: 0;
        padding-block-start: var(--space-4);
        overflow-y: auto;

        .dialog-title {
          font-weight: var(--font-weight-semibold);
          color: var(--color-purple-800);
          text-align: center;
          padding-block-end: var(--space-5);
        }

        .dialog-content {
          color: var(--color-gray-400);
          font-size: var(--font-size-sm);
          line-height: var(--line-height-xl);
          text-align: center;
          border-top: 1px solid var(--color-gray-300);
          padding-top: 3.4rem;
        }

        .dialog-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          padding-block-start: var(--space-6);
        }
      }
    }
  }
}
</style>
