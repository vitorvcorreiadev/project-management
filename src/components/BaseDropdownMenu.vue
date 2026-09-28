<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useClickOutside } from '@/composables/useClickOutside'
import type { DropdownItem } from '@/types/dropdown'

defineProps<{
  items: DropdownItem[]
  ariaLabel: string
}>()

const emit = defineEmits<{ select: [item: DropdownItem] }>()

const menuRef = ref<HTMLDetailsElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)

function close(returnFocus = false) {
  if (!menuRef.value?.open) return

  menuRef.value.open = false

  if (returnFocus) triggerRef.value?.focus()
}

function onSelect(item: DropdownItem) {
  close(true)

  emit('select', item)
}

/*
 * Escape is watched on the document rather than on the menu itself: opening with
 * a pointer leaves focus on the body, so a keydown bound to the menu would never
 * see the key. `close` ignores the press while the menu is shut, which is what
 * keeps the listener from stealing focus on every stray Escape.
 */
function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return

  close(true)
}

useClickOutside(menuRef, () => close())

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <details ref="menuRef" class="dropdown-menu">
    <summary
      ref="triggerRef"
      class="dropdown-menu-trigger button secondary medium"
      :aria-label="ariaLabel"
    >
      <slot />
    </summary>

    <ul v-if="items.length > 0" class="dropdown-menu-panel">
      <li v-for="item in items" :key="item.id">
        <button type="button" class="dropdown-menu-item" @click="onSelect(item)">
          <component :is="item.icon" v-if="item.icon" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </button>
      </li>
    </ul>
  </details>
</template>

<style lang="css" scoped>
.dropdown-menu {
  position: relative;
  display: inline-block;

  .dropdown-menu-trigger {
    padding: var(--space-2);
    border-radius: var(--radius-full);
    max-width: 32px;
    width: 32px;
    height: 32px;
    box-shadow: var(--shadow-default);
    list-style: none;
    border: none;

    &::-webkit-details-marker {
      display: none;
    }
  }

  .dropdown-menu-panel {
    position: absolute;
    inset-block-start: calc(100% + var(--space-2));
    inset-inline-end: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    background-color: var(--color-white);
    border-radius: var(--radius-3);
    box-shadow: var(--shadow-default);
    width: 240px;

    &::before {
      content: '';
      position: absolute;
      inset-block-start: -4px;
      inset-inline-end: var(--space-3);
      inline-size: var(--space-2);
      block-size: var(--space-2);
      background-color: var(--color-white);
      transform: rotate(45deg);
    }

    li {
      &:not(:last-child) {
        border-bottom: 1px solid var(--color-purple-50);
      }

      .dropdown-menu-item {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        inline-size: 100%;
        padding: var(--space-3);
        color: var(--color-purple-500);
        font-size: var(--font-size-16);
        line-height: var(--line-height-normal);
        cursor: pointer;

        &:focus-visible {
          outline: var(--button-focus-ring-width) solid var(--button-accent);
          outline-offset: calc(-1 * var(--button-focus-ring-width));
        }
      }
    }
  }
}
</style>
