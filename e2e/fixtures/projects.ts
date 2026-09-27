import type { Page } from '@playwright/test'
import type { Project } from '../../src/types/project.js'

const PROJECTS_STORAGE_KEY = 'projects'

export function buildProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    title: 'Projeto 1',
    client: 'Clicksign',
    started_at: '01 de setembro de 2024',
    ended_at: '12 de dezembro de 2024',
    favorited: false,
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
