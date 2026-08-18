import { format } from 'date-fns'
import { normalizeApiList } from '~/utils/apiList'
import type { IssueListFilterInput } from '~/utils/issueListParams'
import { buildIssueListParams } from '~/utils/issueListParams'

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  testing: 'Testing',
  bug_fixing: 'Bug Fixing',
  done: 'Done',
  cancelled: 'Cancelled',
}

const TYPE_LABELS: Record<string, string> = {
  task: 'Task',
  bug: 'Bug',
  story: 'Story',
  epic: 'Epic',
  subtask: 'Sub-task',
}

const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function fmtDate(d: string | null | undefined) {
  if (!d) return ''
  try {
    return format(new Date(d), 'dd/MM/yyyy')
  } catch {
    return d
  }
}

type ApiClient = {
  get: <T>(url: string, params?: Record<string, unknown>) => Promise<T>
}

export async function fetchAllIssuesMatchingFilters(
  api: ApiClient,
  filters: IssueListFilterInput,
): Promise<any[]> {
  const pageSize = 500
  let page = 1
  const all: any[] = []
  let total = 0

  while (page <= 100) {
    const data = await api.get<{ count?: number; next?: string | null; results?: unknown[] }>(
      '/api/issues/',
      buildIssueListParams({ ...filters, page, page_size: pageSize }),
    )
    const batch = normalizeApiList(data)
    all.push(...batch)
    total = typeof data?.count === 'number' ? data.count : all.length
    if (!batch.length || all.length >= total) break
    if (!data?.next && batch.length < pageSize) break
    page += 1
  }

  return all
}

export function exportIssuesToExcel(options: {
  issues: any[]
  projectKey?: string
  projectName?: string
  filterSummary?: string
}) {
  const { issues, projectKey, projectName, filterSummary } = options
  const exportDate = format(new Date(), 'dd/MM/yyyy HH:mm')
  const title = projectName || projectKey || 'Project'

  const rowsHtml = issues
    .map((issue, idx) => {
      const bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff'
      return `<tr>
        <td style="background:${bg};border:1px solid #e2e8f0;padding:4px 8px;text-align:center;color:#64748b">${idx + 1}</td>
        <td style="background:${bg};border:1px solid #e2e8f0;padding:4px 8px;font-family:Consolas,monospace">${escapeHtml(issue.issue_key || '')}</td>
        <td style="background:${bg};border:1px solid #e2e8f0;padding:4px 8px">${escapeHtml(issue.title || '')}</td>
        <td style="background:${bg};border:1px solid #e2e8f0;padding:4px 8px">${escapeHtml(TYPE_LABELS[issue.issue_type] || issue.issue_type || '')}</td>
        <td style="background:${bg};border:1px solid #e2e8f0;padding:4px 8px">${escapeHtml(STATUS_LABELS[issue.status] || issue.status || '')}</td>
        <td style="background:${bg};border:1px solid #e2e8f0;padding:4px 8px">${escapeHtml(PRIORITY_LABELS[issue.priority] || issue.priority || '')}</td>
        <td style="background:${bg};border:1px solid #e2e8f0;padding:4px 8px">${escapeHtml(issue.assignee?.full_name || '')}</td>
        <td style="background:${bg};border:1px solid #e2e8f0;padding:4px 8px">${escapeHtml(issue.reporter?.full_name || '')}</td>
        <td style="background:${bg};border:1px solid #e2e8f0;padding:4px 8px;text-align:center">${issue.story_points ?? ''}</td>
        <td style="background:${bg};border:1px solid #e2e8f0;padding:4px 8px">${fmtDate(issue.due_date)}</td>
        <td style="background:${bg};border:1px solid #e2e8f0;padding:4px 8px">${fmtDate(issue.created_at)}</td>
        <td style="background:${bg};border:1px solid #e2e8f0;padding:4px 8px">${fmtDate(issue.updated_at)}</td>
      </tr>`
    })
    .join('')

  const html = `
    <!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head><meta charset="UTF-8" /></head>
    <body>
      <h2 style="font-family:Calibri,Arial">${escapeHtml(title)} — Danh sách Issues</h2>
      <p style="font-family:Calibri,Arial;color:#64748b;font-size:11px">
        Xuất ngày ${exportDate} · ${issues.length} dòng
        ${filterSummary ? ` · ${escapeHtml(filterSummary)}` : ''}
      </p>
      <table border="1" style="border-collapse:collapse;font-family:Calibri,Arial;font-size:11px">
        <thead>
          <tr style="background:#C41230;color:#fff">
            <th>STT</th><th>Mã</th><th>Tiêu đề</th><th>Loại</th><th>Trạng thái</th><th>Ưu tiên</th>
            <th>Người thực hiện</th><th>Người tạo</th><th>SP</th><th>Deadline</th><th>Ngày tạo</th><th>Cập nhật</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </body>
    </html>
  `.trim()

  const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `issues-${projectKey || 'project'}-${format(new Date(), 'yyyyMMdd-HHmm')}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
