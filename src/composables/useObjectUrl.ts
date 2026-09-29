import {
  onScopeDispose,
  readonly,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

/**
 * Exposes an object URL for `blob`, re-minting it whenever `blob` changes and
 * revoking the previous one first.
 *
 * Ownership is deliberately narrow: this only ever revokes URLs it created
 * itself. A URL that arrived from somewhere else — a project's cover already
 * resolved and stored by `useCoverUrl`, for instance — is displayed but never
 * touched here, because whoever minted it is the one that has to release it.
 *
 * `onScopeDispose` rather than `onUnmounted`, so the URL is also released when
 * the owning effect scope is stopped before the component goes away.
 */
export function useObjectUrl(blob: MaybeRefOrGetter<Blob | null>): Readonly<Ref<string | null>> {
  const url = shallowRef<string | null>(null)

  let objectUrl: string | null = null

  function release(): void {
    if (!objectUrl) return

    URL.revokeObjectURL(objectUrl)
    objectUrl = null
    url.value = null
  }

  watch(
    () => toValue(blob),
    (value) => {
      release()

      if (!value) return

      objectUrl = URL.createObjectURL(value)
      url.value = objectUrl
    },
    { immediate: true },
  )

  onScopeDispose(release)

  return readonly(url)
}
