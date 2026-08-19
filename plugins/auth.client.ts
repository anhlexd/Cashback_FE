// plugins/auth.client.ts
// Runs on client-side only — restores auth state from localStorage on page load
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  authStore.initFromStorage()

  if (authStore.token && !authStore.user) {
    await authStore.fetchProfile().catch(() => {
      // Token may be expired — logout silently
      authStore.logout()
    })
  }
})
