import { isPayrollViewerEmail } from '~/utils/payrollViewerEmails'

export const usePayrollAccess = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const canViewFromApi = useState<boolean | null>('payroll-can-view-api', () => null)
  const loaded = useState<boolean>('payroll-access-loaded', () => false)

  const canViewFromEmail = computed(() =>
    isPayrollViewerEmail(
      authStore.user?.email,
      config.public.payrollViewerEmails as string | undefined,
    ),
  )

  /** Hiện menu / cho vào trang nếu API cho phép HOẶC email khớp (tránh mất menu khi BE chưa deploy). */
  const canView = computed(() => {
    if (canViewFromEmail.value) return true
    return canViewFromApi.value === true
  })

  function reset() {
    canViewFromApi.value = null
    loaded.value = false
  }

  async function ensureLoaded(force = false) {
    if (import.meta.server) return
    if (loaded.value && !force) return
    if (!authStore.accessToken) {
      canViewFromApi.value = false
      loaded.value = true
      return
    }
    const api = useApi()
    try {
      const data = await api.get<{ can_view: boolean }>('/api/payroll/access/')
      canViewFromApi.value = !!data.can_view
    } catch {
      canViewFromApi.value = false
    } finally {
      loaded.value = true
    }
  }

  return { canView, canViewFromEmail, canViewFromApi, loaded, ensureLoaded, reset }
}
