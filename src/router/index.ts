import { createRouter, createWebHistory } from 'vue-router'

import ProjectsView from '@/views/ProjectsView.vue'
import ProjectsSearchResult from '@/views/ProjectsSearchResult.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'projects', component: ProjectsView },
    { path: '/search', name: 'projects-search-result', component: ProjectsSearchResult },
  ],
})

export default router
