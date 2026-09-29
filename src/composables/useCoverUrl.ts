import { onScopeDispose, ref, type Ref } from 'vue'
import { getCover, toBlob } from '@/db/covers'
import type { Project } from '@/types/project'

/**
 * Resolves a project's cover to an object URL, or `null` when there is nothing to
 * show so the caller can fall back to a placeholder.
 *
 * The read is async, so the URL arrives after the first render. `onScopeDispose`
 * can fire while that read is still in flight, which would leak the URL created
 * moments later — hence the `disposed` guard.
 *
 * Resolution happens once: nothing watches the project, so a later change to
 * `hasCover` does not reload. Callers re-run this on mount, which is what a
 * freshly listed set of projects and a form returning to the listing both do.
 */
export function useCoverUrl(project: Pick<Project, 'id' | 'hasCover'>): Ref<string | null> {
  const url = ref<string | null>(null)

  let objectUrl: string | null = null
  let disposed = false

  function release(): void {
    if (!objectUrl) return

    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }

  async function load(): Promise<void> {
    const { id, hasCover } = project

    release()
    url.value = null

    if (!hasCover) return

    const record = await getCover(id)

    if (disposed || !record) return

    objectUrl = URL.createObjectURL(toBlob(record))
    url.value = objectUrl
  }

  void load()

  onScopeDispose(() => {
    disposed = true
    release()
  })

  return url
}
