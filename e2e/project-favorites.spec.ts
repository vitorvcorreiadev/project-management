import { expect, test } from '@playwright/test'
import { buildProject, seedProjects } from './fixtures/projects.js'
import {
  favoriteStar,
  favoritedFilter,
  projectCard,
  projectCards,
  projectCount,
  projectsEmptyState,
  projectsTitle,
} from './fixtures/locators.js'

const twoProjects = () => [
  buildProject({ id: 1, title: 'Projeto 1' }),
  buildProject({ id: 2, title: 'Projeto 2' }),
]

test.describe('project favorites', () => {
  test('toggles the favorited status from the star of a card', async ({ page }) => {
    await seedProjects(page, twoProjects())
    await page.goto('/')

    const star = favoriteStar(projectCard(page, 'Projeto 1'))

    await expect(star).toHaveAttribute('aria-pressed', 'false')
    await star.click()
    await expect(star).toHaveAttribute('aria-pressed', 'true')
    await expect(favoriteStar(projectCard(page, 'Projeto 2'))).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    await star.click()
    await expect(star).toHaveAttribute('aria-pressed', 'false')
  })

  test('keeps the favorited status after reloading the page', async ({ page }) => {
    await seedProjects(page, twoProjects())
    await page.goto('/')

    await favoriteStar(projectCard(page, 'Projeto 1')).click()
    await expect(favoriteStar(projectCard(page, 'Projeto 1'))).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await page.reload()

    await expect(favoriteStar(projectCard(page, 'Projeto 1'))).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(favoritedFilter(page)).not.toBeChecked()
  })

  test('lists only the favorited projects when the favorited filter is on', async ({ page }) => {
    await seedProjects(page, twoProjects())
    await page.goto('/')

    await favoriteStar(projectCard(page, 'Projeto 1')).click()

    const filter = favoritedFilter(page)
    await expect(filter).not.toBeChecked()

    await filter.click()

    await expect(filter).toBeChecked()
    await expect(projectCards(page)).toHaveCount(1)
    await expect(projectCard(page, 'Projeto 1')).toBeVisible()
    await expect(projectCount(page)).toHaveText('(1)')

    await filter.click()

    await expect(filter).not.toBeChecked()
    await expect(projectCards(page)).toHaveCount(2)
    await expect(projectCount(page)).toHaveText('(2)')
  })

  test('shows an empty list without the empty state when the filter is on and nothing is favorited', async ({
    page,
  }) => {
    await seedProjects(page, twoProjects())
    await page.goto('/')

    const filter = favoritedFilter(page)
    await filter.click()

    await expect(filter).toBeChecked()
    await expect(projectsTitle(page)).toBeVisible()
    await expect(projectCount(page)).toHaveText('(0)')
    await expect(projectCards(page)).toHaveCount(0)
    await expect(projectsEmptyState(page)).toHaveCount(0)
  })
})
