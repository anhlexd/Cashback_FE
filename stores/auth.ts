// stores/auth.ts
import { defineStore } from 'pinia'

interface User {
  id: number
  email: string
  fullname: string
  phone_number: string | null
  role: 'USER' | 'ADMIN'
  referral_code?: string | null
  affiliate_code?: string | null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    currentUser: (state) => state.user,
    isAdmin: (state) => state.user?.role === 'ADMIN',
  },

  actions: {
    setToken(token: string) {
      this.token = token
      if (process.client) {
        localStorage.setItem('token', token)
        localStorage.setItem('role', this.user?.role ?? '')
      }
    },

    setUser(user: User) {
      this.user = user
      if (process.client && this.token) {
        localStorage.setItem('role', user.role ?? '')
      }
    },

    async login(email: string, password: string) {
      const config = useRuntimeConfig()
      const response = await fetch(`${config.public.apiBase}/api/account/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw data
      }
      const { token, ...user } = data.data
      this.setUser(user)
      this.setToken(token)
      return data
    },

    async logout() {
      const config = useRuntimeConfig()
      if (this.token) {
        fetch(`${config.public.apiBase}/api/account/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${this.token}`,
          },
        }).catch(() => {})
      }
      this.user = null
      this.token = null
      if (process.client) {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
      }
    },

    async fetchProfile() {
      const config = useRuntimeConfig()
      const response = await fetch(`${config.public.apiBase}/api/account/me/`, {
        headers: { 'Authorization': `Token ${this.token}` },
      })
      if (response.ok) {
        this.user = await response.json()
      } else if (response.status === 401) {
        // Token không hợp lệ / đã hết hạn (vd sau khi reset password)
        this.user = null
        this.token = null
        if (process.client) {
          localStorage.removeItem('token')
          localStorage.removeItem('role')
        }
      }
    },

    async updateProfile(payload: { fullname?: string; phone_number?: string }) {
      const config = useRuntimeConfig()
      const response = await fetch(`${config.public.apiBase}/api/account/me/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${this.token}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw data
      }
      this.user = data.data
      return data
    },

    initFromStorage() {
      if (process.client) {
        this.token = localStorage.getItem('token')
      }
    },
  },
})