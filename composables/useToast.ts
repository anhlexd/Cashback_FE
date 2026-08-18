// composables/useToast.ts
interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const toasts = ref<Toast[]>([])
let nextId = 0

export const useToast = () => {
  function add(message: string, type: Toast['type'] = 'info', duration = 3500) {
    const id = ++nextId
    toasts.value.push({ id, message, type, duration })
    setTimeout(() => remove(id), duration)
    return id
  }

  function remove(id: number) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  return {
    toasts: readonly(toasts),
    success: (msg: string) => add(msg, 'success'),
    error: (msg: string) => add(msg, 'error', 5000),
    info: (msg: string) => add(msg, 'info'),
    warning: (msg: string) => add(msg, 'warning'),
    remove,
  }
}
