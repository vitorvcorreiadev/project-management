import { createRouter, createWebHistory } from 'vue-router'

import { useProjectsStore } from '@/stores/projects'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'projects', component: () => import('@/views/ProjectsView.vue') },
    { path: '/search', name: 'projects-search-result', component: () => import('@/views/ProjectsSearchResult.vue') },
    { path: '/projects/new', name: 'new-project', component: () => import('@/views/NewProject.vue'), meta: { hideSearch: true } },
    {
      path: '/projects/:id/edit',
      name: 'edit-project',
      component: () => import('@/views/EditProject.vue'),
      meta: { hideSearch: true },
      beforeEnter: (to) => {
        const store = useProjectsStore()

        return store.findProjectById(Number(to.params.id)) ? true : { name: 'projects' }
      },
    },
  ],
})

export default router
