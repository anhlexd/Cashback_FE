// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  authStore.initFromStorage()

  if (!authStore.isAuthenticated && to.path !== '/login' && to.path !== '/register') {
    return navigateTo('/login')
  }
  if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/')
  }
})
