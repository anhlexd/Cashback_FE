// middleware/admin.ts
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAdmin) {
    return navigateTo('/dashboard')
  }
})
