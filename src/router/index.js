import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Vuelo en Globo Teotihuacán | Von Navi', requiresAuth: false }
  },
  {
    path: '/vonnavi',
    name: 'About',
    component: () => import('../views/AcercaDeView.vue'),
    meta: { title: 'Acerca De Von Navi | Von Navi', requiresAuth: false }
  },
  {
    path: '/paquetes',
    name: 'Paquetes',
    component: () => import('../views/PaquetesView.vue'),
    meta: { title: 'Paquetes de Vuelo | Von Navi', requiresAuth: false }
  },
  {
    path: '/paquetes/:slug',
    name: 'PaqueteDetalle',
    component: () => import('../views/PaqueteDetalleView.vue'),
    meta: { title: 'Paquete | Von Navi', requiresAuth: false }
  },
  {
    path: '/cotizar',
    redirect: '/reservar'
  },
  {
    path: '/reservar',
    name: 'Reservar',
    component: () => import('../views/ReservarRedirect.vue'),
    meta: { title: 'Reservar | Von Navi', requiresAuth: false }
  },
  {
    path: '/blog',
    name: 'Blog',
    component: () => import('../views/BlogListView.vue'),
    meta: { title: 'Blog | Von Navi', requiresAuth: false }
  },
  {
    path: '/blog/:slug',
    name: 'BlogPost',
    component: () => import('../views/BlogPostView.vue'),
    meta: { title: 'Blog | Von Navi', requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: 'Iniciar Sesión | Von Navi', requiresAuth: false }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
    meta: { title: 'Panel Admin | Von Navi', requiresAuth: true }
  },
  {
    path: '/admin/blog',
    name: 'AdminBlog',
    component: () => import('../views/AdminBlogView.vue'),
    meta: { title: 'Blog Admin | Von Navi', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  const { supabase } = await import('../lib/supabase.js')
  const { data: { session } } = await supabase.auth.getSession()
  
  if (to.meta.requiresAuth && !session) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
