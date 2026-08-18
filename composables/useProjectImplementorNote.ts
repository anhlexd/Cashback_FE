import { format } from 'date-fns'

export type ImplementorNoteState = {
  loading: Ref<boolean>
  refreshing: Ref<boolean>
  available: Ref<boolean>
  message: Ref<string>
  contentHtml: Ref<string>
  status: Ref<string>
  generatedAt: Ref<string | null>
  githubRepos: Ref<string[]>
  cursorPublishedRepos: Ref<string[]>
  showRefresh: ComputedRef<boolean>
  load: () => Promise<void>
  refreshNote: () => Promise<void>
  formatGeneratedAt: (iso: string) => string
}

export function useProjectImplementorNote(
  projectId: MaybeRef<number>,
  options?: { canRefresh?: MaybeRef<boolean> },
): ImplementorNoteState {
  const api = useApi()
  const toast = useToast()
  const pid = computed(() => unref(projectId))
  const canRefreshOpt = computed(() => unref(options?.canRefresh ?? true))

  const { isMember, isViewer, isSystemAdmin } = useProjectRole(pid)

  const loading = ref(false)
  const refreshing = ref(false)
  const available = ref(true)
  const message = ref('')
  const contentHtml = ref('')
  const status = ref('building')
  const generatedAt = ref<string | null>(null)
  const githubRepos = ref<string[]>([])
  const cursorPublishedRepos = ref<string[]>([])

  let pollTimer: ReturnType<typeof setInterval> | null = null

  const showRefresh = computed(
    () =>
      canRefreshOpt.value
      && available.value
      && (isSystemAdmin.value || (isMember.value && !isViewer.value)),
  )

  function formatGeneratedAt(iso: string) {
    try {
      return format(new Date(iso), 'dd/MM/yyyy HH:mm')
    } catch {
      return iso
    }
  }

  function applyPayload(res: any) {
    available.value = res.available !== false
    message.value = res.message || ''
    contentHtml.value = res.content_html || ''
    status.value = res.status || 'ready'
    generatedAt.value = res.generated_at || null
    githubRepos.value = res.github_repos || []
    cursorPublishedRepos.value = res.cursor_logic_published_repos || []
  }

  function stopPoll() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function startPoll() {
    stopPoll()
    pollTimer = setInterval(async () => {
      try {
        const res = await api.get(`/api/projects/${pid.value}/implementor-note/`)
        applyPayload(res)
        if (res.status === 'ready' || res.status === 'error') {
          stopPoll()
        }
      } catch {
        stopPoll()
      }
    }, 4000)
  }

  async function load() {
    if (!pid.value) return
    loading.value = true
    try {
      const res = await api.get(`/api/projects/${pid.value}/implementor-note/`)
      applyPayload(res)
      if (res.status === 'building') {
        startPoll()
      } else {
        stopPoll()
      }
    } catch (e: any) {
      available.value = false
      message.value = e?.data?.detail || 'Không tải được Implementor Note'
    } finally {
      loading.value = false
    }
  }

  async function refreshNote() {
    refreshing.value = true
    stopPoll()
    status.value = 'building'
    try {
      const res = await api.post(`/api/projects/${pid.value}/implementor-note/refresh/`)
      applyPayload(res)
      if (res.status === 'ready') {
        toast.success(res.message || 'Đã cập nhật tài liệu dự án')
      } else if (res.status === 'error') {
        toast.error(res.error_message || res.detail || 'Cập nhật thất bại')
      }
    } catch (e: any) {
      toast.error(e?.data?.detail || e?.data?.error_message || 'Không thể cập nhật')
      await load()
    } finally {
      refreshing.value = false
    }
  }

  onUnmounted(stopPoll)

  return {
    loading,
    refreshing,
    available,
    message,
    contentHtml,
    status,
    generatedAt,
    githubRepos,
    cursorPublishedRepos,
    showRefresh,
    load,
    refreshNote,
    formatGeneratedAt,
  }
}
