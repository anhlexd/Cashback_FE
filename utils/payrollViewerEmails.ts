/** Danh sách email được xem lương khoán (khớp BE PAYROLL_VIEWER_EMAILS). */
export function parsePayrollViewerEmails(raw?: string): Set<string> {
  const source = (raw || 'bill.nguyen@idtinc.co').trim()
  if (!source) return new Set(['bill.nguyen@idtinc.co'])
  return new Set(
    source.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean),
  )
}

export function isPayrollViewerEmail(email: string | null | undefined, raw?: string): boolean {
  if (!email) return false
  return parsePayrollViewerEmails(raw).has(email.trim().toLowerCase())
}
