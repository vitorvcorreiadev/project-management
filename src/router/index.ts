import { createRouter, createWebHistory } from 'vue-router'

import ProjectsView from '@/views/ProjectsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: '/', name: 'projects', component: ProjectsView }],
})

export default router
