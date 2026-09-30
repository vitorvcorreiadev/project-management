import { expect, test, type Page } from '@playwright/test'
import { COVER_PNG } from './fixtures/cover.js'
import { buildProject, seedProjects } from './fixtures/projects.js'
import {
  backButton,
  editProjectTitle,
  newProjectTitle,
  projectCard,
  projectClientInput,
  projectCoverInput,
  projectCoverPreview,
  projectCoverRemoveButton,
  projectEndAtInput,
  projectNameInput,
  projectSaveButton,
  projectStartedAtInput,
  projectsTitle,
} from './fixtures/locators.js'

const SEEDED = buildProject({
  id: 42,
  name: 'Projeto editável',
  client: 'Clicksign',
  started_at: '2026-01-27',
  end_at: '2026-06-30',
})

const OTHER = buildProject({ id: 7, name: 'Projeto vizinho' })

const WITH_COVER = {
  name: 'Projeto com capa',
  client: 'Clicksign',
  started_at: '2026-01-27',
  end_at: '2026-06-30',
}

/*
 * A cover only exists once it has been through the real picker, so the edit
 * tests build one through the create page instead of seeding IndexedDB by hand.
 * That keeps the whole trip in play: upload, save, reopen, and only then edit.
 */
async function createProjectWithCover(page: Page): Promise<number> {
  await seedProjects(page, [])
  await page.goto('/projects/new')
  await expect(newProjectTitle(page)).toBeVisible()

  await projectCoverInput(page).setInputFiles({
    name: 'capa.png',
    mimeType: 'image/png',
    buffer: COVER_PNG,
  })

  await projectNameInput(page).fill(WITH_COVER.name)
  await projectClientInput(page).fill(WITH_COVER.client)
  await projectStartedAtInput(page).fill(WITH_COVER.started_at)
  await projectEndAtInput(page).fill(WITH_COVER.end_at)
  await projectSaveButton(page).click()
  await expect(page).toHaveURL(/\/$/)

  const id = await page.evaluate(() => {
    const stored = window.localStorage.getItem('projects')
    const parsed = stored ? (JSON.parse(stored) as { projects?: { id: number }[] }) : null

    return parsed?.projects?.[0]?.id
  })

  if (id === undefined) throw new Error('the project just created is not in the store')

  return id
}

async function gotoEditWithCover(page: Page): Promise<number> {
  const id = await createProjectWithCover(page)

  await page.goto(`/projects/${id}/edit`)
  await expect(editProjectTitle(page)).toBeVisible()

  return id
}

test.describe('edit project', () => {
  test('sends an unknown id back to the listing', async ({ page }) => {
    await seedProjects(page, [SEEDED, OTHER])

    await page.goto('/projects/999/edit')

    await expect(page).toHaveURL(/\/$/)
    await expect(projectsTitle(page)).toBeVisible()
  })

  test('sends a non-numeric id back to the listing', async ({ page }) => {
    await seedProjects(page, [SEEDED, OTHER])

    await page.goto('/projects/abc/edit')

    await expect(page).toHaveURL(/\/$/)
    await expect(projectsTitle(page)).toBeVisible()
  })

  test('keeps the cover when the removal is abandoned', async ({ page }) => {
    await gotoEditWithCover(page)
    await expect(projectCoverPreview(page)).toHaveAttribute('src', /^blob:/)

    await projectCoverRemoveButton(page).click()
    await expect(projectCoverPreview(page)).toHaveCount(0)

    await backButton(page).click()

    await expect(projectsTitle(page)).toBeVisible()
    await expect(projectCard(page, WITH_COVER.name).locator('img')).toHaveAttribute(
      'src',
      /^blob:/,
    )
  })
})
