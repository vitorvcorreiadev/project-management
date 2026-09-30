import { expect, test, type Page } from '@playwright/test'
import { seedProjects } from './fixtures/projects.js'
import {
  newProjectTitle,
  projectCard,
  projectClientInput,
  projectCoverInput,
  projectEndAtInput,
  projectNameInput,
  projectSaveButton,
  projectStartedAtInput,
} from './fixtures/locators.js'

const VALID = {
  name: 'Projeto do form',
  client: 'Clicksign',
  started_at: '2026-09-01',
  end_at: '2026-12-15',
}

async function gotoNewProject(page: Page): Promise<void> {
  await seedProjects(page, [])
  await page.goto('/projects/new')
  await expect(newProjectTitle(page)).toBeVisible()
}

async function fillProjectForm(page: Page): Promise<void> {
  await projectNameInput(page).fill(VALID.name)
  await projectClientInput(page).fill(VALID.client)
  await projectStartedAtInput(page).fill(VALID.started_at)
  await projectEndAtInput(page).fill(VALID.end_at)
}

test.describe('new project', () => {
  test('refuses a file that is not an image', async ({ page }) => {
    await gotoNewProject(page)

    await projectCoverInput(page).setInputFiles({
      name: 'notas.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('nao sou uma imagem'),
    })

    await expect(page.getByRole('alert')).toHaveText(
      'Formato inválido. Escolha um arquivo .jpg ou .png.',
    )

    await fillProjectForm(page)
    await projectSaveButton(page).click()

    const card = projectCard(page, VALID.name)

    await expect(card).toBeVisible()
    await expect(card.locator('img')).not.toHaveAttribute('src', /^blob:/)
  })
})
