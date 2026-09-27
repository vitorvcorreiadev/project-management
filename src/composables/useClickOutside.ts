import { onMounted, onUnmounted, type Ref } from 'vue'

type MaybeElement = HTMLElement | null | undefined

export function useClickOutside(
  target: Ref<MaybeElement>,
  callback: (event: PointerEvent) => void,
  ignore: Ref<MaybeElement>[] = [],
): void {
  function handler(event: PointerEvent): void {
    const el = target.value
    const clickedNode = event.target as Node

    if (!el || el.contains(clickedNode)) return

    const clickedIgnored = ignore.some((ref) => ref.value && ref.value.contains(clickedNode))
    if (clickedIgnored) return

    callback(event)
  }

  onMounted(() => {
    document.addEventListener('pointerdown', handler, { passive: true })
  })

  onUnmounted(() => {
    document.removeEventListener('pointerdown', handler)
  })
}
