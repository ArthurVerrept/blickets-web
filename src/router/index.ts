import { createRouter, createWebHistory } from 'vue-router'
import SignIn from '../views/login-flow/SignInView.vue'
import Dashboard from '../views/Dashboard.vue'
import NeedMeta from '../views/login-flow/NeedMetaView.vue'
import ViewEvents from '../views/ViewEvents.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      props: true
    },
    {
      path: '/metamask',
      name: 'needMeta',
      component: NeedMeta
    },
    {
      path: '/sign-in',
      name: 'singIn',
      component: SignIn,
      props: true
    },
    {
      path: '/google-redirect',
      name: 'googleRedirect',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/login-flow/GoogleRedirect.vue')
    },
    {
      path: '/view-events',
      name: 'viewEvents',
      component: ViewEvents,
      props: true
    },
  ]
})

export default router
