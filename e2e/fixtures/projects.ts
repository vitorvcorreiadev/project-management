import type { Page } from '@playwright/test'
import type { Project } from '../../src/types/project.js'

const PROJECTS_STORAGE_KEY = 'projects'
const SEARCH_HISTORY_STORAGE_KEY = 'searchHistory'

export function buildProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    name: 'Projeto 1',
    client: 'Clicksign',
    started_at: '2026-01-27',
    end_at: '2026-06-30',
    favorited: false,
    hasCover: false,
    ...overrides,
  }
}

export async function seedProjects(page: Page, projects: Project[]): Promise<void> {
  const payload = JSON.stringify({ projects })
  const args: [string, string] = [PROJECTS_STORAGE_KEY, payload]

  await page.addInitScript(([key, value]) => {
    if (window.localStorage.getItem(key) === null) {
      window.localStorage.setItem(key, value)
    }
  }, args)
}

/*
 * `terms` is given oldest first, the order the searches would have been made in, and
 * reversed here. The store keeps the array newest first, and seeding writes the
 * array straight past `record`, so without the reversal the fixture would store the
 * list backwards and every expectation would read inverted. Terms have to be at
 * least three characters long or `record` would have dropped them.
 */
export async function seedSearchHistory(page: Page, terms: string[]): Promise<void> {
  const payload = JSON.stringify({ terms: [...terms].reverse() })
  const args: [string, string] = [SEARCH_HISTORY_STORAGE_KEY, payload]

  await page.addInitScript(([key, value]) => {
    if (window.localStorage.getItem(key) === null) {
      window.localStorage.setItem(key, value)
    }
  }, args)
}
