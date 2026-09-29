import { onScopeDispose, ref, type Ref } from 'vue'
import { getCachedCoverUrl, getCover, setCachedCoverUrl, toBlob } from '@/db/covers'
import type { Project } from '@/types/project'

export function useCoverUrl(project: Pick<Project, 'id' | 'hasCover'>): Ref<string | null> {
  const url = ref<string | null>(null)
  let disposed = false

  async function load(): Promise<void> {
    const { id, hasCover } = project

    url.value = null

    if (!hasCover) return

    const cached = getCachedCoverUrl(id)
    if (cached) {
      url.value = cached
      return
    }

    const record = await getCover(id)

    if (disposed || !record) return

    const objectUrl = URL.createObjectURL(toBlob(record))
    setCachedCoverUrl(id, objectUrl)
    url.value = objectUrl
  }

  void load()

  onScopeDispose(() => {
    disposed = true
  })

  return url
}
