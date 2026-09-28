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
  projectCount,
  projectEndAtInput,
  projectFieldError,
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

async function gotoEditProject(page: Page, id = SEEDED.id): Promise<void> {
  await seedProjects(page, [SEEDED, OTHER])
  await page.goto(`/projects/${id}/edit`)
  await expect(editProjectTitle(page)).toBeVisible()
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
  test('fills the form with the project behind the id', async ({ page }) => {
    await gotoEditProject(page)

    await expect(projectNameInput(page)).toHaveValue(SEEDED.name)
    await expect(projectStartedAtInput(page)).toHaveValue(SEEDED.started_at)
    await expect(projectEndAtInput(page)).toHaveValue(SEEDED.end_at)
  })

  test('saves the edits over the same project and returns to the listing', async ({ page }) => {
    await gotoEditProject(page)

    await projectNameInput(page).fill('Projeto editável renomeado')
    await projectSaveButton(page).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(projectCard(page, 'Projeto editável renomeado')).toBeVisible()
    await expect(projectCount(page)).toHaveText('(2)')
  })

  test('does not add a project to the listing', async ({ page }) => {
    await gotoEditProject(page)

    await projectNameInput(page).fill('Projeto editável renomeado')
    await projectSaveButton(page).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('article')).toHaveCount(2)
  })

  test('leaves the other projects alone', async ({ page }) => {
    await gotoEditProject(page)

    await projectNameInput(page).fill('Projeto editável renomeado')
    await projectSaveButton(page).click()

    await expect(projectCard(page, OTHER.name)).toBeVisible()
  })

  test('keeps the edited project favorited', async ({ page }) => {
    await seedProjects(page, [{ ...SEEDED, favorited: true }, OTHER])

    await page.goto(`/projects/${SEEDED.id}/edit`)
    await projectNameInput(page).fill('Projeto editável renomeado')
    await projectSaveButton(page).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('.favorite-star[aria-pressed="true"]')).toHaveCount(1)
  })

  test('refuses an edit that breaks the shared rules', async ({ page }) => {
    await gotoEditProject(page)

    await projectNameInput(page).fill('X')
    await projectSaveButton(page).click()

    await expect(projectFieldError(page, 'name')).toBeVisible()
    await expect(page).toHaveURL(/\/edit$/)
  })

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

  test('opens with the cover the project already has', async ({ page }) => {
    await gotoEditWithCover(page)

    await expect(projectCoverPreview(page)).toHaveAttribute('src', /^blob:/)
    await expect(projectCoverRemoveButton(page)).toBeVisible()
  })

  test('shows no cover for a project that never had one', async ({ page }) => {
    await gotoEditProject(page)

    await expect(projectCoverPreview(page)).toHaveCount(0)
    await expect(projectCoverRemoveButton(page)).toHaveCount(0)
  })

  test('swaps the cover for a new image when one is chosen', async ({ page }) => {
    await gotoEditWithCover(page)
    await expect(projectCoverPreview(page)).toHaveAttribute('src', /^blob:/)

    const stored = await projectCoverPreview(page).getAttribute('src')

    await projectCoverInput(page).setInputFiles({
      name: 'outra-capa.png',
      mimeType: 'image/png',
      buffer: COVER_PNG,
    })

    // A new object url is minted for the pick, so the preview cannot still be
    // pointing at the bytes that were already on the project.
    await expect(projectCoverPreview(page)).not.toHaveAttribute('src', stored ?? '')

    await projectSaveButton(page).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(projectCard(page, WITH_COVER.name).locator('img')).toHaveAttribute(
      'src',
      /^blob:/,
    )
  })

  test('drops the cover for good when it is removed and saved', async ({ page }) => {
    await gotoEditWithCover(page)
    await expect(projectCoverPreview(page)).toHaveAttribute('src', /^blob:/)

    await projectCoverRemoveButton(page).click()

    await expect(projectCoverPreview(page)).toHaveCount(0)

    await projectSaveButton(page).click()

    await expect(page).toHaveURL(/\/$/)
    // Back on the listing the card falls back to the bundled placeholder, which
    // is the proof that the bytes are gone rather than merely hidden.
    await expect(projectCard(page, WITH_COVER.name).locator('img')).not.toHaveAttribute(
      'src',
      /^blob:/,
    )
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
