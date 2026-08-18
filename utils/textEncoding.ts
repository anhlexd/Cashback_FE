/** Khôi phục UTF-8 bị hiển thị sai (mojibake tiếng Việt). */
const MOJIBAKE_HINTS = ['Ã', 'Ä', 'Æ', 'â€', 'áº', 'á»', 'áƒ', 'ðŸ']

export function looksLikeMojibake(text: string): boolean {
  if (!text || text.length < 4) return false
  let hits = 0
  for (const h of MOJIBAKE_HINTS) {
    if (text.includes(h)) hits += 1
  }
  if (hits < 2) return false
  const vn = (text.match(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/g) || []).length
  return hits > Math.max(Math.floor(vn / 8), 1)
}

/** Latin-1 misread UTF-8 → encode latin-1 bytes → decode utf-8 */
export function repairUtf8Mojibake(text: string, maxPasses = 2): string {
  if (!text) return text
  let out = text
  for (let i = 0; i < maxPasses; i++) {
    if (!looksLikeMojibake(out)) break
    try {
      const bytes = new Uint8Array([...out].map((c) => c.charCodeAt(0) & 0xff))
      const candidate = new TextDecoder('utf-8').decode(bytes)
      if (candidate === out) break
      out = candidate
    } catch {
      break
    }
  }
  return out
}
