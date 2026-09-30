import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'

import { deleteCover, getCover, saveCover, toBlob } from '../covers'

/*
 * Covers live in IndexedDB because the alternative — a `File` on the persisted
 * store — is JSON-serialized into `{}` by `pinia-plugin-persistedstate`. The
 * store keeps only a `hasCover` flag and the bytes live here, keyed by project
 * id, so there is exactly one cover per project and no lookup by anything else.
 *
 * jsdom ships no IndexedDB, hence the `fake-indexeddb/auto` import above, which
 * installs an in-memory implementation on globalThis. That backing store lives
 * for the whole file, so every test overwrites the id it exercises instead of
 * assuming an empty database. It also clones into a separate realm, which is why
 * assertions decode the bytes rather than reaching for `instanceof`.
 */
describe('covers', () => {
  function buildFile(name: string, type = 'image/png', contents = 'cover-bytes'): File {
    return new File([contents], name, { type })
  }

  function readBytes(record: { bytes: ArrayBuffer } | undefined): string {
    if (!record) return ''

    return new TextDecoder().decode(new Uint8Array(record.bytes))
  }

  beforeEach(async () => {
    await saveCover(1, buildFile('seed.png'))
  })

  it('returns undefined for a project that has no cover', async () => {
    await expect(getCover(404)).resolves.toBeUndefined()
  })

  it('round trips the image bytes through a save and a read', async () => {
    await saveCover(42, buildFile('projeto-1.png'))

    const record = await getCover(42)

    expect(readBytes(record)).toBe('cover-bytes')
  })

  it('preserves the name, type and size the file arrived with', async () => {
    const file = buildFile('capa.jpg', 'image/jpeg', 'twelve-chars')
    await saveCover(42, file)

    const record = await getCover(42)

    expect(record?.name).toBe('capa.jpg')
    expect(record?.type).toBe('image/jpeg')
    expect(record?.size).toBe(file.size)
  })

  it('stores the project id both as the key and inside the record', async () => {
    await saveCover(7, buildFile('sete.png'))

    const record = await getCover(7)

    expect(record?.projectId).toBe(7)
  })

  it('replaces the previous cover when the same project is saved again', async () => {
    await saveCover(1, buildFile('antiga.png'))
    await saveCover(1, buildFile('nova.png', 'image/png', 'bytes-novos'))

    const record = await getCover(1)

    expect(record?.name).toBe('nova.png')
    expect(readBytes(record)).toBe('bytes-novos')
  })

  it('keeps covers of different projects independent', async () => {
    await saveCover(2, buildFile('dois.png', 'image/png', 'bytes-dois'))

    await expect(getCover(1)).resolves.toMatchObject({ projectId: 1, name: 'seed.png' })
    await expect(getCover(2)).resolves.toMatchObject({ projectId: 2, name: 'dois.png' })
  })

  it('rebuilds a blob carrying the stored bytes and mime type', async () => {
    await saveCover(9, buildFile('original.png', 'image/png', 'a'.repeat(64)))

    const record = await getCover(9)
    const blob = record ? toBlob(record) : null

    expect(blob?.type).toBe('image/png')
    expect(blob?.size).toBe(64)
  })

  it('does not degrade the image into an empty husk', async () => {
    await saveCover(9, buildFile('original.png', 'image/png', 'a'.repeat(64)))

    const record = await getCover(9)

    expect(record?.bytes.byteLength).toBe(64)
    expect(record?.bytes.byteLength).not.toBe(0)
  })

  it('drops the record when a cover is deleted', async () => {
    await deleteCover(1)

    await expect(getCover(1)).resolves.toBeUndefined()
  })

  it('leaves every other project alone when one cover is deleted', async () => {
    await saveCover(2, buildFile('dois.png', 'image/png', 'bytes-dois'))

    await deleteCover(1)

    await expect(getCover(2)).resolves.toMatchObject({ projectId: 2, name: 'dois.png' })
  })

  it('treats deleting a cover that is not there as nothing to do', async () => {
    await expect(deleteCover(404)).resolves.toBeUndefined()
    await expect(getCover(1)).resolves.toMatchObject({ name: 'seed.png' })
  })
})
