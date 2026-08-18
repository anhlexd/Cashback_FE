// stores/issues.ts
import { defineStore } from 'pinia'

export const useIssuesStore = defineStore('issues', {
  state: () => ({
    boardData: {} as Record<string, any[]>,
    issues: [] as any[],
    currentIssue: null as any,
    loading: false,
  }),

  actions: {
    async fetchBoard(projectId: number, sprintId?: number) {
      const api = useApi()
      this.loading = true
      try {
        const params: any = { project: projectId }
        if (sprintId) params.sprint = sprintId
        this.boardData = await api.get('/api/issues/board/', params)
      } finally {
        this.loading = false
      }
    },

    async fetchIssues(params: Record<string, any>) {
      const api = useApi()
      const data = await api.get('/api/issues/', params)
      this.issues = data.results || data
      return data
    },

    async fetchIssue(id: number) {
      const api = useApi()
      this.currentIssue = await api.get(`/api/issues/${id}/`)
      return this.currentIssue
    },

    async createIssue(payload: any) {
      const api = useApi()
      const issue = await api.post('/api/issues/', payload)
      return issue
    },

    async updateIssue(id: number, payload: any) {
      const api = useApi()
      const issue = await api.patch(`/api/issues/${id}/`, payload)
      if (this.currentIssue?.id === id) this.currentIssue = issue
      return issue
    },

    async moveIssue(id: number, payload: any) {
      const api = useApi()
      return api.post(`/api/issues/${id}/move/`, payload)
    },

    async deleteIssue(id: number) {
      const api = useApi()
      await api.delete(`/api/issues/${id}/`)
    },

    updateBoardLocally(issueId: number, fromStatus: string, toStatus: string, position: number) {
      const issue = this.boardData[fromStatus]?.find((i: any) => i.id === issueId)
      if (!issue) return
      this.boardData[fromStatus] = this.boardData[fromStatus].filter((i: any) => i.id !== issueId)
      if (!this.boardData[toStatus]) this.boardData[toStatus] = []
      const updated = { ...issue, status: toStatus }
      this.boardData[toStatus].splice(position, 0, updated)
    }
  }
})
