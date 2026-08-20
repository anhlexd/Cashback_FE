// composables/useFormat.ts
import { format } from 'date-fns'

export const useFormat = () => {
  function currency(value: string | number | null | undefined) {
    const n = Number(value ?? 0)
    return new Intl.NumberFormat('vi-VN').format(Number.isFinite(n) ? n : 0) + 'đ'
  }

  function dateTime(value: string | null | undefined) {
    if (!value) return '—'
    try {
      return format(new Date(value), 'HH:mm dd/MM/yyyy')
    } catch {
      return '—'
    }
  }

  function date(value: string | null | undefined) {
    if (!value) return '—'
    try {
      return format(new Date(value), 'dd/MM/yyyy')
    } catch {
      return '—'
    }
  }

  return { currency, dateTime, date }
}
