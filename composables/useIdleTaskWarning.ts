// composables/useIdleTaskWarning.ts
// Global "no work in progress" warning state.
//
// Warns when the current user:
//   - is logged in
//   - is a member of at least one project
//   - has ZERO issues with status='in_progress' assigned to them across all projects
//
// Triggers a periodic refresh so the banner reacts to status changes elsewhere.

import { storeToRefs } from 'pinia'

// Shared singleton state across the app (composable is called by both the layout
// and any page that wants to mutate it).
const inProgressCount = ref<number | null>(null)
const lastCheckedAt = ref<number | null>(null)
const checking = ref(false)
const dismissed = ref(false)  // user-dismissed for this session
let refreshTimer: ReturnType<typeof setInterval> | null = null

const REFRESH_INTERVAL_MS = 60_000  // 1 minute

export function useIdleTaskWarning() {
  const authStore = useAuthStore()
  const projectsStore = useProjectsStore()
  const { projects } = storeToRefs(projectsStore)
  const api = useApi()

  const projectsCount = computed(() => projects.value.length)

  const shouldWarn = computed(() => {
    if (dismissed.value) return false
    if (!authStore.user) return false
    if (inProgressCount.value === null) return false
    return projectsCount.value > 0 && inProgressCount.value === 0
  })

  async function check(force = false) {
    if (!authStore.user) return
    if (!force && lastCheckedAt.value && Date.now() - lastCheckedAt.value < 5_000) return
    checking.value = true
    try {
      // Make sure we know how many projects the user is in
      if (!projects.value.length) {
        await projectsStore.fetchProjects().catch(() => {})
      }
      const data: any = await api.get('/api/issues/', {
        assignee: authStore.user.id,
        status: 'in_progress',
        page_size: 1,
      })
      inProgressCount.value = typeof data?.count === 'number'
        ? data.count
        : (data?.results || data || []).length
      lastCheckedAt.value = Date.now()
    } catch {
      // Ignore network errors; keep last known count
    } finally {
      checking.value = false
    }
  }

  function dismiss() {
    dismissed.value = true
  }

  function reset() {
    dismissed.value = false
  }

  function startAutoRefresh() {
    if (refreshTimer) return
    refreshTimer = setInterval(() => check(true), REFRESH_INTERVAL_MS)
  }

  function stopAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  return {
    shouldWarn,
    inProgressCount,
    projectsCount,
    checking,
    check,
    dismiss,
    reset,
    startAutoRefresh,
    stopAutoRefresh,
  }
}
