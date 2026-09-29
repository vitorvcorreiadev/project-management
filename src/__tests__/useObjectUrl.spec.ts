import { describe, it, expect, beforeEach, vi } from 'vitest'
import { effectScope, nextTick, shallowRef } from 'vue'

import { useObjectUrl } from '../composables/useObjectUrl'

const createObjectURL = vi.fn<(blob: Blob) => string>()
const revokeObjectURL = vi.fn<(url: string) => void>()

let minted = 0

/*
 * The composable exists to hand a template a plain string for `<img src>`, so
 * the URL's lifetime is the whole contract: one URL per source value, the
 * previous one revoked before the next is minted, and a revoke on teardown. A
 * revoked URL still renders fine until something re-reads it, so a leak here
 * shows up as a tab that quietly holds every cover ever picked — which is why
 * the "source was never set" case matters as much as the happy one.
 *
 * jsdom implements no `URL.createObjectURL`, hence the counter stub: a unique
 * url per call is what lets these assertions tell a revoked url from a live one.
 */
describe('useObjectUrl', () => {
  function buildFile(name = 'capa.png'): File {
    return new File(['bytes'], name, { type: 'image/png' })
  }

  function run(source: () => File | null) {
    const scope = effectScope()
    const url = scope.run(() => useObjectUrl(source))!

    return { scope, url }
  }

  beforeEach(() => {
    minted = 0
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()

    createObjectURL.mockImplementation(() => `blob:minted-${++minted}`)
    revokeObjectURL.mockImplementation(() => {})

    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
  })

  it('mints a url for the blob it is handed', () => {
    const blob = buildFile()
    const { url } = run(() => blob)

    expect(url.value).toBe('blob:minted-1')
    expect(createObjectURL).toHaveBeenCalledWith(blob)
  })

  it('mints nothing while the source is empty', () => {
    const { url } = run(() => null)

    expect(url.value).toBeNull()
    expect(createObjectURL).not.toHaveBeenCalled()
  })

  it('revokes the previous url before minting the next one', async () => {
    const source = shallowRef<File | null>(buildFile('antiga.png'))
    const { url } = run(() => source.value)

    expect(url.value).toBe('blob:minted-1')

    source.value = buildFile('nova.png')
    await nextTick()

    expect(url.value).toBe('blob:minted-2')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:minted-1')
    expect(revokeObjectURL).not.toHaveBeenCalledWith('blob:minted-2')
  })

  it('drops the url when the source goes back to empty', async () => {
    const source = shallowRef<File | null>(buildFile())
    const { url } = run(() => source.value)

    source.value = null
    await nextTick()

    expect(url.value).toBeNull()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:minted-1')
  })

  it('revokes the url when the owning scope goes away', () => {
    const { scope, url } = run(() => buildFile())

    expect(url.value).toBe('blob:minted-1')

    scope.stop()

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:minted-1')
    expect(url.value).toBeNull()
  })

  it('revokes nothing for a source that never held a blob', () => {
    const { scope } = run(() => null)

    scope.stop()

    expect(revokeObjectURL).not.toHaveBeenCalled()
  })
})
