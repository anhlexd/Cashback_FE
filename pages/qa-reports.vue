<template>
  <div class="p-6 max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ChartBarIcon class="w-7 h-7 text-brand-500" />
          Báo cáo QA & Hiệu suất
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">Thống kê chất lượng phát triển phần mềm</p>
      </div>
      <div class="flex gap-2">
        <select v-model="selectedProject" class="input py-1.5 text-sm w-44" @change="loadData">
          <option value="">Tất cả projects</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <select v-model="period" class="input py-1.5 text-sm w-28" @change="loadData">
          <option value="7">7 ngày</option>
          <option value="30">30 ngày</option>
          <option value="90">90 ngày</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="h-24 card animate-pulse"></div>
    </div>

    <template v-else>
      <!-- KPI row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4">
          <div class="text-2xl font-black text-gray-900 dark:text-white">{{ kpi.total_done }}</div>
          <div class="text-xs text-gray-500 mt-1">✅ Issues hoàn thành</div>
        </div>
        <div class="card p-4">
          <div class="text-2xl font-black" :class="kpi.pass_rate >= 80 ? 'text-green-600' : 'text-orange-500'">
            {{ kpi.pass_rate }}%
          </div>
          <div class="text-xs text-gray-500 mt-1">🧪 Tỷ lệ pass lần đầu</div>
        </div>
        <div class="card p-4">
          <div class="text-2xl font-black text-red-500">{{ kpi.total_bugs }}</div>
          <div class="text-xs text-gray-500 mt-1">🐛 Bugs phát sinh</div>
        </div>
        <div class="card p-4">
          <div class="text-2xl font-black text-brand-600 dark:text-brand-400">
            {{ kpi.avg_total_time || 'N/A' }}
          </div>
          <div class="text-xs text-gray-500 mt-1">⏱ Avg thời gian/task</div>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Time breakdown per task -->
        <div class="card p-5">
          <h3 class="font-semibold text-sm text-gray-900 dark:text-white mb-4">⏱ Phân tích thời gian hoàn thành</h3>
          <div v-if="completedIssues.length === 0" class="text-sm text-gray-400 text-center py-6">
            Chưa có task nào hoàn thành
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="issue in completedIssues.slice(0, 8)"
              :key="issue.id"
              class="space-y-1"
            >
              <div class="flex justify-between text-xs">
                <button @click="selectedIssueId = issue.id" class="font-mono text-brand-600 dark:text-brand-400 hover:underline">
                  {{ issue.issue_key }}
                </button>
                <div class="flex gap-2 text-gray-400">
                  <span class="text-blue-500">{{ issue.dev_time || '?' }} dev</span>
                  <span v-if="issue.bug_time" class="text-red-500">+{{ issue.bug_time }} bug</span>
                  <span class="font-medium text-gray-700 dark:text-gray-300">= {{ issue.total_time || '?' }}</span>
                </div>
              </div>
              <div class="flex h-2 rounded-full overflow-hidden bg-surface-200 dark:bg-dark-50">
                <div class="bg-blue-500 h-full transition-all"
                     :style="{ width: issue.dev_pct + '%' }"
                     title="Dev time"></div>
                <div class="bg-red-400 h-full transition-all"
                     :style="{ width: issue.bug_pct + '%' }"
                     title="Bug fixing"></div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3 mt-3 text-xs text-gray-400">
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-blue-500"></span>Dev coding</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-red-400"></span>Bug fixing</span>
          </div>
        </div>

        <!-- Bug rate by developer -->
        <div class="card p-5">
          <h3 class="font-semibold text-sm text-gray-900 dark:text-white mb-4">👨‍💻 Chất lượng code theo Developer</h3>
          <div v-if="devStats.length === 0" class="text-sm text-gray-400 text-center py-6">Chưa có dữ liệu</div>
          <div v-else class="space-y-4">
            <div v-for="dev in devStats" :key="dev.id" class="space-y-1">
              <div class="flex items-center gap-2">
                <UserAvatar :user="dev" size="xs" />
                <span class="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">{{ dev.full_name }}</span>
                <span class="text-xs font-bold" :class="dev.pass_rate >= 80 ? 'text-green-600' : 'text-orange-500'">
                  {{ dev.pass_rate }}% pass
                </span>
              </div>
              <div class="flex items-center gap-3 text-xs text-gray-400 pl-6">
                <span>{{ dev.done_count }} tasks</span>
                <span class="text-red-500">{{ dev.bug_count }} bugs</span>
                <span>avg {{ dev.avg_time || 'N/A' }}</span>
              </div>
              <div class="pl-6">
                <div class="w-full h-1.5 bg-surface-200 dark:bg-dark-50 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all"
                       :class="dev.pass_rate >= 80 ? 'bg-green-500' : 'bg-orange-500'"
                       :style="{ width: dev.pass_rate + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- QA Tester performance -->
        <div class="card p-5">
          <h3 class="font-semibold text-sm text-gray-900 dark:text-white mb-4">🧪 Hiệu suất Tester</h3>
          <div v-if="testerStats.length === 0" class="text-sm text-gray-400 text-center py-6">Chưa có dữ liệu</div>
          <div v-else class="space-y-4">
            <div v-for="tester in testerStats" :key="tester.id">
              <div class="flex items-center gap-2 mb-1">
                <UserAvatar :user="tester" size="xs" />
                <span class="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">{{ tester.full_name }}</span>
                <span class="badge bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs">
                  {{ tester.sessions_count }} sessions
                </span>
              </div>
              <div class="flex items-center gap-4 text-xs text-gray-500 pl-6">
                <span>✅ {{ tester.passed }} passed</span>
                <span class="text-red-500">❌ {{ tester.failed }} failed</span>
                <span>🐛 {{ tester.bugs_found }} bugs found</span>
                <span>avg {{ tester.avg_session_time || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bug type breakdown -->
        <div class="card p-5">
          <h3 class="font-semibold text-sm text-gray-900 dark:text-white mb-4">🔍 Bugs theo độ ưu tiên</h3>
          <div class="space-y-3">
            <div v-for="item in bugPriorityStats" :key="item.priority">
              <div class="flex justify-between text-xs mb-1">
                <span :class="`priority-${item.priority}`">{{ item.label }}</span>
                <span class="font-medium text-gray-700 dark:text-gray-300">{{ item.count }} bugs</span>
              </div>
              <div class="w-full h-2 bg-surface-200 dark:bg-dark-50 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all" :class="item.barColor"
                     :style="{ width: item.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent completed issues with time -->
      <div class="card overflow-hidden">
        <div class="flex items-center gap-3 px-5 py-3.5 border-b border-surface-200 dark:border-dark-50">
          <CheckCircleIcon class="w-4 h-4 text-green-500" />
          <h3 class="font-semibold text-sm text-gray-900 dark:text-white">Tasks hoàn thành gần đây</h3>
        </div>
        <div class="divide-y divide-surface-100 dark:divide-dark-50">
          <div
            v-for="issue in completedIssues.slice(0, 10)"
            :key="issue.id"
            class="flex items-center gap-4 px-5 py-3 hover:bg-surface-50 dark:hover:bg-dark-50/50 cursor-pointer"
            @click="selectedIssueId = issue.id"
          >
            <IssueTypeIcon :type="issue.issue_type" class="w-4 h-4 flex-shrink-0" />
            <span class="font-mono text-xs text-gray-400 w-20 flex-shrink-0">{{ issue.issue_key }}</span>
            <span class="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">{{ issue.title }}</span>

            <div class="flex items-center gap-3 text-xs flex-shrink-0">
              <span class="text-blue-500">⌨️ {{ issue.dev_time || '—' }}</span>
              <span v-if="issue.bug_time" class="text-red-500">🐛 {{ issue.bug_time }}</span>
              <span class="font-semibold text-gray-700 dark:text-gray-300">Σ {{ issue.total_time || '—' }}</span>
              <span v-if="issue.bug_count > 0" class="badge bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {{ issue.bug_count }} bugs
              </span>
              <span class="badge bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">Done</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <IssueModal v-if="selectedIssueId" :issue-id="selectedIssueId" @close="selectedIssueId = null" />
  </div>
</template>

<script setup lang="ts">
import { ChartBarIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const projectsStore = useProjectsStore()

const selectedProject = ref('')
const period = ref('30')
const loading = ref(true)
const selectedIssueId = ref<number | null>(null)

const allIssues = ref<any[]>([])
const testSessions = ref<any[]>([])
const projects = computed(() => projectsStore.projects)

// ── Computed stats ──────────────────────────────────────────────────────────

const completedIssues = computed(() => {
  return allIssues.value
    .filter(i => i.status === 'done' && i.issue_type !== 'bug')
    .map(i => {
      const devSecs  = calcSecs(i.dev_started_at, i.dev_completed_at)
      const bugSecs  = calcChildBugSecs(i)
      const totalSec = (devSecs || 0) + (bugSecs || 0)
      const bugs     = allIssues.value.filter(b => b.parent === i.id && b.issue_type === 'bug')
      const maxSec   = Math.max(totalSec, 1)
      return {
        ...i,
        dev_time:  fmt(devSecs),
        bug_time:  fmt(bugSecs),
        total_time: fmt(totalSec || null),
        bug_count: bugs.length,
        dev_pct:   Math.round(((devSecs || 0) / maxSec) * 100),
        bug_pct:   Math.round(((bugSecs || 0) / maxSec) * 100),
      }
    })
    .sort((a: any, b: any) => new Date(b.resolved_at).getTime() - new Date(a.resolved_at).getTime())
})

const kpi = computed(() => {
  const done      = completedIssues.value
  const totalBugs = allIssues.value.filter(i => i.issue_type === 'bug').length
  const passFirst = done.filter(i => i.bug_count === 0).length
  const passRate  = done.length ? Math.round((passFirst / done.length) * 100) : 0
  const avgSec    = done.length
    ? done.reduce((s: number, i: any) => s + (calcSecs(i.dev_started_at, i.resolved_at) || 0), 0) / done.length
    : null
  return {
    total_done: done.length,
    pass_rate: passRate,
    total_bugs: totalBugs,
    avg_total_time: fmt(avgSec),
  }
})

const devStats = computed(() => {
  const devMap: Record<number, any> = {}
  for (const issue of completedIssues.value) {
    const dev = issue.assignee
    if (!dev) continue
    if (!devMap[dev.id]) {
      devMap[dev.id] = { ...dev, done_count: 0, bug_count: 0, pass_count: 0, total_sec: 0 }
    }
    devMap[dev.id].done_count++
    devMap[dev.id].bug_count += issue.bug_count
    if (issue.bug_count === 0) devMap[dev.id].pass_count++
    const secs = calcSecs(issue.dev_started_at, issue.dev_completed_at)
    if (secs) devMap[dev.id].total_sec += secs
  }
  return Object.values(devMap).map((d: any) => ({
    ...d,
    pass_rate: d.done_count ? Math.round((d.pass_count / d.done_count) * 100) : 0,
    avg_time: fmt(d.done_count ? d.total_sec / d.done_count : null),
  })).sort((a: any, b: any) => b.done_count - a.done_count)
})

const testerStats = computed(() => {
  const map: Record<number, any> = {}
  for (const issue of allIssues.value) {
    const tester = issue.tester
    if (!tester || issue.issue_type === 'bug') continue
    if (!map[tester.id]) {
      map[tester.id] = { ...tester, sessions_count: 0, passed: 0, failed: 0, bugs_found: 0, total_sec: 0 }
    }
    if (issue.status === 'done') map[tester.id].passed++
    map[tester.id].bugs_found += issue.total_bug_count || 0
  }
  return Object.values(map).sort((a: any, b: any) => b.passed - a.passed)
})

const bugPriorityStats = computed(() => {
  const bugs = allIssues.value.filter(i => i.issue_type === 'bug')
  const total = bugs.length || 1
  return [
    { priority: 'critical', label: 'Critical', barColor: 'bg-red-600' },
    { priority: 'high',     label: 'High',     barColor: 'bg-orange-500' },
    { priority: 'medium',   label: 'Medium',   barColor: 'bg-yellow-400' },
    { priority: 'low',      label: 'Low',      barColor: 'bg-green-500' },
  ].map(p => ({
    ...p,
    count: bugs.filter(b => b.priority === p.priority).length,
    pct:   Math.round(bugs.filter(b => b.priority === p.priority).length / total * 100),
  }))
})

// ── Helpers ─────────────────────────────────────────────────────────────────

function calcSecs(start: string | null, end: string | null): number | null {
  if (!start) return null
  const s = new Date(start).getTime()
  const e = end ? new Date(end).getTime() : Date.now()
  return Math.floor((e - s) / 1000)
}

function calcChildBugSecs(issue: any): number | null {
  const bugs = allIssues.value.filter(b => b.parent === issue.id && b.issue_type === 'bug')
  let total = 0
  for (const bug of bugs) {
    const s = calcSecs(bug.dev_started_at, bug.resolved_at)
    if (s) total += s
  }
  return total > 0 ? total : null
}

function fmt(secs: number | null): string | null {
  if (!secs) return null
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h > 0) return `${h}h${m > 0 ? m + 'm' : ''}`
  if (m > 0) return `${m}m`
  return `${secs}s`
}

async function loadData() {
  loading.value = true
  try {
    const params: any = {}
    if (selectedProject.value) params.project = selectedProject.value
    const data = await api.get('/api/issues/', params)
    allIssues.value = data.results || data
  } finally { loading.value = false }
}

onMounted(async () => {
  await projectsStore.fetchProjects()
  if (projects.value.length) selectedProject.value = projects.value[0].id
  await loadData()
})
</script>
