// composables/useApi.ts
export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const router = useRouter()

  const apiFetch = async <T = any>(
    endpoint: string,
    options: RequestInit & { params?: Record<string, any> } = {}
  ): Promise<T> => {
    const { params, ...fetchOptions } = options

    let url = `${config.public.apiBase}${endpoint}`
    if (params) {
      const query = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => [k, String(v)])
      ).toString()
      if (query) url += `?${query}`
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    }

    if (authStore.token) {
      headers['Authorization'] = `Token ${authStore.token}`
    }

    // Handle FormData - remove Content-Type to let browser set boundary
    if (fetchOptions.body instanceof FormData) {
      delete headers['Content-Type']
    }

    const response = await fetch(url, { ...fetchOptions, headers })

    if (response.status === 401) {
      authStore.logout()
      router.push('/login')
      throw new Error('Session expired')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }))
      throw { status: response.status, data: error }
    }

    if (response.status === 204) return null as T
    return response.json()
  }

  return {
    get: <T>(url: string, params?: Record<string, any>) =>
      apiFetch<T>(url, { method: 'GET', params }),
    post: <T>(url: string, body?: any) =>
      apiFetch<T>(url, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
    put: <T>(url: string, body?: any) =>
      apiFetch<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
    patch: <T>(url: string, body?: any) =>
      apiFetch<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(url: string) =>
      apiFetch<T>(url, { method: 'DELETE' }),
  }
}
