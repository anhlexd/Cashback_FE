/** Chuẩn hóa response DRF paginated hoặc mảng thường. */
export function normalizeApiList<T = unknown>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object') {
    const results = (data as { results?: unknown }).results
    if (Array.isArray(results)) return results as T[]
  }
  return []
}
