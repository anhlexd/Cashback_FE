<template>
  <div class="space-y-3">
    <!-- Toolbar repo -->
    <div class="card p-3">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div class="flex items-center gap-2 shrink-0">
          <CodeBracketIcon class="w-4 h-4 text-gray-500" />
          <span class="text-sm font-semibold text-gray-900 dark:text-white">Repository</span>
        </div>

        <div v-if="reposLoading" class="text-xs text-gray-400">Đang tải…</div>
        <p v-else-if="!linkedRepos.length" class="text-xs text-gray-500 flex-1">
          Chưa có repo —
          <NuxtLink to="/github" class="text-brand-600 hover:underline">Thêm GitHub</NuxtLink>
        </p>
        <div v-else class="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          <label
            class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium cursor-pointer shrink-0"
            :class="scopeAllProject
              ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-950/40'
              : 'border-surface-200 dark:border-dark-50'"
          >
            <input v-model="scopeAllProject" type="checkbox" class="rounded border-gray-300 w-3 h-3" @change="onScopeAllChange" />
            Cả dự án ({{ linkedRepos.length }})
          </label>
          <div
            class="flex flex-wrap gap-1.5 flex-1 min-w-0"
            :class="scopeAllProject && 'opacity-50 pointer-events-none'"
          >
            <label
              v-for="repo in linkedRepos"
              :key="repo.id"
              class="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-mono cursor-pointer"
              :class="selectedRepoIds.includes(repo.id)
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                : 'border-surface-200 dark:border-dark-50'"
            >
              <input
                type="checkbox"
                :checked="selectedRepoIds.includes(repo.id)"
                class="rounded w-3 h-3"
                @change="toggleRepo(repo.id)"
              />
              {{ repo.full_name }}
            </label>
          </div>
        </div>

        <div class="flex items-center gap-2 ml-auto shrink-0">
          <NuxtLink to="/github" class="btn-ghost btn-sm text-xs py-1">GitHub</NuxtLink>
          <button
            v-if="activeSection === 'graph'"
            type="button"
            class="btn-secondary btn-sm py-1"
            :disabled="loading || !hasSelection"
            @click="loadGraph"
          >
            <ArrowPathIcon class="w-3.5 h-3.5" :class="loading && 'animate-spin'" />
            Vẽ lại
          </button>
        </div>
      </div>
    </div>

    <!-- Tab điều hướng -->
    <div class="flex flex-wrap gap-1 p-1 rounded-lg bg-surface-100 dark:bg-dark-50 border border-surface-200 dark:border-dark-50 w-fit max-w-full">
      <button
        type="button"
        class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        :class="activeSection === 'graph'
          ? 'bg-white dark:bg-dark-100 shadow-sm text-brand-700 dark:text-brand-300'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'"
        @click="activeSection = 'graph'"
      >
        <SparklesIcon class="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
        Sơ đồ
      </button>
      <button
        v-if="isAdmin"
        type="button"
        class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        :class="activeSection === 'cursor'
          ? 'bg-white dark:bg-dark-100 shadow-sm text-violet-700 dark:text-violet-300'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'"
        @click="activeSection = 'cursor'"
      >
        <CpuChipIcon class="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
        Phân tích Cursor
      </button>
      <button
        type="button"
        class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        :class="activeSection === 'ai'
          ? 'bg-white dark:bg-dark-100 shadow-sm text-brand-700 dark:text-brand-300'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'"
        @click="activeSection = 'ai'"
      >
        <ChatBubbleLeftRightIcon class="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
        Hỏi AI
      </button>
    </div>

    <!-- Panel: Sơ đồ -->
    <div v-show="activeSection === 'graph'" class="space-y-3">
      <div v-if="!hasSelection" class="card p-8 text-center text-sm text-gray-400">
        Chọn repo hoặc <strong>Cả dự án</strong> để xem sơ đồ.
      </div>
      <div v-else-if="loading" class="card p-10 text-center text-sm text-gray-400">
        <span class="inline-block w-6 h-6 border-2 border-brand-500/30 border-t-brand-600 rounded-full animate-spin" />
        <p class="mt-2">Đang xây dựng Knowledge Graph…</p>
      </div>
      <div v-else-if="error" class="card p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20">{{ error }}</div>
      <template v-else-if="graph">
        <div class="card p-3 flex flex-wrap items-center gap-3">
          <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ graphSubtitle }}</span>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="s in statCards"
              :key="s.label"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-100 dark:bg-dark-50 text-xs"
            >
              <span class="font-bold">{{ s.value }}</span>
              <span class="text-gray-400">{{ s.label }}</span>
            </span>
          </div>
          <span class="text-[10px] text-gray-400 ml-auto">{{ graph?.openai_configured ? 'OpenAI' : 'Rule-based' }}</span>
        </div>

        <div
          v-if="graph.insights?.length"
          class="card p-3 text-xs text-gray-600 dark:text-gray-300 space-y-1 max-h-32 overflow-y-auto"
        >
          <div class="font-semibold text-brand-700 dark:text-brand-300 mb-1">Insights</div>
          <p v-for="(line, i) in graph.insights" :key="i" class="flex gap-2">
            <span class="text-brand-500">•</span><span>{{ line }}</span>
          </p>
        </div>

        <ClientOnly>
          <KnowledgeGraphViewer
            v-if="graphViewerData"
            :graph-data="graphViewerData"
            :height="480"
            :default-mode="kgDefaultMode"
            @ask-about="onAskAboutIssue"
          />
          <template #fallback>
            <div class="card p-8 text-center text-sm text-gray-400">Đang tải graph…</div>
          </template>
        </ClientOnly>
      </template>
    </div>

    <!-- Panel: Cursor — full width -->
    <div v-show="activeSection === 'cursor' && isAdmin">
      <ProjectKnowledgeGraphCursorPanel
        :project-id="projectId"
        :selected-repo-ids="effectiveRepoIds"
        :scope-all-project="scopeAllProject"
        :linked-repos="selectedReposMeta"
        @published="onCursorPublished"
      />
    </div>

    <!-- Panel: Hỏi AI -->
    <div v-show="activeSection === 'ai'" class="card p-4">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <ChatBubbleLeftRightIcon class="w-4 h-4 text-brand-600" />
        Hỏi Knowledge Graph AI
      </h3>
      <div v-if="!hasSelection" class="text-sm text-gray-400">Chọn repo trước khi hỏi.</div>
      <template v-else>
        <div class="space-y-2 min-h-[200px] max-h-[360px] overflow-y-auto mb-3 rounded-lg border border-surface-100 dark:border-dark-50 p-3 bg-surface-50/50 dark:bg-dark-50/30">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="text-sm rounded-lg px-3 py-2"
            :class="msg.role === 'user' ? 'bg-brand-50 ml-8' : 'bg-white dark:bg-dark-100 mr-8 border border-surface-100 dark:border-dark-50'"
          >
            <span v-if="msg.mode === 'ai'" class="text-[10px] text-brand-600 font-medium block mb-0.5">OpenAI</span>
            <span class="whitespace-pre-wrap">{{ msg.text }}</span>
          </div>
          <p v-if="!messages.length" class="text-sm text-gray-400 text-center py-8">Đặt câu hỏi về dự án, luồng API, contributor…</p>
        </div>
        <form class="flex gap-2" @submit.prevent="askAi">
          <input
            v-model="question"
            class="input flex-1"
            placeholder="VD: Tổng quan kiến trúc, ai commit nhiều nhất?"
            :disabled="asking"
          />
          <button type="submit" class="btn-primary" :disabled="asking || !question.trim()">
            {{ asking ? 'Đang trả lời…' : 'Gửi' }}
          </button>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  SparklesIcon, ArrowPathIcon, ChatBubbleLeftRightIcon, CodeBracketIcon, CpuChipIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  projectId: number
  projectKey?: string
}>()

const api = useApi()
const config = useRuntimeConfig()
const authStore = useAuthStore()
const kgDefaultMode = (config.public.kgGraphMode === '3d' ? '3d' : '2d') as '2d' | '3d'

const isAdmin = computed(() => authStore.user?.role === 'admin')
const activeSection = ref<'graph' | 'cursor' | 'ai'>('graph')

const loading = ref(true)
const reposLoading = ref(true)
const error = ref('')
const graph = ref<any>(null)
const linkedRepos = ref<any[]>([])
const selectedRepoIds = ref<number[]>([])
const scopeAllProject = ref(false)
const question = ref('')
const asking = ref(false)
const messages = ref<{ role: 'user' | 'assistant'; text: string; mode?: string }[]>([])

const effectiveRepoIds = computed(() =>
  scopeAllProject.value ? linkedRepos.value.map((r) => r.id) : selectedRepoIds.value,
)

const selectedReposMeta = computed(() => {
  const ids = new Set(effectiveRepoIds.value)
  return linkedRepos.value
    .filter((r) => ids.has(r.id))
    .map((r) => ({
      id: r.id,
      full_name: r.full_name,
      default_branch: r.default_branch || 'main',
    }))
})

const hasSelection = computed(() =>
  scopeAllProject.value || selectedRepoIds.value.length > 0,
)

const graphSubtitle = computed(() => {
  if (scopeAllProject.value) return `Cả dự án ${props.projectKey || ''}`
  if (graph.value?.filter_repo_name) return graph.value.filter_repo_name
  return selectionSummary.value || '—'
})

const selectionSummary = computed(() => {
  if (scopeAllProject.value) {
    return `Toàn bộ ${linkedRepos.value.length} repo`
  }
  if (!selectedRepoIds.value.length) return ''
  return linkedRepos.value
    .filter((r) => selectedRepoIds.value.includes(r.id))
    .map((r) => r.full_name)
    .join(', ')
})

const graphViewerData = computed(() => {
  if (!graph.value?.nodes?.length) return null
  return { nodes: graph.value.nodes, edges: graph.value.edges }
})

const statCards = computed(() => {
  const s = graph.value?.stats || {}
  return [
    { label: 'Repos', value: s.repositories ?? 0 },
    { label: 'Issues', value: s.issues ?? 0 },
    { label: 'Commits', value: s.commits ?? 0 },
    { label: 'PRs', value: s.pull_requests ?? 0 },
    { label: 'Nodes', value: s.nodes ?? 0 },
  ]
})

function graphQueryParams() {
  if (scopeAllProject.value) {
    return { scope: 'project' }
  }
  return { repo_ids: effectiveRepoIds.value.join(',') }
}

function onScopeAllChange() {
  if (scopeAllProject.value) {
    selectedRepoIds.value = linkedRepos.value.map((r) => r.id)
  }
  messages.value = []
  loadGraph()
}

function toggleRepo(repoId: number) {
  scopeAllProject.value = false
  const idx = selectedRepoIds.value.indexOf(repoId)
  if (idx >= 0) {
    selectedRepoIds.value = selectedRepoIds.value.filter((id) => id !== repoId)
  } else {
    selectedRepoIds.value = [...selectedRepoIds.value, repoId]
  }
  if (selectedRepoIds.value.length === linkedRepos.value.length && linkedRepos.value.length > 1) {
    scopeAllProject.value = true
  }
  messages.value = []
  loadGraph()
}

function onAskAboutIssue(issueKey: string) {
  activeSection.value = 'ai'
  question.value = `Liên kết GitHub của ${issueKey}`
  askAi()
}

function onCursorPublished() {
  loadGraph()
}

async function loadLinkedRepos() {
  reposLoading.value = true
  try {
    const data = await api.get('/api/github/repos/', {
      project: props.projectId,
      project_id: props.projectId,
    })
    const list = (data.results || data || []).filter(
      (r: any) => Number(r.project) === Number(props.projectId),
    )
    linkedRepos.value = list
    if (list.length && !selectedRepoIds.value.length && !scopeAllProject.value) {
      selectedRepoIds.value = [list[0].id]
    }
    if (scopeAllProject.value) {
      selectedRepoIds.value = list.map((r: any) => r.id)
    }
  } catch {
    linkedRepos.value = []
    selectedRepoIds.value = []
  } finally {
    reposLoading.value = false
  }
}

async function loadGraph() {
  if (!hasSelection.value) {
    graph.value = null
    loading.value = false
    return
  }
  loading.value = true
  error.value = ''
  try {
    graph.value = await api.get(
      `/api/projects/${props.projectId}/knowledge-graph/`,
      graphQueryParams(),
    )
    if (graph.value?.insights?.length && activeSection.value !== 'ai') {
      const hint = graph.value.insights.join('\n')
      if (!messages.value.length || messages.value[messages.value.length - 1]?.text !== hint) {
        messages.value = [{ role: 'assistant', text: hint }]
      }
    }
  } catch (err: any) {
    error.value = err?.data?.detail || 'Không tải được graph'
  } finally {
    loading.value = false
  }
}

async function askAi() {
  const q = question.value.trim()
  if (!q || asking.value || !hasSelection.value) return
  if (!graph.value) await loadGraph()
  messages.value.push({ role: 'user', text: q })
  asking.value = true
  question.value = ''
  try {
    const body: Record<string, unknown> = {
      question: q,
      use_cached_graph: true,
      graph: graph.value,
      ...graphQueryParams(),
    }
    const res = await api.post(`/api/projects/${props.projectId}/knowledge-graph/query/`, body)
    messages.value.push({ role: 'assistant', text: res.answer || '—', mode: res.mode })
  } catch (err: any) {
    messages.value.push({ role: 'assistant', text: err?.data?.detail || 'Lỗi' })
  } finally {
    asking.value = false
  }
}

onMounted(async () => {
  await loadLinkedRepos()
  await loadGraph()
})

watch(() => props.projectId, async () => {
  selectedRepoIds.value = []
  scopeAllProject.value = false
  graph.value = null
  activeSection.value = 'graph'
  await loadLinkedRepos()
  await loadGraph()
})
</script>
