// stores/notifications.ts
import { defineStore } from 'pinia'

const POLL_INTERVAL_MS = 30_000   // Fallback poll every 30s when WS misses messages
const PING_INTERVAL_MS = 25_000   // Send keep-alive ping so server doesn't time us out

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as any[],
    unreadCount: 0,
    wsConnected: false,
    ws: null as WebSocket | null,
    reconnectAttempts: 0,
    reconnectTimer: null as ReturnType<typeof setTimeout> | null,
    pollTimer: null as ReturnType<typeof setInterval> | null,
    pingTimer: null as ReturnType<typeof setInterval> | null,
    lastWsToken: null as string | null,
  }),

  actions: {
    async fetchNotifications() {
      const api = useApi()
      try {
        const data = await api.get('/api/notifications/')
        this.notifications = data.results || data
        this.unreadCount = this.notifications.filter((n: any) => !n.is_read).length
      } catch (e) {
        console.error('Failed to fetch notifications', e)
      }
    },

    async fetchUnreadCount() {
      const api = useApi()
      try {
        const data = await api.get('/api/notifications/unread_count/')
        this.unreadCount = data.count ?? 0
      } catch {}
    },

    async markRead(id: number) {
      const api = useApi()
      await api.post(`/api/notifications/${id}/mark_read/`)
      const n = this.notifications.find(n => n.id === id)
      if (n && !n.is_read) { n.is_read = true; this.unreadCount = Math.max(0, this.unreadCount - 1) }
    },

    async markAllRead() {
      const api = useApi()
      await api.post('/api/notifications/mark_all_read/')
      this.notifications.forEach(n => n.is_read = true)
      this.unreadCount = 0
    },

    addNotification(notif: any) {
      const exists = this.notifications.find(n => n.id === notif.id)
      if (exists) return
      this.notifications.unshift(notif)
      if (!notif.is_read) this.unreadCount++
      this.showToast(notif)
      this.showBrowserNotification(notif)
    },

    showToast(notif: any) {
      if (!process.client) return
      try {
        const toast = useToast()
        toast.info(`${notif.title}${notif.message ? ' — ' + notif.message : ''}`)
      } catch {}
    },

    async showBrowserNotification(notif: any) {
      if (!process.client || !('Notification' in window)) return
      try {
        if (Notification.permission === 'granted') {
          new Notification(notif.title, { body: notif.message, icon: '/favicon.ico' })
        } else if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission()
          if (perm === 'granted') {
            new Notification(notif.title, { body: notif.message, icon: '/favicon.ico' })
          }
        }
      } catch {}
    },

    connectWebSocket(token?: string) {
      if (!process.client) return
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      const accessToken = token || authStore.accessToken
      if (!accessToken) return

      // If token has changed (refresh flow), tear down the old socket first
      if (this.ws && this.lastWsToken && this.lastWsToken !== accessToken) {
        try { this.ws.close(1000) } catch {}
        this.ws = null
      }

      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return

      const wsUrl = `${config.public.wsBase}/ws/notifications/?token=${encodeURIComponent(accessToken)}`
      try {
        this.ws = new WebSocket(wsUrl)
        this.lastWsToken = accessToken
      } catch {
        // WS construction failed — at least poll
        this.startPolling()
        return
      }

      // Always start polling fallback alongside the WS — it self-throttles via
      // fetchUnreadCount and is cheap, but means a momentary WS outage doesn't
      // silently drop comment notifications.
      this.startPolling()

      this.ws.onopen = () => {
        this.wsConnected = true
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          // Accept several shapes the backend might use
          if (data.type === 'unread_count' || data.event === 'unread_count') {
            this.unreadCount = data.count ?? data.unread_count ?? this.unreadCount
            return
          }
          // Pong / heartbeat ack — ignore silently
          if (data.type === 'pong' || data.type === 'ping') return

          // Notification event: be lenient about which field carries the type
          const looksLikeNotification =
            data.type === 'notification' ||
            data.event === 'notification' ||
            data.notification_type ||
            data.notification ||
            (data.id && data.title)

          if (looksLikeNotification) {
            // Some backends wrap the payload, others flatten it
            const payload = data.notification || data.data || data
            const { type: _wsType, event: _wsEvent, ...rest } = payload
            const notif = {
              ...rest,
              notification_type: rest.notification_type || _wsType || data.notification_type || 'info',
              is_read: rest.is_read ?? false,
            }
            this.addNotification(notif)
            return
          }
        } catch (e) {
          console.warn('[notifications] failed to parse WS message', e, event.data)
        }
      }

      this.ws.onclose = (event) => {
        this.wsConnected = false
        this.ws = null
        this.stopPing()
        if (event.code !== 1000 && this.reconnectAttempts < 5) {
          const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000)
          this.reconnectAttempts++
          this.reconnectTimer = setTimeout(() => this.connectWebSocket(), delay)
        }
      }

      this.ws.onerror = (e) => {
        console.warn('[notifications] WebSocket error', e)
      }

      // Start ping loop after successful open
      this.startPing()
    },

    startPing() {
      this.stopPing()
      this.pingTimer = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          try { this.ws.send(JSON.stringify({ type: 'ping' })) } catch {}
        }
      }, PING_INTERVAL_MS)
    },

    stopPing() {
      if (this.pingTimer) { clearInterval(this.pingTimer); this.pingTimer = null }
    },

    // Polling fallback so missed WS messages still surface within ~30s
    startPolling() {
      if (this.pollTimer) return
      this.pollTimer = setInterval(async () => {
        const previous = this.unreadCount
        await this.fetchUnreadCount()
        // If count went up while panel wasn't open, refresh full list so the
        // toast/browser notifications surface the new items.
        if (this.unreadCount > previous) {
          await this.fetchNotifications()
        }
      }, POLL_INTERVAL_MS)
    },

    stopPolling() {
      if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null }
    },

    // Call this whenever we know a comment/event was just created so the
    // recipient sees an instant update even if WS is sluggish or down.
    refreshSoon() {
      const previous = this.unreadCount
      this.fetchUnreadCount().then(() => {
        if (this.unreadCount > previous) this.fetchNotifications()
      })
    },

    disconnectWebSocket() {
      if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null }
      this.stopPing()
      this.stopPolling()
      this.reconnectAttempts = 5
      if (this.ws) { this.ws.close(1000); this.ws = null }
      this.wsConnected = false
      this.lastWsToken = null
    },
  }
})
