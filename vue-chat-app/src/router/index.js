import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { watch } from 'vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue').catch(err => {
      console.error('Error loading Home component:', err);
      return import('../views/NotFound.vue');
    }),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { guest: true }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/chat/Chat.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/find-friends',
    name: 'FindFriends',
    component: () => import('@/views/friends/FindFriends.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/friend-requests',
    name: 'FriendRequests',
    component: () => import('@/views/friends/FriendRequests.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/activity',
    name: 'Activity',
    component: () => import('@/views/Activity.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/Dashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const isGuest = to.matched.some(record => record.meta.guest)

  // Wait for auth state to be initialized
  if (!authStore.user && authStore.loading) {
    await new Promise(resolve => {
      const unwatch = watch(() => authStore.loading, (loading) => {
        if (!loading) {
          unwatch()
          resolve()
        }
      })
    })
  }

  // Check if user is authenticated
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // Check if user is admin for admin routes
  if (requiresAdmin && !authStore.isAdmin) {
    next({ name: 'Home' })
    return
  }

  // Redirect authenticated users from guest routes
  if (isGuest && authStore.isAuthenticated) {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router 