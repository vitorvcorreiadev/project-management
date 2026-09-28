import { createRouter, createWebHistory } from 'vue-router'

import ProjectsView from '@/views/ProjectsView.vue'
import ProjectsSearchResult from '@/views/ProjectsSearchResult.vue'
import NewProject from '@/views/NewProject.vue'
import EditProject from '@/views/EditProject.vue'
import { useProjectsStore } from '@/stores/projects'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'projects', component: ProjectsView },
    { path: '/search', name: 'projects-search-result', component: ProjectsSearchResult },
    { path: '/new-project', name: 'new-project', component: NewProject },
    {
      path: '/projects/:id/edit',
      name: 'edit-project',
      component: EditProject,
      beforeEnter: (to) => {
        const store = useProjectsStore()

        return store.findProjectById(Number(to.params.id)) ? true : { name: 'projects' }
      },
    },
  ],
})

export default router
