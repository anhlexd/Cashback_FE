export type DriveAccountMe = {
  connected: boolean
  google_email?: string
  display_name?: string
  can_write?: boolean
  needs_reconnect?: boolean
  watch_active?: boolean
  watch_expiration?: string | null
  webhook_configured?: boolean
}

export function useDriveAccount() {
  const api = useApi()
  const toast = useToast()

  const me = ref<DriveAccountMe>({ connected: false })
  const loading = ref(false)
  const registeringWatch = ref(false)

  async function fetchMe() {
    loading.value = true
    try {
      const res = await api.get<DriveAccountMe>('/api/drive/account/me/')
      me.value = res?.connected
        ? { connected: true, ...res }
        : { connected: false }
    } catch {
      me.value = { connected: false }
    } finally {
      loading.value = false
    }
    return me.value
  }

  async function registerWatch() {
    registeringWatch.value = true
    try {
      const res = await api.post<{ status: string; expiration?: string; error?: string }>(
        '/api/drive/account/register-watch/',
        {},
      )
      await fetchMe()
      toast.success('Đã bật theo dõi thay đổi Google Drive')
      return res
    } catch (e: any) {
      const msg = e?.data?.error || e?.data?.detail || 'Không bật được theo dõi Drive'
      toast.error(msg)
      throw e
    } finally {
      registeringWatch.value = false
    }
  }

  return {
    me,
    loading,
    registeringWatch,
    fetchMe,
    registerWatch,
  }
}
