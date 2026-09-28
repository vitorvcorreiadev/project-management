import { createRouter, createWebHistory } from 'vue-router'

import ProjectsView from '@/views/ProjectsView.vue'
import ProjectsSearchResult from '@/views/ProjectsSearchResult.vue'
import NewProject from '@/views/NewProject.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'projects', component: ProjectsView },
    { path: '/search', name: 'projects-search-result', component: ProjectsSearchResult },
    { path: '/new-project', name: 'new-project', component: NewProject },
  ],
})

export default router
