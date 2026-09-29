import { computed, onScopeDispose, readonly, shallowRef, useId, watch, type Ref } from 'vue'

import type { ComboboxOption } from '@/types/combobox'

const TYPE_AHEAD_RESET_MS = 500
const PAGE_JUMP = 10

type OptionElements = readonly (HTMLElement | null | undefined)[]

interface UseComboboxOptions {
  model: Ref<string>
  options: () => readonly ComboboxOption[]
  optionElements: () => OptionElements
}

/*
 * Drives the APG select-only combobox: DOM focus never leaves the trigger, so
 * the option under the pointer of the keyboard lives in `activeIndex` and is
 * handed to assistive tech through `aria-activedescendant`. Only a commit moves
 * the value, and the popup keeps its scroll in step with `activeIndex` because
 * `aria-activedescendant` does not scroll anything by itself.
 */
export function useCombobox({ model, options, optionElements }: UseComboboxOptions) {
  const uid = useId()
  const listboxId = `${uid}-listbox`

  const isOpen = shallowRef(false)
  const activeIndex = shallowRef(0)

  const lastIndex = computed(() => options().length - 1)
  const selectedIndex = computed(() =>
    options().findIndex((option) => option.value === model.value),
  )
  const activeDescendant = computed(() => {
    if (!isOpen.value || lastIndex.value < 0) return undefined

    return optionId(activeIndex.value)
  })

  function optionId(index: number): string {
    return `${uid}-option-${index}`
  }

  function isActive(index: number): boolean {
    return isOpen.value && index === activeIndex.value
  }

  function isSelected(index: number): boolean {
    return index === selectedIndex.value
  }

  let search = ''
  let searchTimer: ReturnType<typeof setTimeout> | undefined

  function clearSearch(): void {
    clearTimeout(searchTimer)
    search = ''
  }

  function typeAhead(char: string): void {
    clearTimeout(searchTimer)

    const first = char.toLowerCase()

    search += first
    searchTimer = setTimeout(clearSearch, TYPE_AHEAD_RESET_MS)

    // Typing the same letter again cycles through the options starting with it,
    // while a mixed sequence keeps narrowing the term.
    const repeated = [...search].every((typed) => typed === first)
    const term = repeated ? first : search
    const list = options()
    const start = (repeated ? activeIndex.value + 1 : activeIndex.value) % list.length

    for (let offset = 0; offset < list.length; offset++) {
      const index = (start + offset) % list.length
      const option = list[index]

      if (option?.label.toLowerCase().startsWith(term)) {
        activeIndex.value = index
        return
      }
    }
  }

  function moveTo(index: number): void {
    activeIndex.value = Math.min(Math.max(index, 0), Math.max(lastIndex.value, 0))
  }

  function openMenu(index?: number): void {
    if (lastIndex.value < 0) return

    activeIndex.value = index ?? Math.max(selectedIndex.value, 0)
    isOpen.value = true
  }

  function closeMenu(): void {
    isOpen.value = false
    clearSearch()
  }

  function toggleMenu(): void {
    if (isOpen.value) {
      closeMenu()
      return
    }

    openMenu()
  }

  function commitActive(): void {
    const option = options()[activeIndex.value]

    if (!option) return

    model.value = option.value
  }

  function selectAndClose(): void {
    commitActive()
    closeMenu()
  }

  function onKeydown(event: KeyboardEvent): void {
    const { key } = event

    if (!isOpen.value) {
      switch (key) {
        case 'ArrowDown':
        case 'Enter':
        case ' ':
          event.preventDefault()
          return openMenu()
        case 'ArrowUp':
        case 'Home':
          event.preventDefault()
          return openMenu(0)
        case 'End':
          event.preventDefault()
          return openMenu(lastIndex.value)
      }

      if (isPrintable(event)) {
        event.preventDefault()
        openMenu()
        typeAhead(key)
      }

      return
    }

    switch (key) {
      case 'ArrowDown':
        event.preventDefault()
        return moveTo(activeIndex.value + 1)
      case 'ArrowUp':
        event.preventDefault()
        return event.altKey ? selectAndClose() : moveTo(activeIndex.value - 1)
      case 'Home':
        event.preventDefault()
        return moveTo(0)
      case 'End':
        event.preventDefault()
        return moveTo(lastIndex.value)
      case 'PageUp':
        event.preventDefault()
        return moveTo(activeIndex.value - PAGE_JUMP)
      case 'PageDown':
        event.preventDefault()
        return moveTo(activeIndex.value + PAGE_JUMP)
      case 'Enter':
      case ' ':
        event.preventDefault()
        return selectAndClose()
      case 'Escape':
        event.preventDefault()
        return closeMenu()
      case 'Tab':
        return selectAndClose()
    }

    if (isPrintable(event)) {
      event.preventDefault()
      typeAhead(key)
    }
  }

  function onOptionClick(index: number): void {
    activeIndex.value = index
    selectAndClose()
  }

  function onBlur(): void {
    if (isOpen.value) selectAndClose()
  }

  watch(
    [activeIndex, isOpen],
    () => optionElements()[activeIndex.value]?.scrollIntoView({ block: 'nearest' }),
    { flush: 'post' },
  )

  onScopeDispose(clearSearch)

  return {
    isOpen: readonly(isOpen),
    activeIndex: readonly(activeIndex),
    selectedIndex,
    activeDescendant,
    listboxId,
    optionId,
    isActive,
    isSelected,
    toggleMenu,
    onKeydown,
    onOptionClick,
    onBlur,
  }
}

function isPrintable(event: KeyboardEvent): boolean {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey
}
