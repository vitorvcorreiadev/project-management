<script setup lang="ts">
import SearchIcon from '@/assets/images/SearchIcon.vue'
import SearchHistoryPanel from '@/components/SearchHistoryPanel.vue'
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
  visibleTerms,
  panelOpen,
  listboxId,
  activeIndex,
  activeId,
  moveActive,
  pickActiveTerm,
  selectHistoryTerm,
  removeHistoryTerm,
} = useSearchBox()
</script>

<template>
  <div class="search-box">
    <button ref="buttonRef" @click="openSearch" v-if="!opened" aria-label="Buscar projetos">
      <SearchIcon aria-hidden="true" />
    </button>

    <div v-else ref="searchBoxRef">
      <div class="input-wrapper">
        <SearchIcon aria-hidden="true" />

        <input
          id="search_by_name"
          role="combobox"
          aria-label="Buscar projeto pelo nome"
          placeholder="Digite o nome do projeto..."
          ref="inputRef"
          autocomplete="off"
          aria-autocomplete="list"
          :aria-expanded="panelOpen"
          :aria-controls="panelOpen ? listboxId : undefined"
          :aria-activedescendant="activeId"
          @input="handleSearch"
          @keydown.esc="cancelSearch"
          @keydown.down.prevent="moveActive(1)"
          @keydown.up.prevent="moveActive(-1)"
          @keydown.enter.prevent="pickActiveTerm"
          :value="filters.term"
        />
      </div>

      <SearchHistoryPanel
        v-if="panelOpen"
        :listbox-id="listboxId"
        :items="visibleTerms"
        :term="filters.term"
        :active-index="activeIndex"
        @select="selectHistoryTerm"
        @remove="removeHistoryTerm"
      />
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
    z-index: 1;

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
        font-size: var(--font-size-md);
        line-height: var(--line-height-xl);
        padding: var(--space-6) 7.4rem;
        outline: 0;
        border: 2px solid transparent;
      }

      &:has(~ .search-history) {
        input {
          border: 2px solid var(--color-purple-500);
          border-bottom: 0;
        }
      }
    }

    .search-history {
      position: absolute;
      inset-block-start: 100%;
      inset-inline: 0;
    }
  }
}
</style>
