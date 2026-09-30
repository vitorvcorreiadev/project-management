import { expect, test } from '@playwright/test'
import { buildProject, seedProjects } from './fixtures/projects.js'
import {
  favoritedFilter,
  projectCards,
  projectCount,
  projectsEmptyState,
  projectsTitle,
} from './fixtures/locators.js'

const twoProjects = () => [
  buildProject({ id: 1, name: 'Projeto 1' }),
  buildProject({ id: 2, name: 'Projeto 2' }),
]

test.describe('project favorites', () => {
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
