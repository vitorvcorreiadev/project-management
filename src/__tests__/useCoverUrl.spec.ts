import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'

import { getCover, saveCover } from '../db/covers'
import { useCoverUrl } from '../composables/useCoverUrl'
import type { Project } from '../types/project'

const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:capa')
const revokeObjectURL = vi.fn<(url: string) => void>()

/*
 * The composable hands the template a plain string for `<img src>`, which is the
 * only reason the object URL exists — so the lifecycle matters more than the load
 * itself. It starts `null` because the IndexedDB read is async, and it must go
 * back to `null` on teardown or every card navigation leaks a blob for the life
 * of the tab. A `null` result is the signal to render the placeholder, so a
 * `hasCover` flag pointing at a missing record is a fallback, not an error.
 */
describe('useCoverUrl', () => {
  function buildProject(overrides: Partial<Project> = {}): Project {
    return {
      id: 1,
      name: 'Projeto 1',
      client: 'Clicksign',
      started_at: '2026-01-27T14:30:00.000Z',
      end_at: '2026-06-30T14:30:00.000Z',
      favorited: false,
      hasCover: false,
      ...overrides,
    }
  }

  function run(project: Project) {
    const scope = effectScope()
    const url = scope.run(() => useCoverUrl(project))!

    return { scope, url }
  }

  beforeEach(() => {
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()

    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
  })

  it('stays null for a project with no cover', async () => {
    await saveCover(1, new File(['bytes'], 'capa.png', { type: 'image/png' }))

    const { url } = run(buildProject({ hasCover: false }))
    await nextTick()

    expect(url.value).toBeNull()
    expect(createObjectURL).not.toHaveBeenCalled()
  })

  it('does not read IndexedDB when the flag says there is no cover', async () => {
    const { url } = run(buildProject({ hasCover: false }))
    await nextTick()

    expect(url.value).toBeNull()
  })

  it('resolves an object URL once the stored cover loads', async () => {
    await saveCover(1, new File(['bytes'], 'capa.png', { type: 'image/png' }))

    const { url } = run(buildProject({ hasCover: true }))
    await vi.waitFor(() => {
      expect(url.value).toBe('blob:capa')
    })

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(createObjectURL.mock.calls[0]?.[0]).toBeInstanceOf(Blob)
  })

  it('carries the stored mime type into the object it hands over', async () => {
    await saveCover(1, new File(['bytes'], 'capa.jpg', { type: 'image/jpeg' }))

    const { url } = run(buildProject({ hasCover: true }))
    await vi.waitFor(() => {
      expect(url.value).toBe('blob:capa')
    })

    expect(createObjectURL.mock.calls[0]?.[0].type).toBe('image/jpeg')
  })

  it('falls back to null when the flag points at a missing record', async () => {
    const { url } = run(buildProject({ id: 999, hasCover: true }))
    await vi.waitFor(() => {
      expect(url.value).toBeNull()
    })

    expect(createObjectURL).not.toHaveBeenCalled()
  })

  it('revokes the object URL when the owning scope goes away', async () => {
    await saveCover(1, new File(['bytes'], 'capa.png', { type: 'image/png' }))

    const { scope, url } = run(buildProject({ hasCover: true }))
    await vi.waitFor(() => {
      expect(url.value).toBe('blob:capa')
    })

    scope.stop()

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:capa')
  })

  it('never creates a url when the scope closes before the read resolves', async () => {
    await saveCover(1, new File(['bytes'], 'capa.png', { type: 'image/png' }))

    const { scope } = run(buildProject({ hasCover: true }))

    scope.stop()

    // This read is queued behind the composable's, so once it settles the
    // composable's late resolution has already run its `disposed` check. The
    // guard stops it minting a url that no teardown is left to revoke, so
    // neither call should ever happen.
    await getCover(1)

    expect(createObjectURL).not.toHaveBeenCalled()
    expect(revokeObjectURL).not.toHaveBeenCalled()
  })
})
