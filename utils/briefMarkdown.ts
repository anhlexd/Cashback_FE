/** Markdown → HTML với font đọc tiếng Việt (DM Sans), code dùng JetBrains Mono. */
import { repairUtf8Mojibake } from '~/utils/textEncoding'

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inlineFormat(text: string): string {
  let s = text
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/__(.+?)__/g, '<strong>$1</strong>')
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  s = s.replace(/_([^_]+)_/g, '<em>$1</em>')
  s = s.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
  return s
}

export function markdownToHtml(md: string): string {
  if (!md) return ''

  let text = repairUtf8Mojibake(md.replace(/\r\n/g, '\n').trim())

  const codeBlocks: string[] = []
  text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, _lang, code) => {
    const idx = codeBlocks.length
    codeBlocks.push(escapeHtml(String(code).replace(/\n$/, '')))
    return `\x00CODE${idx}\x00`
  })

  const lines = text.split('\n')
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      i += 1
      continue
    }

    const codeMatch = trimmed.match(/^\x00CODE(\d+)\x00$/)
    if (codeMatch) {
      const code = codeBlocks[Number(codeMatch[1])] ?? ''
      out.push(`<pre class="md-pre"><code>${code}</code></pre>`)
      i += 1
      continue
    }

    if (/^#{1,6}\s/.test(trimmed)) {
      const level = trimmed.match(/^#+/)![0].length
      const content = inlineFormat(escapeHtml(trimmed.replace(/^#+\s*/, '')))
      const tag = level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4'
      const cls =
        level === 1 ? 'md-h1' : level === 2 ? 'md-h2' : level === 3 ? 'md-h3' : 'md-h4'
      out.push(`<${tag} class="${cls}">${content}</${tag}>`)
      i += 1
      continue
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''))
        i += 1
      }
      const inner = quoteLines.map((l) => inlineFormat(escapeHtml(l))).join('<br />')
      out.push(`<blockquote class="md-quote">${inner}</blockquote>`)
      continue
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const item = lines[i].trim().replace(/^[-*]\s+/, '')
        items.push(`<li>${inlineFormat(escapeHtml(item))}</li>`)
        i += 1
      }
      out.push(`<ul class="md-ul">${items.join('')}</ul>`)
      continue
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const item = lines[i].trim().replace(/^\d+\.\s+/, '')
        items.push(`<li>${inlineFormat(escapeHtml(item))}</li>`)
        i += 1
      }
      out.push(`<ol class="md-ol">${items.join('')}</ol>`)
      continue
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      out.push('<hr class="md-hr" />')
      i += 1
      continue
    }

    const paraLines: string[] = [trimmed]
    i += 1
    while (i < lines.length) {
      const next = lines[i].trim()
      if (
        !next
        || /^#{1,6}\s/.test(next)
        || /^[-*]\s+/.test(next)
        || /^\d+\.\s+/.test(next)
        || /^>\s?/.test(next)
        || /^\x00CODE\d+\x00$/.test(next)
        || /^(-{3,}|\*{3,}|_{3,})$/.test(next)
      ) {
        break
      }
      paraLines.push(next)
      i += 1
    }
    const para = paraLines.map((l) => inlineFormat(escapeHtml(l))).join('<br />')
    out.push(`<p class="md-p">${para}</p>`)
  }

  return `<div class="markdown-body">${out.join('\n')}</div>`
}

/** @deprecated alias — dùng markdownToHtml */
export function briefMarkdownToHtml(md: string): string {
  return markdownToHtml(md)
}
