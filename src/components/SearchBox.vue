<script setup lang="ts">
import { nextTick, ref } from 'vue'
import SearchIcon from '@/assets/images/SearchIcon.vue'
import { useClickOutside } from '@/composables/useClickOutside'

const searchBoxRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLElement | null>(null)

const opened = ref(false)

async function openSearch() {
  opened.value = true
  await nextTick()
  inputRef.value?.focus()
}

function closeSearch() {
  opened.value = false
}

useClickOutside(searchBoxRef, () => closeSearch(), [buttonRef])
</script>

<template>
  <div class="search-box">
    <button ref="buttonRef" @click="openSearch" v-if="!opened">
      <SearchIcon />
    </button>

    <div v-else ref="searchBoxRef">
      <div class="input-wrapper">
        <SearchIcon />

        <input
          id="search_by_name"
          type="search"
          placeholder="Digite o nome do projeto..."
          ref="inputRef"
        />
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.search-box {
  > button {
    color: white;
  }

  > div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    .input-wrapper {
      position: relative;

      svg {
        position: absolute;
        color: var(--color-purple-500);
        left: var(--space-6);
        top: var(--space-6);
      }

      input {
        width: 100%;
        border: none;
        font-size: var(--font-size-18);
        line-height: var(--line-height-snug);
        padding: var(--space-6) 7.4rem;
        outline: 0;
      }
    }
  }
}
</style>
