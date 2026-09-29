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
    /* The load-bearing declaration. `.search-box` is not positioned, so this
     * absolutely positioned div resolves against `header`, which has no z-index and
     * so no stacking context of its own. A z-index here therefore competes in the
     * root context, where it beats the `position: relative` card bits in `main`
     * that come later in DOM order. */
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
        font-size: var(--font-size-18);
        line-height: var(--line-height-snug);
        padding: var(--space-6) 7.4rem;
        outline: 0;
      }
    }

    /* `.search-box > div` is the nearest positioned ancestor — the panel is a
     * sibling of `.input-wrapper`, not a child of it — so 100% is the bottom of
     * the input. */
    .search-history {
      position: absolute;
      inset-block-start: 100%;
      inset-inline: 0;
    }
  }
}
</style>
