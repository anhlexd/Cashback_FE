/** OAuth redirect cho Drive / Figma (BE trả authorize_url). */
export function useIntegrationOAuth() {
  const api = useApi()
  const config = useRuntimeConfig()

  async function startOAuth(provider: 'drive' | 'figma') {
    const path = provider === 'drive' ? '/api/drive/oauth/start/' : '/api/figma/oauth/start/'
    const res = await api.get(path)
    const url = res?.authorize_url
    if (!url) {
      const err = (res as any)?.error
      throw { data: { error: err || 'GOOGLE/FIGMA_CLIENT_ID chưa cấu hình trên server' } }
    }
    if (!import.meta.client) return
    const returnTo = window.location.pathname + window.location.search
    sessionStorage.setItem(`${provider}_oauth_return`, returnTo)
    window.location.assign(url)
  }

  function consumeReturnPath(provider: 'drive' | 'figma'): string {
    if (!import.meta.client) return '/projects'
    const p = sessionStorage.getItem(`${provider}_oauth_return`) || '/projects'
    sessionStorage.removeItem(`${provider}_oauth_return`)
    return p
  }

  return { startOAuth, consumeReturnPath, frontendUrl: config.public.apiBase }
}
