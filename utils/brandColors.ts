/** Màu brand IDT — đồng bộ với logo (#C41230) */
export const BRAND_PRIMARY = '#C41230'
export const BRAND_PRIMARY_DARK = '#9e0f26'
export const BRAND_PRIMARY_LIGHT = '#fce4e7'

/** Palette avatar / chart (đỏ IDT làm màu mặc định, thay #6370f1 cũ) */
export const CHART_AVATAR_COLORS = [
  BRAND_PRIMARY,
  '#9e0f26',
  '#d91f3d',
  '#7a0c1e',
  '#ec4899',
  '#f97316',
  '#10b981',
  '#3b82f6',
  '#14b8a6',
  '#f59e0b',
]

export function colorFromKey(key?: string | null, palette = CHART_AVATAR_COLORS): string {
  if (!key) return BRAND_PRIMARY
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}
