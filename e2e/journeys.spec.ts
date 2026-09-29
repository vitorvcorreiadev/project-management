import { expect, test } from '@playwright/test'
import { buildProject, seedProjects } from './fixtures/projects.js'
import {
  cardActionsTrigger,
  cardMenuItem,
  editProjectTitle,
  favoriteStar,
  favoritedFilter,
  newProjectButton,
  newProjectTitle,
  projectCard,
  projectCards,
  projectClientInput,
  projectCount,
  projectEndAtInput,
  projectNameInput,
  projectNameHighlight,
  projectNames,
  projectSaveButton,
  projectStartedAtInput,
  projectsEmptyState,
  projectsEmptyStateTitle,
  projectsTitle,
  removeProjectCancel,
  removeProjectConfirm,
  removeProjectDialog,
  removeProjectTitle,
  removeProjectWarning,
  searchBackButton,
  searchInput,
  searchResultTitle,
  searchToggle,
  sortCombobox,
  chooseSorting,
} from './fixtures/locators.js'

const journeyProjects = () => [
  buildProject({
    id: 1,
    name: 'Projeto Alpha',
    started_at: '2026-01-15',
    end_at: '2025-06-01',
    favorited: true,
  }),
  buildProject({
    id: 2,
    name: 'Projeto Beta',
    started_at: '2024-03-01',
    end_at: '2026-12-01',
    favorited: true,
  }),
  buildProject({
    id: 3,
    name: 'Projeto Gamma',
    started_at: '2025-07-20',
    end_at: '2024-05-01',
    favorited: false,
  }),
]

const unfavoritedProjects = () =>
  journeyProjects().map((project) => ({ ...project, favorited: false }))

const TARGET = 'Projeto Beta'
const RENAMED = 'Projeto Renomeado'

const NEW_PROJECT = {
  name: 'Projeto Jornada',
  client: 'Clicksign',
  started_at: '2026-09-01',
  end_at: '2026-12-15',
}

test.describe('create project', () => {
  test('a user creates a project from the empty state and it survives a reload', async ({
    page,
  }) => {
    await test.step('opens / with no projects and sees the empty state message', async () => {
      await seedProjects(page, [])
      await page.goto('/')

      await expect(projectsEmptyState(page)).toBeVisible()
      await expect(projectsEmptyStateTitle(page)).toBeVisible()
      await expect(projectsEmptyState(page)).toContainText(
        'Clique no botão abaixo para criar o primeiro e gerenciá-lo.',
      )
    })

    await test.step('clicks create project and the search box is gone', async () => {
      await newProjectButton(page).click()

      await expect(page).toHaveURL(/\/projects\/new$/)
      await expect(newProjectTitle(page)).toBeVisible()
      // There are no projects at all, so the box would be hidden on `/` too. This
      // only corroborates the route rule; the edit journey is the decisive one.
      await expect(searchToggle(page)).toHaveCount(0)
    })

    await test.step('fills the form and saves', async () => {
      await projectNameInput(page).fill(NEW_PROJECT.name)
      await projectClientInput(page).fill(NEW_PROJECT.client)
      await projectStartedAtInput(page).fill(NEW_PROJECT.started_at)
      await projectEndAtInput(page).fill(NEW_PROJECT.end_at)

      await projectSaveButton(page).click()
    })

    await test.step('is sent back to the listing, which now holds the new project', async () => {
      const card = projectCard(page, NEW_PROJECT.name)

      await expect(page).toHaveURL(/\/$/)
      await expect(projectCount(page)).toHaveText('(1)')
      await expect(card).toContainText('Cliente: Clicksign')
      await expect(card).toContainText('01 de setembro de 2026')
      await expect(card).toContainText('15 de dezembro de 2026')
      await expect(projectsEmptyState(page)).toHaveCount(0)
    })

    await test.step('reloads the page and still has the same state', async () => {
      await page.reload()

      await expect(projectsTitle(page)).toBeVisible()
      await expect(projectCount(page)).toHaveText('(1)')
      await expect(projectCard(page, NEW_PROJECT.name)).toBeVisible()
    })
  })
})

test.describe('view projects', () => {
  test('a user sees every project with its client and its dates in the listing', async ({
    page,
  }) => {
    await test.step('opens / with projects and sees the listing', async () => {
      await seedProjects(page, journeyProjects())
      await page.goto('/')

      await expect(projectsTitle(page)).toBeVisible()
      await expect(projectCount(page)).toHaveText('(3)')
      await expect(projectsEmptyState(page)).toHaveCount(0)
    })

    await test.step('every project is a card with its name, its client and its dates', async () => {
      const card = projectCard(page, 'Projeto Alpha')

      await expect(projectCards(page)).toHaveCount(3)
      await expect(card.getByRole('heading', { level: 2, name: 'Projeto Alpha' })).toBeVisible()
      await expect(card).toContainText('Cliente: Clicksign')
      await expect(card).toContainText('15 de janeiro de 2026')
      await expect(card).toContainText('01 de junho de 2025')
    })
  })
})

test.describe('edit project', () => {
  test('a user edits a project from the card menu and the change survives a reload', async ({
    page,
  }) => {
    await test.step('opens / with projects and sees the listing', async () => {
      await seedProjects(page, journeyProjects())
      await page.goto('/')

      await expect(projectCount(page)).toHaveText('(3)')
      await expect(searchToggle(page)).toBeVisible()
    })

    await test.step('opens the card menu, picks edit, and the search box is gone', async () => {
      await cardActionsTrigger(page, TARGET).click()
      await cardMenuItem(projectCard(page, TARGET), 'Editar').click()

      await expect(page).toHaveURL(/\/projects\/\d+\/edit$/)
      await expect(editProjectTitle(page)).toBeVisible()
      // The listing above was showing the search box, so it is the route meta
      // that took it away here.
      await expect(searchToggle(page)).toHaveCount(0)
    })

    await test.step('the form opens filled with the project behind the id', async () => {
      await expect(projectNameInput(page)).toHaveValue(TARGET)
      await expect(projectClientInput(page)).toHaveValue('Clicksign')
    })

    await test.step('edits the project and saves', async () => {
      await projectNameInput(page).fill(RENAMED)

      await projectSaveButton(page).click()
    })

    await test.step('is sent back to the listing with the edit and the search box is back', async () => {
      await expect(page).toHaveURL(/\/$/)
      await expect(projectCount(page)).toHaveText('(3)')
      await expect(projectCard(page, RENAMED)).toBeVisible()
      await expect(projectCard(page, TARGET)).toHaveCount(0)
      await expect(searchToggle(page)).toBeVisible()
    })

    await test.step('reloads the page and still has the same state', async () => {
      await page.reload()

      await expect(projectCount(page)).toHaveText('(3)')
      await expect(projectCard(page, RENAMED)).toContainText('Cliente: Clicksign')
    })
  })
})

test.describe('favorite project', () => {
  test('a user favorites and unfavorites a project and both states survive a reload', async ({
    page,
  }) => {
    await test.step('opens / with projects and sees the listing', async () => {
      await seedProjects(page, unfavoritedProjects())
      await page.goto('/')

      await expect(projectCount(page)).toHaveText('(3)')
      await expect(favoriteStar(projectCard(page, TARGET))).toHaveAttribute('aria-pressed', 'false')
    })

    await test.step('clicks the favorite button and the project is favorited', async () => {
      await favoriteStar(projectCard(page, TARGET)).click()

      await expect(favoriteStar(projectCard(page, TARGET))).toHaveAttribute('aria-pressed', 'true')
      await expect(favoriteStar(projectCard(page, 'Projeto Gamma'))).toHaveAttribute(
        'aria-pressed',
        'false',
      )
      await expect(projectCount(page)).toHaveText('(3)')
    })

    await test.step('reloads the page and the project is still favorited', async () => {
      await page.reload()

      await expect(favoriteStar(projectCard(page, TARGET))).toHaveAttribute('aria-pressed', 'true')
    })

    await test.step('clicks the favorite button again and the project is unfavorited', async () => {
      await favoriteStar(projectCard(page, TARGET)).click()

      await expect(favoriteStar(projectCard(page, TARGET))).toHaveAttribute('aria-pressed', 'false')
    })

    await test.step('reloads the page and the project is still not favorited', async () => {
      await page.reload()

      await expect(projectsTitle(page)).toBeVisible()
      await expect(projectCount(page)).toHaveText('(3)')
      await expect(favoriteStar(projectCard(page, TARGET))).toHaveAttribute('aria-pressed', 'false')
    })
  })
})

test.describe('delete project', () => {
  test('a user deletes a project and it stays deleted after a reload', async ({ page }) => {
    await test.step('opens / with projects and sees the listing', async () => {
      await seedProjects(page, journeyProjects())
      await page.goto('/')

      await expect(projectCount(page)).toHaveText('(3)')
    })

    await test.step('opens the card menu and picks remove', async () => {
      await cardActionsTrigger(page, TARGET).click()
      await cardMenuItem(projectCard(page, TARGET), 'Remover').click()

      // Removing is a dialog, not a route: the listing is still the page behind it.
      await expect(page).toHaveURL(/\/$/)
    })

    await test.step('the dialog asks for a confirmation and names the project', async () => {
      const card = projectCard(page, TARGET)

      await expect(removeProjectDialog(card)).toBeVisible()
      await expect(removeProjectTitle(card)).toBeVisible()
      await expect(removeProjectWarning(card)).toContainText(
        'Essa ação removerá definitivamente o projeto',
      )
      await expect(removeProjectWarning(card)).toContainText(TARGET)
    })

    await test.step('confirms the deletion and the listing no longer holds the project', async () => {
      await removeProjectConfirm(projectCard(page, TARGET)).click()

      await expect(projectCount(page)).toHaveText('(2)')
      await expect(projectCard(page, TARGET)).toHaveCount(0)
      await expect(projectNames(page)).toHaveText(['Projeto Alpha', 'Projeto Gamma'])
    })

    await test.step('reloads the page and the project is still gone', async () => {
      await page.reload()

      await expect(projectCount(page)).toHaveText('(2)')
      await expect(projectCard(page, TARGET)).toHaveCount(0)
    })
  })
})

test.describe('cancel a project deletion', () => {
  test('a user cancels a project deletion and the project stays', async ({ page }) => {
    await test.step('opens / with projects and sees the listing', async () => {
      await seedProjects(page, journeyProjects())
      await page.goto('/')

      await expect(projectCount(page)).toHaveText('(3)')
    })

    await test.step('opens the card menu and picks remove', async () => {
      await cardActionsTrigger(page, TARGET).click()
      await cardMenuItem(projectCard(page, TARGET), 'Remover').click()

      await expect(removeProjectDialog(projectCard(page, TARGET))).toBeVisible()
    })

    await test.step('cancels the deletion in the dialog', async () => {
      await removeProjectCancel(projectCard(page, TARGET)).click()
    })

    await test.step('the dialog closes and the listing is untouched', async () => {
      // A closed <dialog> is display:none, so it drops out of every role query and
      // only a scoped locator can still point at it.
      await expect(removeProjectDialog(projectCard(page, TARGET))).toBeHidden()

      await expect(page).toHaveURL(/\/$/)
      await expect(projectsTitle(page)).toBeVisible()
      await expect(projectCount(page)).toHaveText('(3)')
      await expect(projectCard(page, TARGET)).toBeVisible()
    })
  })
})

test.describe('sort and filter projects', () => {
  test('a user filters by favorites and sorts the listing by every option', async ({ page }) => {
    await test.step('opens / with projects and sees the listing', async () => {
      await seedProjects(page, journeyProjects())
      await page.goto('/')

      await expect(projectCount(page)).toHaveText('(3)')
      await expect(sortCombobox(page)).toHaveText('Ordem alfabética')
    })

    await test.step('turns the favorited filter on and only the favorites are left', async () => {
      await favoritedFilter(page).click()

      await expect(favoritedFilter(page)).toBeChecked()
      await expect(projectCount(page)).toHaveText('(2)')
      await expect(projectNames(page)).toHaveText(['Projeto Alpha', 'Projeto Beta'])
      await expect(projectCard(page, 'Projeto Gamma')).toHaveCount(0)
    })

    await test.step('turns the favorited filter off and the initial state is back', async () => {
      await favoritedFilter(page).click()

      await expect(favoritedFilter(page)).not.toBeChecked()
      await expect(projectCount(page)).toHaveText('(3)')
      await expect(projectNames(page)).toHaveText([
        'Projeto Alpha',
        'Projeto Beta',
        'Projeto Gamma',
      ])
    })

    await test.step('picks each sorting and the list is ordered accordingly', async () => {
      await chooseSorting(page, 'Iniciados mais recentes')
      await expect(projectNames(page)).toHaveText([
        'Projeto Alpha',
        'Projeto Gamma',
        'Projeto Beta',
      ])

      await chooseSorting(page, 'Prazo mais próximo')
      await expect(projectNames(page)).toHaveText([
        'Projeto Beta',
        'Projeto Alpha',
        'Projeto Gamma',
      ])

      await chooseSorting(page, 'Ordem alfabética')
      await expect(projectNames(page)).toHaveText([
        'Projeto Alpha',
        'Projeto Beta',
        'Projeto Gamma',
      ])
    })

    await test.step('sorts, searches, comes back and the sorting is kept', async () => {
      await chooseSorting(page, 'Iniciados mais recentes')
      await expect(projectNames(page)).toHaveText([
        'Projeto Alpha',
        'Projeto Gamma',
        'Projeto Beta',
      ])

      // Every name starts with "Projeto", so the term matches the whole listing
      // and the round trip cannot be confused with a narrower result.
      await searchToggle(page).click()
      await searchInput(page).fill('Pro')

      await expect(page).toHaveURL('/search')
      await expect(projectCards(page)).toHaveCount(3)

      await searchBackButton(page).click()

      await expect(page).toHaveURL('/')
      await expect(sortCombobox(page)).toHaveText('Iniciados mais recentes')
      await expect(projectNames(page)).toHaveText([
        'Projeto Alpha',
        'Projeto Gamma',
        'Projeto Beta',
      ])
    })
  })
})

test.describe('search projects', () => {
  test('a user searches for a project by name and comes back with escape', async ({ page }) => {
    await test.step('opens / with projects and sees the listing', async () => {
      await seedProjects(page, journeyProjects())
      await page.goto('/')

      await expect(projectCount(page)).toHaveText('(3)')
    })

    await test.step('a term with less than three characters keeps the user on the listing', async () => {
      await searchToggle(page).click()
      await searchInput(page).fill('Al')

      await expect(page).toHaveURL('/')
      await expect(projectsTitle(page)).toBeVisible()
      await expect(searchResultTitle(page)).toHaveCount(0)
      await expect(projectCards(page)).toHaveCount(3)
    })

    await test.step('types a valid term and lands on /search with the right listing', async () => {
      await searchInput(page).fill('Alp')

      await expect(page).toHaveURL('/search')
      await expect(searchResultTitle(page)).toBeVisible()
      await expect(projectCards(page)).toHaveCount(1)
      await expect(projectCard(page, 'Projeto Alpha')).toBeVisible()
      // The matching part of the name is marked with the search term.
      await expect(projectNameHighlight(projectCard(page, 'Projeto Alpha'))).toHaveText('Alp')
      // The result is a read only page: no sorting, no filter, no new project.
      await expect(sortCombobox(page)).toHaveCount(0)
      await expect(favoritedFilter(page)).toHaveCount(0)
    })

    await test.step('presses escape and is sent back to the listing', async () => {
      await searchInput(page).press('Escape')

      await expect(page).toHaveURL('/')
      await expect(searchInput(page)).toHaveCount(0)
      await expect(searchToggle(page)).toBeVisible()
      await expect(searchToggle(page)).toBeFocused()
      await expect(projectsTitle(page)).toBeVisible()
      await expect(projectCards(page)).toHaveCount(3)
      // Back on the listing the name is plain again, no leftover highlight.
      await expect(projectNameHighlight(projectCard(page, 'Projeto Alpha'))).toHaveCount(0)
    })
  })
})

test.describe('search with no results', () => {
  test('a user searches for a term that matches nothing and gets an empty result page', async ({
    page,
  }) => {
    await test.step('opens / with projects and sees the listing', async () => {
      await seedProjects(page, journeyProjects())
      await page.goto('/')

      await expect(projectCount(page)).toHaveText('(3)')
    })

    await test.step('clicks the search button and types a valid term', async () => {
      await searchToggle(page).click()
      await searchInput(page).fill('Zzz')

      await expect(page).toHaveURL('/search')
    })

    await test.step('the result is empty and says nothing about it', async () => {
      await expect(searchResultTitle(page)).toBeVisible()
      await expect(projectCards(page)).toHaveCount(0)
      // The result never falls back to the empty state of the listing.
      await expect(projectsEmptyState(page)).toHaveCount(0)
    })

    await test.step('presses escape and is sent back to the listing', async () => {
      await searchInput(page).press('Escape')

      await expect(page).toHaveURL('/')
      await expect(projectsTitle(page)).toBeVisible()
      await expect(projectCards(page)).toHaveCount(3)
    })
  })
})
