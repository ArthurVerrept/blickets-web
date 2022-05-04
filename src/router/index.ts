import { createRouter, createWebHistory } from 'vue-router'
import SignIn from '../views/login-flow/SignInView.vue'
import Home from '../views/Home.vue'
import NeedMeta from '../views/login-flow/NeedMetaView.vue'
import Dashboard from '../views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      props: true
    },
    // {
    //   path: '/ticket/:contractAddress/:ticketNumber/',
    //   name: 'ticket',
    //   component: TicketInfo,
    //   props: true
    // },
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
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      props: true
    },
  ]
})

export default router
