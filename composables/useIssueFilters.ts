// composables/useIssueFilters.ts
export const useIssueFilters = () => {
  const filters = reactive({
    search: '',
    status: '',
    priority: '',
    issue_type: '',
    assignee: null as number | null,
    sprint: null as number | null,
  })

  function applyFilters(issues: any[]) {
    return issues.filter(issue => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const title = (issue.title || '').toLowerCase()
        const key = (issue.issue_key || '').toLowerCase()
        const name = (issue.assignee?.full_name || '').toLowerCase()
        const email = (issue.assignee?.email || '').toLowerCase()
        if (!title.includes(q) && !key.includes(q) && !name.includes(q) && !email.includes(q)) {
          return false
        }
      }
      if (filters.status && issue.status !== filters.status) return false
      if (filters.priority && issue.priority !== filters.priority) return false
      if (filters.issue_type && issue.issue_type !== filters.issue_type) return false
      if (filters.assignee && issue.assignee?.id !== filters.assignee) return false
      if (filters.sprint !== null) {
        if (filters.sprint === 0 && issue.sprint !== null) return false
        if (filters.sprint > 0 && issue.sprint !== filters.sprint) return false
      }
      return true
    })
  }

  function toQueryParams() {
    const params: Record<string, any> = {}
    if (filters.search) params.search = filters.search
    if (filters.status) params.status = filters.status
    if (filters.priority) params.priority = filters.priority
    if (filters.issue_type) params.issue_type = filters.issue_type
    if (filters.assignee) params.assignee = filters.assignee
    if (filters.sprint !== null) params.sprint = filters.sprint || '__isnull=true'
    return params
  }

  function reset() {
    Object.assign(filters, {
      search: '', status: '', priority: '',
      issue_type: '', assignee: null, sprint: null,
    })
  }

  const hasActiveFilters = computed(() =>
    !!(filters.search || filters.status || filters.priority ||
       filters.issue_type || filters.assignee || filters.sprint !== null)
  )

  return { filters, applyFilters, toQueryParams, reset, hasActiveFilters }
}
