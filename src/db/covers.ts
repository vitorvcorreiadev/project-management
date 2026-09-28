import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

const DB_NAME = 'project-management'
const DB_VERSION = 1
const COVER_STORE = 'covers'

/**
 * The image is kept as raw bytes plus the metadata a `File` would have carried,
 * never as a `File` itself. Two reasons: a `File` only reaches us by structured
 * clone, and not every IndexedDB implementation performs one — several clone it
 * to `{}`, which would silently destroy the cover. Bytes and strings clone
 * everywhere, and rebuilding a `Blob` from them costs one line.
 */
export interface CoverRecord {
  projectId: number
  name: string
  type: string
  size: number
  bytes: ArrayBuffer
  savedAt: number
}

interface ProjectCoversDB extends DBSchema {
  covers: {
    key: number
    value: CoverRecord
  }
}

let dbPromise: Promise<IDBPDatabase<ProjectCoversDB>> | null = null

function getDb(): Promise<IDBPDatabase<ProjectCoversDB>> {
  dbPromise ??= openDB<ProjectCoversDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (db.objectStoreNames.contains(COVER_STORE)) return

      db.createObjectStore(COVER_STORE)
    },
  })

  return dbPromise
}

export async function saveCover(projectId: number, file: File): Promise<CoverRecord> {
  const record: CoverRecord = {
    projectId,
    name: file.name,
    type: file.type,
    size: file.size,
    bytes: await file.arrayBuffer(),
    savedAt: Date.now(),
  }

  await (await getDb()).put(COVER_STORE, record, projectId)

  return record
}

export async function getCover(projectId: number): Promise<CoverRecord | undefined> {
  return (await getDb()).get(COVER_STORE, projectId)
}

export async function deleteCover(projectId: number): Promise<void> {
  await (await getDb()).delete(COVER_STORE, projectId)
}

export function toBlob(record: CoverRecord): Blob {
  return new Blob([record.bytes], { type: record.type })
}
