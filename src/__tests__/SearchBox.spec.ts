import { describe, it, expect, vi, afterEach } from 'vitest'
import { nextTick } from 'vue'

import { createPinia } from 'pinia'
import { mount, type VueWrapper } from '@vue/test-utils'

import SearchBox from '../components/SearchBox.vue'
import { useSearchHistoryStore } from '../stores/searchHistory'

const { currentRoute, push, back } = vi.hoisted(() => ({
  currentRoute: { value: { name: 'projects' } as { name: string | undefined } },
  push: vi.fn<(to: string) => unknown>(),
  back: vi.fn<() => void>(),
}))

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRouter: () => ({ push, back, currentRoute }),
}))

const wrappers: VueWrapper[] = []

function render() {
  const wrapper = mount(SearchBox, {
    global: { plugins: [createPinia()] },
    attachTo: document.body,
  })

  wrappers.push(wrapper)

  return wrapper
}

const options = (w: VueWrapper) => w.findAll('[role="option"]')
const labels = (w: VueWrapper) => options(w).map((option) => option.text())
const activeDescendant = (w: VueWrapper) => w.find('input').attributes('aria-activedescendant')

// `find()` hands back an `Element`, which carries no `value`; the input is always
// the one input in the tree, so the cast belongs here rather than at every call.
const value = (w: VueWrapper) => (w.find('input').element as HTMLInputElement).value

// `useClickOutside` listens natively on `document`, so the handler runs synchronously.
// Closing only queues a re-render though, so the tick has to be awaited before any test
// is allowed to look at the DOM.
async function pointerDown(node: Node) {
  node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
  await nextTick()
}

async function open(wrapper: VueWrapper) {
  await wrapper.find('.search-box > button').trigger('click')
}

async function type(wrapper: VueWrapper, value: string) {
  const input = wrapper.find('input')
  ;(input.element as HTMLInputElement).value = value
  await input.trigger('input')
}

function seed(...terms: string[]) {
  const history = useSearchHistoryStore()
  for (const term of terms) history.record(term)
}

/*
 * The router is mocked so the component can drive the same navigation branches from
 * the projects listing and from the search result. The wrappers mount into the
 * document because the assertions on `aria-activedescendant` and on the focus the
 * search hands back need a live tree, and they are torn down between tests so their
 * document listeners do not outlive the assertions that registered them.
 */
describe('SearchBox history', () => {
  afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.unmount()
    push.mockClear()
    back.mockClear()
  })

  it('renders no panel while the search is closed', () => {
    const wrapper = render()
    seed('Alp')

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('lists the stored searches from the newest to the fifth newest when opened', async () => {
    const wrapper = render()
    seed('s01', 's02', 's03', 's04', 's05', 's06')

    await open(wrapper)

    expect(labels(wrapper)).toEqual(['s06', 's05', 's04', 's03', 's02'])
  })

  it('renders no panel when nothing is stored', async () => {
    const wrapper = render()

    await open(wrapper)

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('records the term and closes when a pointer lands outside', async () => {
    const wrapper = render()
    await open(wrapper)
    await type(wrapper, 'Alp')

    await pointerDown(document.body)

    expect(useSearchHistoryStore().terms).toEqual(['Alp'])
    expect(wrapper.find('input').exists()).toBe(false)
  })

  it('trims the recorded term', async () => {
    const wrapper = render()
    await open(wrapper)
    await type(wrapper, '  Alfa  ')

    await pointerDown(document.body)

    expect(useSearchHistoryStore().terms).toEqual(['Alfa'])
  })

  it('records nothing for a term below the minimum length', async () => {
    const wrapper = render()
    await open(wrapper)
    await type(wrapper, 'Al')

    await pointerDown(document.body)

    expect(useSearchHistoryStore().terms).toEqual([])
  })

  it('records nothing when the search is cancelled with escape', async () => {
    const wrapper = render()
    await open(wrapper)
    await type(wrapper, 'Alp')
    await wrapper.find('input').trigger('keydown', { key: 'Escape' })

    expect(useSearchHistoryStore().terms).toEqual([])
  })

  it('records nothing when the search is opened and dismissed untouched', async () => {
    const wrapper = render()
    await open(wrapper)

    await pointerDown(document.body)

    expect(useSearchHistoryStore().terms).toEqual([])
  })

  it('keeps one entry when the same term is dismissed twice', async () => {
    const wrapper = render()
    await open(wrapper)
    await type(wrapper, 'Alp')
    await pointerDown(document.body)
    await open(wrapper)
    await pointerDown(document.body)

    expect(useSearchHistoryStore().terms).toEqual(['Alp'])
  })

  it('does not close when a pointer lands inside the panel', async () => {
    const wrapper = render()
    seed('Alp')
    await open(wrapper)

    await pointerDown(wrapper.find('[role="listbox"]').element)

    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('does not close when a pointer lands on a remove button', async () => {
    const wrapper = render()
    seed('Alp')
    await open(wrapper)

    await pointerDown(wrapper.find('.search-history-remove').element)

    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('fills the input with the picked search and runs it', async () => {
    const wrapper = render()
    seed('Alp')
    await open(wrapper)

    await options(wrapper)[0]?.trigger('click')

    expect(value(wrapper)).toBe('Alp')
    expect(push).toHaveBeenCalledWith('/search')
  })

  it('stays open after a search is picked', async () => {
    const wrapper = render()
    seed('Alp')
    await open(wrapper)

    await options(wrapper)[0]?.trigger('click')

    expect(wrapper.find('input').exists()).toBe(true)
  })

  // The reorder is asserted on the store, not on the rendered labels: picking fills the
  // input, and the panel filters on the input, so only the picked row is on screen by
  // the time the click settles. The rendering of that collapse is the next test.
  it('moves the picked search to the newest position', async () => {
    const wrapper = render()
    const history = useSearchHistoryStore()
    seed('a01', 'a02', 'a03')
    await open(wrapper)

    await options(wrapper)[2]?.trigger('click')

    expect(history.terms).toEqual(['a01', 'a03', 'a02'])
  })

  it('narrows the panel to the picked search', async () => {
    const wrapper = render()
    seed('a01', 'a02', 'a03')
    await open(wrapper)

    await options(wrapper)[2]?.trigger('click')

    expect(labels(wrapper)).toEqual(['a01'])
  })

  it('removes one search when its remove button is clicked', async () => {
    const wrapper = render()
    const history = useSearchHistoryStore()
    seed('a01', 'a02', 'a03')
    await open(wrapper)

    await wrapper.findAll('.search-history-remove')[1]?.trigger('click')

    expect(history.terms).toEqual(['a03', 'a01'])
    expect(labels(wrapper)).toEqual(['a03', 'a01'])
  })

  it('promotes the sixth stored search once a recent one is removed', async () => {
    const wrapper = render()
    seed('s01', 's02', 's03', 's04', 's05', 's06')
    await open(wrapper)

    await wrapper.findAll('.search-history-remove')[0]?.trigger('click')

    expect(labels(wrapper)).toEqual(['s05', 's04', 's03', 's02', 's01'])
  })

  it('names every remove button after the search it removes', async () => {
    const wrapper = render()
    seed('Alfa')
    await open(wrapper)

    expect(wrapper.find('.search-history-remove').attributes('aria-label')).toBe(
      'Remover Alfa das buscas recentes',
    )
  })
})

describe('SearchBox history filter', () => {
  afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.unmount()
    push.mockClear()
  })

  it('narrows the listed searches as the term is typed', async () => {
    const wrapper = render()
    seed('Alfa', 'Beta', 'Gam')
    await open(wrapper)

    await type(wrapper, 'a')
    expect(labels(wrapper)).toEqual(['Gam', 'Beta', 'Alfa'])

    await type(wrapper, 'Al')
    expect(labels(wrapper)).toEqual(['Alfa'])
  })

  it('hides the panel when the term matches no stored search', async () => {
    const wrapper = render()
    seed('Alfa')
    await open(wrapper)

    await type(wrapper, 'zzz')

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('keeps the panel unfiltered for a term that is only padding', async () => {
    const wrapper = render()
    seed('Alfa')
    await open(wrapper)

    await type(wrapper, '   ')

    expect(labels(wrapper)).toEqual(['Alfa'])
  })

  it('marks the input as collapsed while the panel is hidden', async () => {
    const wrapper = render()
    seed('Alfa')
    await open(wrapper)

    await type(wrapper, 'zzz')

    expect(wrapper.find('input').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('input').attributes('aria-controls')).toBeUndefined()
  })

  it('marks the input as expanded again when the term matches once more', async () => {
    const wrapper = render()
    seed('Alfa')
    await open(wrapper)

    await type(wrapper, 'zzz')
    await type(wrapper, 'Al')

    expect(wrapper.find('input').attributes('aria-expanded')).toBe('true')
  })

  it('marks the matched part of every listed search', async () => {
    const wrapper = render()
    seed('Alfa')
    await open(wrapper)

    await type(wrapper, 'Al')

    expect(wrapper.find('[role="option"] mark').text()).toBe('Al')
  })

  it('surfaces a stored search below the recent five once the filter excludes them', async () => {
    const wrapper = render()
    seed('s01', 's02', 's03', 's04', 's05', 's06')
    await open(wrapper)

    await type(wrapper, 's06')

    expect(labels(wrapper)).toEqual(['s06'])
  })
})

describe('SearchBox combobox', () => {
  afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.unmount()
    push.mockClear()
  })

  it('marks the input as a combobox expanded over the list', async () => {
    const wrapper = render()
    seed('Alp')
    await open(wrapper)

    const input = wrapper.find('input')

    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-autocomplete')).toBe('list')
    expect(input.attributes('aria-expanded')).toBe('true')
    expect(input.attributes('aria-controls')).toBe(
      wrapper.find('[role="listbox"]').attributes('id'),
    )
  })

  it('starts with no option active', async () => {
    const wrapper = render()
    seed('Alp')
    await open(wrapper)

    expect(activeDescendant(wrapper)).toBeUndefined()
  })

  it('activates the first option on the first arrow down', async () => {
    const wrapper = render()
    seed('Alp')
    await open(wrapper)

    await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })

    expect(activeDescendant(wrapper)).toBe(options(wrapper)[0]?.attributes('id'))
  })

  it('activates the last option on the first arrow up', async () => {
    const wrapper = render()
    seed('a01', 'a02', 'a03')
    await open(wrapper)

    await wrapper.find('input').trigger('keydown', { key: 'ArrowUp' })

    expect(activeDescendant(wrapper)).toBe(options(wrapper)[2]?.attributes('id'))
  })

  it('wraps from the first option to the last on arrow up', async () => {
    const wrapper = render()
    seed('a01', 'a02', 'a03')
    await open(wrapper)
    const input = wrapper.find('input')

    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'ArrowUp' })

    expect(activeDescendant(wrapper)).toBe(options(wrapper)[2]?.attributes('id'))
  })

  it('walks down through the options and wraps at the end', async () => {
    const wrapper = render()
    seed('a01', 'a02')
    await open(wrapper)
    const input = wrapper.find('input')

    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'ArrowDown' })

    expect(activeDescendant(wrapper)).toBe(options(wrapper)[0]?.attributes('id'))
  })

  it('marks exactly the active option as selected', async () => {
    const wrapper = render()
    seed('Alp')
    await open(wrapper)

    await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })

    expect(options(wrapper)[0]?.attributes('aria-selected')).toBe('true')
  })

  it('picks the active option on enter', async () => {
    const wrapper = render()
    seed('Alp')
    await open(wrapper)
    const input = wrapper.find('input')

    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })

    expect(value(wrapper)).toBe('Alp')
    expect(push).toHaveBeenCalledWith('/search')
  })

  it('does nothing on enter with no option active', async () => {
    const wrapper = render()
    seed('Alp')
    await open(wrapper)

    await wrapper.find('input').trigger('keydown', { key: 'Enter' })

    expect(push).not.toHaveBeenCalled()
  })

  it('drops the active option when typing shrinks the list', async () => {
    const wrapper = render()
    seed('Alfa', 'Beta')
    await open(wrapper)
    const input = wrapper.find('input')

    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'ArrowDown' })
    await type(wrapper, 'Al')

    expect(activeDescendant(wrapper)).toBeUndefined()
  })

  // Typing re-evaluates `visibleTerms`, which hands back a new array even when the
  // filter matches exactly the same terms, so the active option is dropped on any
  // change to the term rather than only when the list visibly shrinks.
  it('drops the active option when the term changes the list at all', async () => {
    const wrapper = render()
    seed('Alfa', 'Beta')
    await open(wrapper)
    const input = wrapper.find('input')

    await input.trigger('keydown', { key: 'ArrowDown' })
    await type(wrapper, 'a')

    expect(labels(wrapper)).toEqual(['Beta', 'Alfa'])
    expect(activeDescendant(wrapper)).toBeUndefined()
  })

  it('drops the active option when an entry is removed', async () => {
    const wrapper = render()
    seed('Alfa', 'Beta')
    await open(wrapper)

    await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.findAll('.search-history-remove')[0]?.trigger('click')

    expect(activeDescendant(wrapper)).toBeUndefined()
  })
})
