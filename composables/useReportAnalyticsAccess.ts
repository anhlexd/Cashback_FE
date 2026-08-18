// Quyền xem "Phân tích báo cáo" — email analyst HOẶC nhân sự HCNS/HR (cờ từ BE).
export const useReportAnalyticsAccess = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const canViewFromApi = useState<boolean | null>('report-analytics-can-view-api', () => null)
  const loaded = useState<boolean>('report-analytics-access-loaded', () => false)

  const analystEmails = String(config.public.dailyReportAnalystEmails || 'bill.nguyen@idtinc.co')
    .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)

  const canViewFromEmail = computed(() =>
    analystEmails.includes((authStore.user?.email || '').toLowerCase()))

  /** Hiện menu/vào trang nếu email khớp HOẶC API (HCNS/HR) cho phép. */
  const canView = computed(() => canViewFromEmail.value || canViewFromApi.value === true)

  async function ensureLoaded(force = false) {
    if (import.meta.server) return
    if (loaded.value && !force) return
    if (!authStore.accessToken) {
      canViewFromApi.value = false
      loaded.value = true
      return
    }
    try {
      const data = await useApi().get<{ can_view: boolean }>('/api/daily-reports/analytics-access/')
      canViewFromApi.value = !!data.can_view
    } catch {
      canViewFromApi.value = false
    } finally {
      loaded.value = true
    }
  }

  return { canView, canViewFromEmail, canViewFromApi, loaded, ensureLoaded }
}
