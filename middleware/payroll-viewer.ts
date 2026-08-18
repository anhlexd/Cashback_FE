/** Không đặt tên file là payroll.ts — trùng pages/payroll gây lỗi 500 trên Nuxt. */
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const authStore = useAuthStore()
  if (!authStore.user && authStore.accessToken) {
    try {
      await authStore.fetchProfile()
    } catch {
      return navigateTo('/login')
    }
  }

  const { canView, ensureLoaded } = usePayrollAccess()
  await ensureLoaded(true)
  if (!canView.value) {
    return navigateTo('/')
  }
})
