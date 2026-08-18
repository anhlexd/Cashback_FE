// stores/projects.ts
import { defineStore } from 'pinia'
import { normalizeApiList } from '~/utils/apiList'

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [] as any[],
    currentProject: null as any,
    currentSprints: [] as any[],
    loading: false,
    projectsFetchedAt: 0,
    _fetchProjectsPromise: null as Promise<void> | null,
    _projectFetchedAt: {} as Record<number, number>,
    _projectPromises: {} as Record<number, Promise<any> | undefined>,
  }),

  getters: {
    activeSpring: (state) => state.currentSprints.find(s => s.status === 'active'),
    planningSprints: (state) => state.currentSprints.filter(s => s.status === 'planning'),
    completedSprints: (state) => state.currentSprints.filter(s => s.status === 'completed'),
  },

  actions: {
    async fetchProjects(opts?: { force?: boolean }) {
      const TTL_MS = 60_000
      const now = Date.now()
      if (
        !opts?.force &&
        this.projects.length > 0 &&
        now - this.projectsFetchedAt < TTL_MS
      ) {
        return
      }
      if (this._fetchProjectsPromise && !opts?.force) {
        return this._fetchProjectsPromise
      }

      const api = useApi()
      this.loading = true
      const req = (async () => {
        try {
          const data = await api.get('/api/projects/', { page_size: 200 })
          this.projects = normalizeApiList(data)
          this.projectsFetchedAt = Date.now()
        } finally {
          this.loading = false
          this._fetchProjectsPromise = null
        }
      })()
      this._fetchProjectsPromise = req
      return req
    },

    async fetchProject(id: number, opts?: { force?: boolean }) {
      const TTL_MS = 30_000
      const now = Date.now()
      // Dedupe: middleware (project-member) + page onMounted gọi gần như cùng lúc
      if (
        !opts?.force &&
        this.currentProject?.id === id &&
        now - (this._projectFetchedAt[id] || 0) < TTL_MS
      ) {
        return this.currentProject
      }
      if (!opts?.force && this._projectPromises[id]) {
        return this._projectPromises[id]
      }
      const api = useApi()
      const req = (async () => {
        try {
          const data = await api.get(`/api/projects/${id}/`)
          this.currentProject = data
          this._projectFetchedAt[id] = Date.now()
          return data
        } finally {
          this._projectPromises[id] = undefined
        }
      })()
      this._projectPromises[id] = req
      return req
    },

    async createProject(payload: any) {
      const api = useApi()
      const project = await api.post('/api/projects/', payload)
      this.projects.unshift(project)
      return project
    },

    async updateProject(id: number, payload: any) {
      const api = useApi()
      const project = await api.patch(`/api/projects/${id}/`, payload)
      const idx = this.projects.findIndex(p => p.id === id)
      if (idx !== -1) this.projects[idx] = project
      this.currentProject = project
      this._projectFetchedAt[id] = Date.now()
      return project
    },

    async fetchProjectStats(id: number) {
      const api = useApi()
      return api.get(`/api/projects/${id}/stats/`)
    },

    async fetchSprints(projectId: number) {
      const api = useApi()
      const data = await api.get('/api/sprints/', { project: projectId, page_size: 500 })
      this.currentSprints = data.results || data
      return this.currentSprints
    },

    async createSprint(payload: any) {
      const api = useApi()
      const sprint = await api.post('/api/sprints/', payload)
      this.currentSprints.unshift(sprint)
      return sprint
    },

    async startSprint(id: number) {
      const api = useApi()
      const sprint = await api.post(`/api/sprints/${id}/start/`)
      const idx = this.currentSprints.findIndex(s => s.id === id)
      if (idx !== -1) this.currentSprints[idx] = sprint
      return sprint
    },

    async completeSprint(id: number, payload: any) {
      const api = useApi()
      const sprint = await api.post(`/api/sprints/${id}/complete/`, payload)
      const idx = this.currentSprints.findIndex(s => s.id === id)
      if (idx !== -1) this.currentSprints[idx] = sprint
      return sprint
    }
  }
})
