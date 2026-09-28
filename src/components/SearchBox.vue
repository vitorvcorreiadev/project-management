<script setup lang="ts">
import SearchIcon from '@/assets/images/SearchIcon.vue'
import useSearchBox from '@/composables/useSearchBox'

const {
  handleSearch,
  searchBoxRef,
  cancelSearch,
  openSearch,
  buttonRef,
  inputRef,
  opened,
  filters,
} = useSearchBox()
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
          placeholder="Digite o nome do projeto..."
          ref="inputRef"
          @input="handleSearch"
          @keydown.esc="cancelSearch"
          :value="filters.term"
          autocomplete="off"
        />
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.search-box {
  > button {
    color: white;
    cursor: pointer;
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
