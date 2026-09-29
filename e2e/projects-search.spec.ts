import { expect, test } from '@playwright/test'
import { buildProject, seedProjects } from './fixtures/projects.js'
import {
  editProjectTitle,
  favoriteStar,
  favoritedFilter,
  newProjectButton,
  newProjectTitle,
  projectCard,
  projectCards,
  projectCount,
  projectsEmptyState,
  projectsTitle,
  searchInput,
  searchResultTitle,
  searchToggle,
  chooseSorting,
  sortCombobox,
} from './fixtures/locators.js'

const searchableProjects = () => [
  buildProject({
    id: 1,
    name: 'Projeto Beta',
    started_at: '2024-03-01T14:30:00.000Z',
    end_at: '2026-12-01T14:30:00.000Z',
  }),
  buildProject({
    id: 2,
    name: 'Projeto Alpha',
    started_at: '2026-01-15T14:30:00.000Z',
    end_at: '2025-06-01T14:30:00.000Z',
  }),
  buildProject({
    id: 3,
    name: 'Projeto Gamma',
    started_at: '2025-07-20T14:30:00.000Z',
    end_at: '2024-05-01T14:30:00.000Z',
  }),
]

test.describe('projects search', () => {
  test('opens the search input focused from the header button', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await page.goto('/')

    await expect(searchInput(page)).toHaveCount(0)

    await searchToggle(page).click()

    await expect(searchInput(page)).toBeVisible()
    await expect(searchInput(page)).toBeFocused()
    await expect(searchInput(page)).toHaveValue('')
    await expect(searchToggle(page)).toHaveCount(0)
  })

  test('searches the projects by name when the term has at least three characters', async ({
    page,
  }) => {
    await seedProjects(page, searchableProjects())
    await page.goto('/')

    await searchToggle(page).click()
    await searchInput(page).fill('Al')

    await expect(page).toHaveURL('/')
    await expect(projectCards(page)).toHaveCount(3)

    await searchInput(page).fill('Alp')

    await expect(page).toHaveURL('/search')
    await expect(searchResultTitle(page)).toBeVisible()
    await expect(projectCards(page)).toHaveCount(1)
    await expect(projectCard(page, 'Projeto Alpha')).toBeVisible()
    await expect(projectsTitle(page)).toHaveCount(0)
  })

  test('searches the projects ignoring the case of the term', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await page.goto('/')

    await searchToggle(page).click()
    await searchInput(page).fill('aLP')

    await expect(page).toHaveURL('/search')
    await expect(projectCards(page)).toHaveCount(1)
    await expect(projectCard(page, 'Projeto Alpha')).toBeVisible()
  })

  test('lists no project and no empty state when the term matches nothing', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await page.goto('/')

    await searchToggle(page).click()
    await searchInput(page).fill('Zzz')

    await expect(page).toHaveURL('/search')
    await expect(searchResultTitle(page)).toBeVisible()
    await expect(projectCards(page)).toHaveCount(0)
    await expect(projectsEmptyState(page)).toHaveCount(0)
    await expect(projectCount(page)).toHaveCount(0)
  })

  test('returns to the projects listing when the term has less than three characters', async ({
    page,
  }) => {
    await seedProjects(page, searchableProjects())
    await page.goto('/')

    await searchToggle(page).click()
    await searchInput(page).fill('Alp')

    await expect(page).toHaveURL('/search')
    await expect(projectCards(page)).toHaveCount(1)

    await searchInput(page).fill('Al')

    await expect(page).toHaveURL('/')
    await expect(searchResultTitle(page)).toHaveCount(0)
    await expect(projectsTitle(page)).toBeVisible()
    await expect(projectCards(page)).toHaveCount(3)
  })

  test('clears the term and closes the search input when pressing escape', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await page.goto('/')

    await searchToggle(page).click()
    await searchInput(page).fill('Alp')

    await expect(page).toHaveURL('/search')

    await searchInput(page).press('Escape')

    await expect(page).toHaveURL('/')
    await expect(searchInput(page)).toHaveCount(0)
    await expect(searchToggle(page)).toBeVisible()
    await expect(searchToggle(page)).toBeFocused()
    await expect(projectCards(page)).toHaveCount(3)

    await searchToggle(page).click()

    await expect(searchInput(page)).toHaveValue('')
  })

  test('closes the search input when clicking outside of it keeping the term', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await page.goto('/')

    await searchToggle(page).click()
    await searchInput(page).fill('Alp')

    await expect(page).toHaveURL('/search')
    await expect(projectCards(page)).toHaveCount(1)

    await projectCard(page, 'Projeto Alpha').getByRole('heading', { level: 2 }).click()

    await expect(searchInput(page)).toHaveCount(0)
    await expect(searchToggle(page)).toBeVisible()
    await expect(page).toHaveURL('/search')
    await expect(projectCards(page)).toHaveCount(1)

    await searchToggle(page).click()

    await expect(searchInput(page)).toHaveValue('Alp')
  })

  test('does not apply the favorited filter nor the sorting on the search result', async ({
    page,
  }) => {
    await seedProjects(page, searchableProjects())
    await page.goto('/')

    await favoriteStar(projectCard(page, 'Projeto Beta')).click()
    await favoritedFilter(page).click()

    await expect(projectCards(page)).toHaveCount(1)
    await expect(projectCard(page, 'Projeto Beta')).toBeVisible()

    await chooseSorting(page, 'Iniciados mais recentes')

    await searchToggle(page).click()
    await searchInput(page).fill('Pro')

    await expect(page).toHaveURL('/search')
    await expect(sortCombobox(page)).toHaveCount(0)
    await expect(favoritedFilter(page)).toHaveCount(0)
    await expect(projectCards(page)).toHaveCount(3)
    await expect(projectCard(page, 'Projeto Alpha')).toBeVisible()
    await expect(projectCard(page, 'Projeto Beta')).toBeVisible()
    await expect(projectCard(page, 'Projeto Gamma')).toBeVisible()
  })

  test('hides the search on the project form pages only', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await page.goto('/')

    await expect(searchToggle(page)).toBeVisible()

    // Clicking through keeps the header mounted, so this covers the search
    // reacting to the route rather than just rendering the right initial state.
    await newProjectButton(page).click()

    await expect(newProjectTitle(page)).toBeVisible()
    await expect(searchToggle(page)).toHaveCount(0)

    await page.goto('/projects/1/edit')

    await expect(editProjectTitle(page)).toBeVisible()
    await expect(searchToggle(page)).toHaveCount(0)

    await page.goto('/')

    await expect(searchToggle(page)).toBeVisible()
  })
})
