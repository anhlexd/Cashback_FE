/** Màu brand — cam Shopee (#EE4D2D) */
export const BRAND_PRIMARY = '#EE4D2D'
export const BRAND_PRIMARY_DARK = '#d43211'
export const BRAND_PRIMARY_LIGHT = '#fcdbd5'

/** Palette avatar / chart (cam làm màu mặc định) */
export const CHART_AVATAR_COLORS = [
  BRAND_PRIMARY,
  '#d43211',
  '#ef5334',
  '#ae290e',
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
