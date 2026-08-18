export type IssueDateField = 'due_date' | 'created_at' | 'updated_at'

export interface IssueListFilterInput {
  projectId: number
  page?: number
  page_size?: number
  ordering?: string
  q?: string
  status?: string
  issue_type?: string
  assignee?: number
  assignee__isnull?: boolean
  sprint?: number
  sprint__isnull?: boolean
  date_field?: IssueDateField
  date_from?: string
  date_to?: string
}

export function buildIssueListParams(
  input: IssueListFilterInput,
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {
    project: input.projectId,
    ordering: input.ordering ?? '-updated_at',
  }

  if (input.page != null) params.page = input.page
  if (input.page_size != null) params.page_size = input.page_size
  if (input.q?.trim()) params.q = input.q.trim()
  if (input.status) params.status = input.status
  if (input.issue_type) params.issue_type = input.issue_type
  if (input.assignee__isnull) params.assignee__isnull = true
  else if (input.assignee != null) params.assignee = input.assignee
  if (input.sprint != null) params.sprint = input.sprint
  if (input.sprint__isnull != null) params.sprint__isnull = input.sprint__isnull

  const from = input.date_from?.trim()
  const to = input.date_to?.trim()
  if (from || to) {
    const field = input.date_field || 'due_date'
    if (field === 'due_date') {
      if (from) params.due_date_gte = from
      if (to) params.due_date_lte = to
    } else if (field === 'created_at') {
      if (from) params.created_at_gte = from
      if (to) params.created_at_lte = to
    } else {
      if (from) params.updated_at_gte = from
      if (to) params.updated_at_lte = to
    }
  }

  return params
}
