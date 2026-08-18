// composables/useWebSocket.ts
export const useWebSocket = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectAttempts = 0
  const MAX_RECONNECT = 5

  const connected = ref(false)
  const unreadCount = ref(0)
  const notifications = ref<any[]>([])

  function connect() {
    if (!authStore.accessToken || !process.client) return
    if (ws && ws.readyState === WebSocket.OPEN) return

    const wsUrl = `${config.public.wsBase}/ws/notifications/?token=${authStore.accessToken}`

    try {
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        connected.value = true
        reconnectAttempts = 0
        console.log('[WS] Connected to notification channel')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'unread_count') {
            unreadCount.value = data.count
          } else if (data.type === 'notification') {
            notifications.value.unshift(data)
            unreadCount.value++
            // Show browser notification if permitted
            showBrowserNotification(data)
          }
        } catch (e) {
          console.error('[WS] Parse error', e)
        }
      }

      ws.onclose = (event) => {
        connected.value = false
        console.log('[WS] Disconnected', event.code)
        // Auto-reconnect unless intentional close
        if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000)
          reconnectAttempts++
          reconnectTimer = setTimeout(connect, delay)
        }
      }

      ws.onerror = (error) => {
        console.error('[WS] Error', error)
      }
    } catch (e) {
      console.error('[WS] Connection failed', e)
    }
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (ws) {
      ws.close(1000, 'Intentional disconnect')
      ws = null
    }
    connected.value = false
  }

  function markRead(notificationId: number) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'mark_read', notification_id: notificationId }))
    }
    const notif = notifications.value.find(n => n.id === notificationId)
    if (notif && !notif.is_read) {
      notif.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  async function showBrowserNotification(notif: any) {
    if (!process.client || !('Notification' in window)) return
    if (Notification.permission === 'granted') {
      new Notification(notif.title, {
        body: notif.message,
        icon: '/favicon.ico',
      })
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        new Notification(notif.title, { body: notif.message })
      }
    }
  }

  // Auto-connect when auth token is available
  watch(() => authStore.accessToken, (token) => {
    if (token) connect()
    else disconnect()
  }, { immediate: true })

  onUnmounted(disconnect)

  return { connected, unreadCount, notifications, connect, disconnect, markRead }
}
