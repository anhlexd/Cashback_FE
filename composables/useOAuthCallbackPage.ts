/** Trang landing sau OAuth Drive/Figma — xử lý query và xác minh qua API. */
export function useOAuthCallbackPage(provider: 'drive' | 'figma') {
  const route = useRoute()
  const api = useApi()
  const { consumeReturnPath } = useIntegrationOAuth()

  const mePath = provider === 'drive' ? '/api/drive/account/me/' : '/api/figma/account/me/'
  const providerLabel = provider === 'drive' ? 'Google Drive' : 'Figma'

  const returnPath = ref('/projects')
  const phase = ref<'loading' | 'connected' | 'failed'>('loading')
  const errorMessage = ref('')
  const accountLabel = ref('')

  function queryParam(key: string): string {
    const raw = route.query[key]
    if (Array.isArray(raw)) return String(raw[0] || '')
    return String(raw || '')
  }

  onMounted(async () => {
    returnPath.value = consumeReturnPath(provider)

    const qStatus = queryParam('status').toLowerCase()
    const qError = queryParam('error')

    if (qStatus === 'connected') {
      phase.value = 'connected'
      await loadAccountHint()
      return
    }

    if (qError) {
      phase.value = 'failed'
      try {
        errorMessage.value = decodeURIComponent(qError.replace(/\+/g, ' '))
      } catch {
        errorMessage.value = qError
      }
      return
    }

    try {
      const me = await api.get(mePath)
      if (me?.connected) {
        phase.value = 'connected'
        accountLabel.value = formatAccountLabel(me, provider)
        return
      }
    } catch {
      /* fall through */
    }

    phase.value = 'failed'
    errorMessage.value =
      'Không thấy tài khoản đã kết nối. Có thể redirect URL (FRONTEND_URL) chưa khớp — thử kết nối lại từ dự án.'
  })

  async function loadAccountHint() {
    try {
      const me = await api.get(mePath)
      if (me?.connected) accountLabel.value = formatAccountLabel(me, provider)
    } catch {
      /* optional */
    }
  }

  return {
    provider,
    providerLabel,
    returnPath,
    phase,
    errorMessage,
    accountLabel,
  }
}

function formatAccountLabel(me: any, provider: 'drive' | 'figma'): string {
  if (provider === 'drive') {
    return me.google_email || me.display_name || ''
  }
  return me.figma_handle || me.figma_email || ''
}
